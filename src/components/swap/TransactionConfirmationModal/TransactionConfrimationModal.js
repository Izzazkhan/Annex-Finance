import {useActiveWeb3React} from "../../../hooks";
import Modal from "../../UI/Modal";
import React from "react";
import ConfirmationPendingContent from "./ConfirmationPendingContent";
import TransactionSubmittedContent from "./TransactionSubmittedContent";

const TransactionConfirmationModal = ({
	isOpen,
	onDismiss,
	attemptingTxn,
	hash,
	pendingText,
	content,
}) => {
	const { chainId } = useActiveWeb3React();

	if (!chainId) return null;

	const innerContent = attemptingTxn ? (
		<ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
	) : hash ? (
		<TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
	) : (
		content()
	)

	return (
		<Modal
			title={null}
			content={innerContent}
			open={isOpen}
			onCloseModal={onDismiss}
			width={'max-w-xl'}
		/>
	);
};

export default TransactionConfirmationModal;
