import React, {useMemo, useState} from "react";
import {
	computeSlippageAdjustedAmounts,
	computeTradePriceBreakdown,
	formatExecutionPrice,
	warningSeverity
} from "../../utils/prices";
import {AutoRow, RowBetween, RowFixed} from "../UI/Row";
import {AutoColumn} from "../UI/Column";
import {Repeat} from "react-feather";
import {TradeType} from "@pancakeswap-libs/sdk";
import {Field} from "../../core/modules/swap/actions";

export default function SwapModalFooter({
    trade,
    onConfirm,
    allowedSlippage,
    swapErrorMessage,
    disabledConfirm,
}) {
	const [showInverted, setShowInverted] = useState(false);
	const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
		allowedSlippage,
		trade,
	]);
	const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
	const severity = warningSeverity(priceImpactWithoutFee);


	return (
		<>
			<AutoColumn gap="0px">
				<RowBetween align="center">
					<span className={'text-white text-sm'}>Price</span>
					<span
						className={'text-white text-sm'}
						style={{
							justifyContent: "center",
							alignItems: "center",
							display: "flex",
							textAlign: "right",
							paddingLeft: "8px",
							fontWeight: 500,
						}}
					>
						{formatExecutionPrice(trade, showInverted)}
						<button
							className={`w-6 h-6 bg-fadeBlack border-none rounded-full p-1 
							text-sm text-white flex items-center justify-center cursor-pointer`}
							onClick={() => setShowInverted(!showInverted)}>
							<Repeat size={14} />
						</button>
					</span>
				</RowBetween>

				<RowBetween>
					<RowFixed>
						<span
							className={'text-white text-sm'}>
							{trade.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sold"}
						</span>
					</RowFixed>
					<RowFixed>
						<span
							className={'text-white text-sm'}>
							{trade.tradeType === TradeType.EXACT_INPUT
								? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) || "-"
								: slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) || "-"}
						</span>
						<span
							className={'text-white text-sm ml-1'}>
							{trade.tradeType === TradeType.EXACT_INPUT
								? trade.outputAmount.currency.symbol
								: trade.inputAmount.currency.symbol}
						</span>
					</RowFixed>
				</RowBetween>
				<RowBetween>
					<RowFixed>
						<span
							className={'text-white text-sm'}>
							Liquidity Provider Fee
						</span>
					</RowFixed>
					<span
						className={'text-white text-sm'}>
						{realizedLPFee
							? `${realizedLPFee?.toSignificant(6)} ${trade.inputAmount.currency.symbol}`
							: "-"}
					</span>
				</RowBetween>
			</AutoColumn>

			<AutoRow>
				<button
					onClick={onConfirm}
					disabled={disabledConfirm}
					id="confirm-swap-or-send"
					className="bg-primaryLight py-2 rounded px-32 transition-all disabled:opacity-50
                        h-12 text-black flex items-center justify-center"
				>
					{severity > 2 ? "Swap Anyway" : "Confirm Swap"}
				</button>
			</AutoRow>
		</>
	);

}
