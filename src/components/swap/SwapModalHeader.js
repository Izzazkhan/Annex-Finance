import {useMemo} from "react";
import styled from "styled-components";
import {AlertTriangle, ArrowDown} from "react-feather";

import {computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity} from "../../utils/prices";
import {AutoColumn} from "../UI/Column";
import {RowBetween, RowFixed} from "../UI/Row";
import CurrencyLogo from "../common/CurrencyLogo";
import {isAddress} from "../../utils";
import {shortenAddress} from "../../utils/address";
import {TradeType} from "@annex/sdk";
import {Field} from "../../core/modules/swap/actions";


export const SwapShowAcceptChanges = styled(AutoColumn)`
	background-color: rgba(255, 255, 255, 0.1);
	color: #FFAB2D;
	padding: 0.5rem;
	border-radius: 12px;
	margin-top: 8px;
`;


export default function SwapModalHeader({
    trade,
    allowedSlippage,
    recipient,
    showAcceptChanges,
    onAcceptChanges,
}) {
	const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
		trade,
		allowedSlippage,
	]);
	const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
	const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

	return (
		<AutoColumn gap="md" style={{ marginTop: "40px" }}>
			<RowBetween align="flex-end">
				<RowFixed gap="0px">
					<CurrencyLogo currency={trade.inputAmount.currency} size="24px" style={{ marginRight: "12px" }} />
					<span
						className={`text-xl ml-2 font-bold 
						${showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT 
							? "text-primary"
							: "text-white"}
						`}
					>
						{trade.inputAmount.toSignificant(6)}
					</span>
				</RowFixed>
				<RowFixed gap="0px">
					<span
						className={'text-xl ml-2 font-bold'}>
						{trade.inputAmount.currency.symbol}
					</span>
				</RowFixed>
			</RowBetween>
			<RowFixed>
				<ArrowDown size="16" color={"#fff"} style={{ marginLeft: "4px", minWidth: "16px" }} />
			</RowFixed>
			<RowBetween align="flex-end">
				<RowFixed gap="0px">
					<CurrencyLogo currency={trade.outputAmount.currency} size="24px" style={{ marginRight: "12px" }} />
					<span
						className={`text-xl ml-2 font-bold ${priceImpactSeverity > 2
							? "text-darkRed"
							: showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
							? "text-primaryLight"
							: "text-white"}`}
					>
						{trade.outputAmount.toSignificant(6)}
					</span>
				</RowFixed>
				<RowFixed gap="0px">
					<span className="text-xl ml-2 font-bold text-white">
						{trade.outputAmount.currency.symbol}
					</span>
				</RowFixed>
			</RowBetween>
			{showAcceptChanges ? (
				<SwapShowAcceptChanges justify="flex-start" gap="0px">
					<RowBetween>
						<RowFixed>
							<AlertTriangle size={20} style={{ marginRight: "8px", minWidth: 24 }} />
							<span className="text-2xl ml-2 font-bold text-primary">
								Price Updated
							</span>
						</RowFixed>
						<button
							onClick={onAcceptChanges}
							className={`px-4 py-2 rounded-xl border border-primaryLight text-primaryLight 
							transition-all hover:text-fadeBlack hover:bg-primary hover:border-primary`}>
							Accept
						</button>
					</RowBetween>
				</SwapShowAcceptChanges>
			) : null}
			<AutoColumn justify="flex-start" gap="sm" style={{ padding: "16px 0 0" }}>
				{trade.tradeType === TradeType.EXACT_INPUT ? (
					<span className={'italic text-white font-normal'}>
						{`Output is estimated. You will receive at least `}
						<span className={'text-primary'}>
							{slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)}{" "}
							{trade.outputAmount.currency.symbol}
						</span>
						{" or the transaction will revert."}
					</span>
				) : (
					<span className={'italic text-white font-normal'}>
						{`Input is estimated. You will sell at most `}
						<span className={'text-primary'}>
							{slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
						</span>
						{" or the transaction will revert."}
					</span>
				)}
			</AutoColumn>
			{recipient !== null ? (
				<AutoColumn justify="flex-start" gap="sm" style={{ padding: "16px 0 0" }}>
					<span className={'text-white font-medium'}>
						Output will be sent to{" "}
						<b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
					</span>
				</AutoColumn>
			) : null}
		</AutoColumn>
	);

}
