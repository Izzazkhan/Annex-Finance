import React from "react";
import {useLastTruthy} from "../../hooks/useLast";
import {useUserSlippageTolerance} from "../../core";
import {computeSlippageAdjustedAmounts, computeTradePriceBreakdown} from "../../utils/prices";
import {TradeType} from "@pancakeswap-libs/sdk";
import {Field} from "../../core/modules/swap/actions";
import {ONE_BIPS} from "../../constants/swap";

export default function AdvancedSwapDetails({trade}) {
	const lastTrade = useLastTruthy(trade);
	const [allowedSlippage] = useUserSlippageTolerance();

	const tradeResult = trade || lastTrade || undefined;
	const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(tradeResult);
	const isExactIn = tradeResult.tradeType === TradeType.EXACT_INPUT;
	const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(tradeResult, allowedSlippage);

	return (
		<div className="bg-black w-full p-8 rounded-2xl flex flex-col space-y-2 mt-10">
			<div className="flex justify-between">
				<div className="text-white text-22 font-bold">
					{isExactIn ? "Minimum received" : "Maximum sold"}
				</div>
				<div className="text-white text-22 font-bold">
					{isExactIn
						? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${
						trade.outputAmount.currency.symbol
					}` || "-"
						: `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${
						trade.inputAmount.currency.symbol
					}` || "-"}</div>
			</div>
			<div className="flex justify-between">
				<div className="text-white text-22 font-bold">Price Impact</div>
				<div className="text-white text-22 font-bold">
					{priceImpactWithoutFee
						? (priceImpactWithoutFee.lessThan(ONE_BIPS)
							? "<0.01%"
							: `${priceImpactWithoutFee.toFixed(2)}%`)
						: "-"
					}
				</div>
			</div>
			<div className="flex justify-between">
				<div className="text-white text-22 font-bold">Liquidity Provider Fee</div>
				<div className="text-white text-22 font-bold">
					{
						realizedLPFee
						? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}`
						: "-"
					}
				</div>
			</div>
		</div>
	)
}
