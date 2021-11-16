import { ETHERS, Token } from "@annex/sdk";
import React, { useMemo } from "react";
import styled from "styled-components";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../core";
import { useActiveWeb3React } from "../../hooks";
import Logo from "./Logo";
import CoinLogo from "./CoinLogo";

const getTokenLogoURL = (address) =>
	`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${address}/logo.png`;

const BNBLogoURLS = {
	56: '/images/coins/BNB.png',
	97: '/images/coins/BNB.png',
	339: '/images/coins/CRO.png',
	25: '/images/coins/CRO.png'
}

const StyledBnbLogo = styled.img`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
	box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
	border-radius: 24px;
`;

const StyledLogo = styled(Logo)`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
`;

export default function CurrencyLogo({
	currency,
	size = "24px",
	style,
}) {
	const { chainId } = useActiveWeb3React();
	const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.address : undefined);

	const srcs = useMemo(() => {
		if (currency === ETHERS[chainId]) return [];

		if (currency instanceof Token) {
			if (currency instanceof WrappedTokenInfo) {
				return [
					...uriLocations,
					`/images/coins/${currency?.symbol || "token"}.png`,
					getTokenLogoURL(currency.address),
				];
			}

			return [`/images/coins/${currency?.symbol || "token"}.png`, getTokenLogoURL(currency.address)];
		}
		return [];
	}, [currency, uriLocations]);

	if (currency === ETHERS[chainId]) {
		return <StyledBnbLogo src={BNBLogoURLS[chainId]} size={size} style={style} />;
	}

	return (currency)?.symbol ? (
		<CoinLogo size={size} srcs={srcs} alt={`${currency?.symbol || "token"} logo`} style={style} />
	) : (
		<StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol || "token"} logo`} style={style} />
	);
}
