import { getAddress } from '@ethersproject/address';
import { EXPLORERS } from 'utilities/constants';

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

export function showTokenOnExplorer(address, chainId) {
	const url = `${EXPLORERS[chainId]}token/${address}`

	window.open(url, "_blank");

	return url;
}