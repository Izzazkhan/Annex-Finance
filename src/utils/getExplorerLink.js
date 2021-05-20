export default function getExplorerLink(value, type = 'account') {
	const prefix = type === 'account'
		// eslint-disable-next-line no-mixed-spaces-and-tabs
	    ? 'address'
		: type === 'address'
		? 'address'
		: type === 'transaction'
		? "tx" : "";
	return `${process.env.REACT_APP_BSC_EXPLORER}/${prefix}/${value}`
}