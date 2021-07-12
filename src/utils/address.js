import { getAddress } from '@ethersproject/address';

export function isAddress(value) {
	try {
		return getAddress(value);
	} catch {
		return false;
	}
}

export function shortenAddress(address, chars = 4) {
	if(!address) {
		return '';
	}
	const parsed = isAddress(address);
	if (!parsed) {
		throw Error(`Invalid 'address' parameter '${address}'.`);
	}
	return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function showTokenOnExplorer(address) {
	const prefix = process.env.REACT_APP_ENV === 'dev' ? "testnet." : "";

	const url = `https://${prefix}bscscan.com/token/${address}`

	window.open(url, "_blank");

	return url;
}