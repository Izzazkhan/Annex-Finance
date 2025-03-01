import schema from "@uniswap/token-lists/src/tokenlist.schema.json";
import Ajv from "ajv";
import contenthashToUri from "./contenthashToUri";
import { parseENSAddress } from "./parseENSAddress";
import uriToHttp from "./uriToHttp";

import { DEFAULT_TOKEN_LIST_URL } from "../constants/lists";
import defaultTokenJson from "../constants/tokens/annex.json";

const tokenListValidator = new Ajv({ allErrors: true }).compile(schema);

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList(
	listUrl,
	resolveENSContentHash
) {
	if (listUrl === DEFAULT_TOKEN_LIST_URL) {
		return defaultTokenJson;
	}
	const parsedENS = parseENSAddress(listUrl);

	let urls;
	if (parsedENS) {
		let contentHashUri;
		try {
			contentHashUri = await resolveENSContentHash(parsedENS.ensName);
		} catch (error) {
			console.error(`Failed to resolve ENS name: ${parsedENS.ensName}`, error);
			throw new Error(`Failed to resolve ENS name: ${parsedENS.ensName}`);
		}
		let translatedUri;
		try {
			translatedUri = contenthashToUri(contentHashUri);
		} catch (error) {
			console.error("Failed to translate contenthash to URI", contentHashUri);
			throw new Error(`Failed to translate contenthash to URI: ${contentHashUri}`);
		}
		urls = uriToHttp(`${translatedUri}${parsedENS.ensPath || ""}`);
	} else {
		urls = uriToHttp(listUrl);
	}
	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		const isLast = i === urls.length - 1;
		let response;
		try {
			response = await fetch(url);
		} catch (error) {
			console.error("Failed to fetch list", listUrl, error);
			if (isLast) throw new Error(`Failed to download list ${listUrl}`);
			// eslint-disable-next-line no-continue
			continue;
		}

		if (!response.ok) {
			if (isLast) throw new Error(`Failed to download list ${listUrl}`);
			// eslint-disable-next-line no-continue
			continue;
		}

		const json = await response.json();
		if (!tokenListValidator(json)) {
			const validationErrors =
				tokenListValidator.errors?.reduce((memo, error) => {
					const add = `${error.dataPath} ${error.message || ""}`;
					return memo.length > 0 ? `${memo}; ${add}` : `${add}`;
				}, "") || "unknown error";
			throw new Error(`Token list failed validation: ${validationErrors}`);
		}
		// @ts-ignore
		return json;
	}
	throw new Error("Unrecognized list URL protocol.");
}
