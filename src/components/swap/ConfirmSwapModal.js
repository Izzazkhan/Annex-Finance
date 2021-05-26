import {currencyEquals} from "@pancakeswap-libs/sdk";
import {useCallback, useMemo} from "react";
import TransactionErrorContent from "./TransactionConfirmationModal/TransactionErrorContent";
import ConfirmationModalContent from "./TransactionConfirmationModal/ConfirmationModalContent";
import TransactionConfirmationModal from "./TransactionConfirmationModal/TransactionConfrimationModal";
import SwapModalHeader from "./SwapModalHeader";
import SwapModalFooter from "./SwapModalFooter";


function tradeMeaningfullyDiffers(tradeA, tradeB) {
	return (
		tradeA.tradeType !== tradeB.tradeType ||
		!currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
		!tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
		!currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
		!tradeA.outputAmount.equalTo(tradeB.outputAmount)
	);
}

export default function ConfirmSwapModal({
	trade,
	originalTrade,
	onAcceptChanges,
	allowedSlippage,
	onConfirm,
	onDismiss,
	recipient,
	swapErrorMessage,
	isOpen,
	attemptingTxn,
	txHash,
}) {
	const showAcceptChanges = useMemo(
		() => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
		[originalTrade, trade]
	);

	const modalHeader = useCallback(() => {
		return trade ? (
			<SwapModalHeader
				trade={trade}
				allowedSlippage={allowedSlippage}
				recipient={recipient}
				showAcceptChanges={showAcceptChanges}
				onAcceptChanges={onAcceptChanges}
			/>
		) : null;
	}, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade]);

	const modalBottom = useCallback(() => {
		return trade ? (
			<SwapModalFooter
				onConfirm={onConfirm}
				trade={trade}
				disabledConfirm={showAcceptChanges}
				swapErrorMessage={swapErrorMessage}
				allowedSlippage={allowedSlippage}
			/>
		) : null;
	}, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade]);

	// text to show while loading
	const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
		trade?.inputAmount?.currency?.symbol
	} for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`;

	const confirmationContent = useCallback(
		() =>
			swapErrorMessage ? (
				<TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
			) : (
				<ConfirmationModalContent
					title="Confirm Swap"
					onDismiss={onDismiss}
					topContent={modalHeader}
					bottomContent={modalBottom}
				/>
			),
		[onDismiss, modalBottom, modalHeader, swapErrorMessage]
	);

	return (
		<TransactionConfirmationModal
			isOpen={isOpen}
			onDismiss={onDismiss}
			attemptingTxn={attemptingTxn}
			hash={txHash}
			content={confirmationContent}
			pendingText={pendingText}
		/>
	);
}
