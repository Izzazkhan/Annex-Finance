/* eslint-disable */
import React, {useCallback, useState} from 'react';
import NumericalInput from "../common/NumericalInput";
import {useActiveWeb3React} from "../../hooks";
import {useCurrencyBalance} from "../../hooks/wallet";
import {ChevronDownIcon} from "@heroicons/react/solid";
import {Listbox} from "@headlessui/react";
import CurrencyLogo from "../common/CurrencyLogo";
import CurrencySearchModal from "./SearchModal/CurrencySearchModal";

export default function CurrencyInputPanel({
	title,
	trade,
	value,
	onUserInput,
	onMax,
	showMaxButton,
	label = "Input",
	onCurrencySelect,
	currency,
	disableCurrencySelect = false,
	hideBalance = false,
	pair = null,
	hideInput = false,
	otherCurrency,
	id,
	showCommonBases,
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const { account } = useActiveWeb3React();

	const selectedCurrencyBalance = useCurrencyBalance(account || undefined, currency || undefined);


	const handleDismissSearch = useCallback(() => {
		setModalOpen(false);
	}, [setModalOpen]);

	return (
		<>
			<div className="w-full">
				<div className="flex items-center justify-between">
					<div className={trade ? 'text-black mb-2' : 'text-white mb-2'}>
						{title}
					</div>
					{account && (
						<div className={trade ? 'text-black mb-2' : 'text-white mb-2'} onClick={onMax}>
							{!hideBalance && !!currency && selectedCurrencyBalance
								? `Balance: ${selectedCurrencyBalance?.toSignificant(6)}`
								: " -"}
						</div>
					)}
				</div>
				<div className="flex justify-between items-center space-x-4">
					<NumericalInput
						trade={trade}
						value={value}
						onUserInput={(val) => {
							onUserInput(val);
						}}
					/>
					<div
						onClick={() => {
							if (!disableCurrencySelect) {
								setModalOpen(true);
							}
						}}
						className="relative w-56 h-14 pl-3 pr-10 text-left text-white
		              shadow-md cursor-default focus:outline-none
		              cursor-pointer
		              focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white
		               focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2
		               focus-visible:border-indigo-500 sm:text-sm bg-transparent border border-solid border-gray
		               rounded-xl pl-5 pr-4">
						<div className="flex items-center h-full w-full space-x-4 py-2">
							{currency ? (
								<CurrencyLogo currency={currency} size="24px" />
							) : null}
							<div>
							<span
								className={`block truncate`}
							>
								{(currency && currency.symbol && currency.symbol.length > 20
									? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
										currency.symbol.length - 5,
										currency.symbol.length
									)}`
									: currency?.symbol) || "Select"}
		                    </span>
							</div>
						</div>
						<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
						<ChevronDownIcon
							className={`w-6 hover:text-violet-100 mr-2`}
							aria-hidden="true"
						/>
	                </span>
					</div>
				</div>
			</div>
			{!disableCurrencySelect && onCurrencySelect && (
				<CurrencySearchModal
					isOpen={modalOpen}
					onDismiss={handleDismissSearch}
					onCurrencySelect={onCurrencySelect}
					selectedCurrency={currency}
					otherSelectedCurrency={otherCurrency}
					showCommonBases={showCommonBases}
				/>
			)}

		</>
	);
}
