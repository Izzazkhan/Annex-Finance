import { Currency, currencyEquals, ETHERS, Token } from "@annex/sdk";
import { Text } from "rebass";
import { Box } from "rebass/styled-components";
import { FixedSizeList } from "react-window";
import { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useActiveWeb3React } from "../../../hooks";
import { useSelectedTokenList } from "../../../core";
import { isTokenOnList } from "../../../utils";
import { useCurrencyBalance } from "../../../hooks/wallet";
import CurrencyLogo from "../../common/CurrencyLogo";
import Loader from "../../UI/Loader";

function currencyKey(currency, chainId) {
	return currency instanceof Token ? currency.address : currency === ETHERS[chainId] ? "ETHER" : "";
}

const StyledBalanceText = styled(Text)`
	white-space: nowrap;
	overflow: hidden;
	max-width: 5rem;
	text-overflow: ellipsis;
  	color: white;
`;

const Row = styled(Box)`
	width: ${({ width }) => width || "100%"};
	display: flex;
	padding: 0;
	align-items: ${({ align }) => align || "center"};
	justify-content: ${({ justify }) => justify || "flex-start"};
	padding: ${({ padding }) => padding};
	border: ${({ border }) => border};
	border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowBetween = styled(Row)`
	justify-content: space-between;
`;

export const RowFixed = styled(Row)`
	width: fit-content;
	margin: ${({ gap }) => gap && `-${gap}`};
`;



export const MenuItem = styled(RowBetween)`
	padding: 4px 20px;
	height: 56px;
	display: grid;
	grid-template-columns: auto minmax(auto, 1fr) minmax(0, 72px);
	grid-gap: 16px;
	cursor: ${({ disabled }) => !disabled && "pointer"};
	pointer-events: ${({ disabled }) => disabled && "none"};
	opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;


function Balance({ balance }) {
	return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>;
}

function CurrencyRow({
	currency,
	onSelect,
	isSelected,
	otherSelected,
	style,
}) {
	const { account, chainId } = useActiveWeb3React();
	const key = currencyKey(currency, chainId);
	const balance = useCurrencyBalance(account || undefined, currency || undefined);

	return (
		<MenuItem
			style={style}
			className={`token-item-${key}`}
			onClick={() => (isSelected ? null : onSelect())}
			disabled={isSelected}
			selected={otherSelected}
		>
			<CurrencyLogo currency={currency} size="24px" />
			<div className="flex flex-col justify-start">
				<Text
					title={currency.name}
					className={'text-white'}
				>
					{currency.symbol}
				</Text>
			</div>
			<RowFixed style={{ justifySelf: "flex-end" }}>
				{balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
			</RowFixed>
		</MenuItem>
	)
}

export default function CurrencyList({
	height,
	currencies,
	selectedCurrency,
	onCurrencySelect,
	otherCurrency,
	fixedListRef,
	showETH,
}) {
	const { chainId } = useActiveWeb3React();
	const itemData = useMemo(() => (showETH ? [ETHERS[chainId], ...currencies] : [...currencies]), [
		currencies,
		showETH,
	]);

	const Row = useCallback(
		({ data, index, style }) => {
			const currency = data[index];
			const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
			const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
			const handleSelect = () => onCurrencySelect(currency);
			return (
				<CurrencyRow
					style={style}
					currency={currency}
					isSelected={isSelected}
					onSelect={handleSelect}
					otherSelected={otherSelected}
				/>
			);
		},
		[onCurrencySelect, otherCurrency, selectedCurrency]
	);

	const itemKey = useCallback((index, data) => currencyKey(data[index], chainId), []);

	return (
		<FixedSizeList
			height={height}
			ref={fixedListRef}
			width="100%"
			itemData={itemData}
			itemCount={itemData.length}
			itemSize={56}
			itemKey={itemKey}
		>
			{Row}
		</FixedSizeList>
	);
}
