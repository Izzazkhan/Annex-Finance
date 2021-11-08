import { currencyEquals, ETHERS, WETH } from "@annex/sdk";
import { useMemo } from "react";
import { tryParseAmount } from "../core/modules/swap/hooks";
import { useTransactionAdder } from "../core/modules/transactions/hooks";
import { useCurrencyBalance } from "./wallet";
import { useWETHContract } from "./useContract";
import { useActiveWeb3React } from "./index";

export const WrapType = {
	NOT_APPLICABLE: 0,
	WRAP: 1,
	UNWRAP: 2,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
	inputCurrency,
	outputCurrency,
	typedValue
) {
	const { chainId, account } = useActiveWeb3React();
	const wethContract = useWETHContract();
	const balance = useCurrencyBalance(account || undefined, inputCurrency);
	// we can always parse the amount typed as the input currency, since wrapping is 1:1
	const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency, chainId), [inputCurrency, typedValue]);
	const addTransaction = useTransactionAdder();

	return useMemo(() => {
		if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;

		const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

		if (inputCurrency === ETHERS[chainId] && currencyEquals(WETH[chainId], outputCurrency)) {
			return {
				wrapType: WrapType.WRAP,
				execute:
					sufficientBalance && inputAmount
						? async () => {
								try {
									const txReceipt = await wethContract.deposit({
										value: `0x${inputAmount.raw.toString(16)}`,
									});
									addTransaction(txReceipt, {
										summary: `Wrap ${inputAmount.toSignificant(6)} BNB to WBNB`,
									});
								} catch (error) {
									console.error("Could not deposit", error);
								}
							// eslint-disable-next-line no-mixed-spaces-and-tabs
						  }
						: undefined,
				inputError: sufficientBalance ? undefined : "Insufficient ETH balance",
			};
		}
		if (currencyEquals(WETH[chainId], inputCurrency) && outputCurrency === ETHERS[chainId]) {
			return {
				wrapType: WrapType.UNWRAP,
				execute:
					sufficientBalance && inputAmount
						? async () => {
								try {
									const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`);
									addTransaction(txReceipt, {
										summary: `Unwrap ${inputAmount.toSignificant(6)} WBNB to BNB`,
									});
								} catch (error) {
									console.error("Could not withdraw", error);
								}
							// eslint-disable-next-line no-mixed-spaces-and-tabs
						  }
						: undefined,
				inputError: sufficientBalance ? undefined : "Insufficient WBNB balance",
			};
		}
		return NOT_APPLICABLE;
	}, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction]);
}
