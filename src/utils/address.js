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

export function showTokenOnExplorer(address, chainId) {
	const explorers = {
		56: 'https://bscscan.com/token/',
		97: 'https://testnet.bscscan.com/token',
		25: 'https://cronos.crypto.org/explorer/token',
		339: 'https://cronos.crypto.org/cassini/explorer/token',
	}

	const url = `${explorers[chainId]}${address}`

	window.open(url, "_blank");

	return url;
}