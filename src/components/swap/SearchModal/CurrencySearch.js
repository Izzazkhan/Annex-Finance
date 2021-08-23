import {useActiveWeb3React} from "../../../hooks";
import {AutoSizer} from "react-virtualized";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import {useAllTokens, useToken} from "../../../hooks/Tokens";
import {isAddress} from "../../../utils";
import useTokenComparator from "./sorting";
import filterTokens from "./filtering";
import {ETHER} from "@annex/sdk";
import {CloseIcon} from "./ListSelect";
import SortButton from "./SortButton";
import CurrencyList from "./CurrencyList";


export const AutoColumn = styled.div`
	display: grid;
	grid-auto-rows: auto;
	grid-row-gap: ${({ gap }) =>
	(gap === "sm" && "8px") || (gap === "md" && "12px") || (gap === "lg" && "24px") || gap};
	justify-items: ${({ justify }) => justify && justify};
`;


export default function CurrencySearch({
	selectedCurrency,
	onCurrencySelect,
	otherSelectedCurrency,
	showCommonBases,
	onDismiss,
	isOpen,
	onChangeList
}) {
	const { chainId } = useActiveWeb3React();

	const fixedList = useRef();
	const [searchQuery, setSearchQuery] = useState("");
	const [invertSearchOrder, setInvertSearchOrder] = useState(false);
	const allTokens = useAllTokens();


	const isAddressSearch = isAddress(searchQuery);
	const searchToken = useToken(searchQuery);

	const showETH = useMemo(() => {
		const s = searchQuery.toLowerCase().trim();
		return s === "" || s === "e" || s === "et" || s === "eth";
	}, [searchQuery]);

	const tokenComparator = useTokenComparator(invertSearchOrder);

	const filteredTokens = useMemo(() => {
		console.log(allTokens);
		if(!allTokens) return [];
		if (isAddressSearch) return searchToken ? [searchToken] : [];
		return filterTokens(Object.values(allTokens), searchQuery);
	}, [isAddressSearch, searchToken, allTokens, searchQuery]);

	const filteredSortedTokens = useMemo(() => {
		if (searchToken) return [searchToken];
		const sorted = filteredTokens.sort(tokenComparator);
		const symbolMatch = searchQuery
			.toLowerCase()
			.split(/\s+/)
			.filter((s) => s.length > 0);
		if (symbolMatch.length > 1) return sorted;

		return [
			...(searchToken ? [searchToken] : []),
			// sort any exact symbol matches first
			...sorted.filter((token) => token.symbol?.toLowerCase() === symbolMatch[0]),
			...sorted.filter((token) => token.symbol?.toLowerCase() !== symbolMatch[0]),
		];
	}, [filteredTokens, searchQuery, searchToken, tokenComparator]);

	const handleCurrencySelect = useCallback(
		(currency) => {
			onCurrencySelect(currency);
			onDismiss();
		},
		[onDismiss, onCurrencySelect]
	);


	useEffect(() => {
		if (isOpen) setSearchQuery("");
	}, [isOpen]);

	const inputRef = useRef();
	const handleInput = useCallback((event) => {
		const input = event.target.value;
		const checksummedInput = isAddress(input);
		setSearchQuery(checksummedInput || input);
		fixedList.current?.scrollTo(0);
	}, []);


	const handleEnter = useCallback(
		(e) => {
			if (e.key === "Enter") {
				const s = searchQuery.toLowerCase().trim();
				if (s === "eth") {
					handleCurrencySelect(ETHER);
				} else if (filteredSortedTokens.length > 0) {
					if (
						filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
						filteredSortedTokens.length === 1
					) {
						handleCurrencySelect(filteredSortedTokens[0]);
					}
				}
			}
		},
		[filteredSortedTokens, handleCurrencySelect, searchQuery]
	);

	return (
		<div className="flex flex-col justify-start w-full flex-grow">
			<AutoColumn gap={'14px'} className={'px-5 pt-5 pb-3'}>
				<div className="flex items-center justify-between">
					<div className="text-white font-bold text-normal">
						Select a token
					</div>
					<CloseIcon onClick={onDismiss} fill={'#fff'} />
				</div>

				<input
					type="text"
					className={`border border-solid border-gray bg-transparent
						rounded-xl flex-grow focus:outline-none font-bold px-4 h-14`}
					id="token-search-input"
					placeholder={"Search by Symbol or name"}
					value={searchQuery}
					ref={inputRef}
					onChange={handleInput}
					onKeyDown={handleEnter}
				/>

				<div className="flex items-center justify-between">
					<div className="text-white text-normal">
						Select a token
					</div>
					<SortButton
						ascending={invertSearchOrder}
						toggleSortOrder={() => setInvertSearchOrder((iso) => !iso)}
					/>
				</div>
			</AutoColumn>

			<div className="w-full h-px bg-fadeBlack"/>

			<div style={{ flex: "1" }} className={'mb-4 mx-4 bg-black rounded-xl h-full overflow-hidden'}>
				<CurrencyList
					height={400}
					showETH={showETH}
					currencies={filteredSortedTokens}
					onCurrencySelect={handleCurrencySelect}
					otherCurrency={otherSelectedCurrency}
					selectedCurrency={selectedCurrency}
					fixedListRef={fixedList}
				/>
			</div>
		</div>
	)
}
