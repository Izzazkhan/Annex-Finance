const EXPLORERS = {
	56: "https://bscscan.com",
	97: "https://testnet.bscscan.com",
	339: 'https://cronos.crypto.org/cassini/explorer/',
	25: 'https://cronos.crypto.org/explorer',
};

export default function getExplorerLink(value, type = 'account', chainId) {
	const prefix = type === 'account'
		// eslint-disable-next-line no-mixed-spaces-and-tabs
	    ? 'address'
		: type === 'address'
		? 'address'
		: type === 'transaction'
		? "tx" : "";
	return `${EXPLORERS[chainId]}/${prefix}/${value}`
}