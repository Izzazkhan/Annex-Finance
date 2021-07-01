import React, {useCallback, useEffect, useState} from "react";

import Modal from "../../UI/Modal";
import useLast from "../../../hooks/useLast";
import {ListSelect} from "./ListSelect";
import CurrencySearch from "./CurrencySearch";

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


	const content = listView ? (
		<ListSelect onDismiss={onDismiss} onBack={handleClickBack} />
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
	)

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
