import React, {useCallback, useEffect, useState} from "react";

import Modal from "../../UI/Modal";
import useLast from "../../../hooks/useLast";
import {useSelectedListUrl} from "../../../core";

export default function CurrencySearchModal({
	isOpen,
	onDismiss,
	onCurrencySelect,
	selectedCurrency,
	otherSelectedCurrency,
}) {
	const [listView, setListView] = useState(false);
	const lastOpen = useLast(isOpen);

	useEffect(() => {
		if (isOpen && !lastOpen) {
			setListView(false);
		}
	}, [isOpen, lastOpen]);

	const handleCurrencySelect = useCallback(
		(currency) => {
			onCurrencySelect(currency);
			onDismiss();
		},
		[onDismiss, onCurrencySelect]
	);

	const handleClickChangeList = useCallback(() => {
		setListView(true);
	}, []);
	const handleClickBack = useCallback(() => {
		setListView(false);
	}, []);

	const selectedListUrl = useSelectedListUrl();
	const noListSelected = !selectedListUrl;

	const content = listView ? (
		<ListSelect onDismiss={onDismiss} onBack={handleClickBack} />
	) : noListSelected ? (
		<CurrencySearch
			isOpen={isOpen}
			onDismiss={onDismiss}
			onCurrencySelect={handleCurrencySelect}
			onChangeList={handleClickChangeList}
			selectedCurrency={selectedCurrency}
			otherSelectedCurrency={otherSelectedCurrency}
			showCommonBases={false}
		/>
	) : (
		<CurrencySearch
			isOpen={isOpen}
			onDismiss={onDismiss}
			onCurrencySelect={handleCurrencySelect}
			onChangeList={handleClickChangeList}
			selectedCurrency={selectedCurrency}
			otherSelectedCurrency={otherSelectedCurrency}
			showCommonBases={false}
		/>
	);

	return (
		<Modal
			title={null}
			content={content}
			open={isOpen}
			onCloseModal={onDismiss}
			width={'max-w-xl'}
		/>
	)
}