import styled from 'styled-components';
import React, {useState} from 'react';
import {useActiveWeb3React} from "../../hooks";

const Footer = props => {
	const { account, chainId, library } = useActiveWeb3React();
	const [blockNumber, setBlockNumber] = useState(undefined);

	const wrongNetwork = React.useMemo(() => {
		return (process.env.REACT_APP_ENV === 'prod' && chainId !== 56)
			|| (process.env.REACT_APP_ENV === 'dev' && chainId !== 97)
	}, [chainId])

	React.useEffect(() => {
		if(library && account && !wrongNetwork) {
			library.getBlockNumber()
				.then(res => {
					setBlockNumber(res);
				})
				.catch(e => console.log(e))
		}
	}, [library, account, wrongNetwork])

	return (
		<div className="flex justify-end items-center space-x-5 mt-12 mb-6">
			{blockNumber ? (
				<div className="flex flex-row items-center space-x-5">
					<div className="flex w-3 h-3 rounded-full bg-primary"/>
					<div className="text-white no-underline focus:outline-none">Latest Block: {blockNumber}</div>
				</div>
			) : null}
			<a href="#" className="text-white no-underline focus:outline-none">ANN</a>
			<a href="#" className="text-white no-underline focus:outline-none">Support</a>
			<a href="#" className="text-white no-underline focus:outline-none">Whitepaper</a>
		</div>
	)
}

export default Footer;