import { JSBI, Percent, Router, TradeType } from "@pancakeswap-libs/sdk";
import { useMemo } from "react";
import { BIPS_BASE, DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from "../constants/swap";
import { getTradeVersion, useV1TradeExchangeAddress } from "../data/V1";
import { useTransactionAdder } from "../core/modules/transactions/hooks";
import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from "../utils";
import isZero from "../utils/isZero";
import v1SwapArguments from "../utils/v1SwapArguments";
import { useV1ExchangeContract } from "./useContract";
import useENS from "./useENS";
import { Version } from "./useToggledVersion";
import { useActiveWeb3React } from "./index";

export const SwapCallbackState = {
	INVALID: 0,
	LOADING: 1,
	VALID: 2,
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
	trade, // trade to execute, required
	allowedSlippage = INITIAL_ALLOWED_SLIPPAGE, // in bips
	deadline = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
	recipientAddressOrName
) {
	const { account, chainId, library } = useActiveWeb3React();

	const { address: recipientAddress } = useENS(recipientAddressOrName);
	const recipient = recipientAddressOrName === null ? account : recipientAddress;

	const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true);

	return useMemo(() => {
		const tradeVersion = getTradeVersion(trade);
		if (!trade || !recipient || !library || !account || !tradeVersion || !chainId) return [];

		const contract =
			tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange;
		if (!contract) {
			return [];
		}

		const swapMethods = [];

		switch (tradeVersion) {
			case Version.v2:
				swapMethods.push(
					// @ts-ignore
					Router.swapCallParameters(trade, {
						feeOnTransfer: false,
						allowedSlippage: new Percent(JSBI.BigInt(Math.floor(allowedSlippage)), BIPS_BASE),
						recipient,
						ttl: deadline,
					})
				);

				if (trade.tradeType === TradeType.EXACT_INPUT) {
					swapMethods.push(
						// @ts-ignore
						Router.swapCallParameters(trade, {
							feeOnTransfer: true,
							allowedSlippage: new Percent(JSBI.BigInt(Math.floor(allowedSlippage)), BIPS_BASE),
							recipient,
							ttl: deadline,
						})
					);
				}
				break;
			case Version.v1:
				swapMethods.push(
					// @ts-ignore
					v1SwapArguments(trade, {
						allowedSlippage: new Percent(JSBI.BigInt(Math.floor(allowedSlippage)), BIPS_BASE),
						recipient,
						ttl: deadline,
					})
				);
				break;
		}
		return swapMethods.map((parameters) => ({ parameters, contract }));
	}, [account, allowedSlippage, chainId, deadline, library, recipient, trade, v1Exchange]);
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
	trade, // trade to execute, required
	allowedSlippage = INITIAL_ALLOWED_SLIPPAGE, // in bips
	deadline = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
	recipientAddressOrName
) {
	const { account, chainId, library } = useActiveWeb3React();

	const swapCalls = useSwapCallArguments(trade, allowedSlippage, deadline, recipientAddressOrName);

	const addTransaction = useTransactionAdder();

	const { address: recipientAddress } = useENS(recipientAddressOrName);
	const recipient = recipientAddressOrName === null ? account : recipientAddress;

	return useMemo(() => {
		if (!trade || !library || !account || !chainId) {
			return { state: SwapCallbackState.INVALID, callback: null, error: "Missing dependencies" };
		}
		if (!recipient) {
			if (recipientAddressOrName !== null) {
				return { state: SwapCallbackState.INVALID, callback: null, error: "Invalid recipient" };
			}
			return { state: SwapCallbackState.LOADING, callback: null, error: null };
		}

		const tradeVersion = getTradeVersion(trade);

		return {
			state: SwapCallbackState.VALID,
			callback: async function onSwap() {
				// eslint-disable-next-line no-undef
				const estimatedCalls = await Promise.all(
					swapCalls.map((call) => {
						const {
							parameters: { methodName, args, value },
							contract,
						} = call;
						const options = !value || isZero(value) ? {} : { value };

						return contract.estimateGas[methodName](...args, options)
							.then((gasEstimate) => {
								return {
									call,
									gasEstimate,
								};
							})
							.catch((gasError) => {
								console.info("Gas estimate failed, trying eth_call to extract error", call);

								return contract.callStatic[methodName](...args, options)
									.then((result) => {
										console.info(
											"Unexpected successful call after failed estimate gas",
											call,
											gasError,
											result
										);
										return {
											call,
											error: new Error(
												"Unexpected issue with estimating the gas. Please try again."
											),
										};
									})
									.catch((callError) => {
										console.info("Call threw error", call, callError);
										let errorMessage;
										switch (callError.reason) {
											case "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT":
											case "UniswapV2Router: EXCESSIVE_INPUT_AMOUNT":
												errorMessage =
													// eslint-disable-next-line max-len
													"This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.";
												break;
											default:
												// eslint-disable-next-line max-len
												errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`;
										}
										return { call, error: new Error(errorMessage) };
									});
							});
					})
				);

				const successfulEstimation = estimatedCalls.find(
					(el, ix, list) =>
						"gasEstimate" in el && (ix === list.length - 1 || "gasEstimate" in list[ix + 1])
				);

				if (!successfulEstimation) {
					const errorCalls = estimatedCalls.filter((call) => "error" in call);
					if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
					throw new Error("Unexpected error. Please contact support: none of the calls threw an error");
				}

				const {
					call: {
						contract,
						parameters: { methodName, args, value },
					},
					gasEstimate,
				} = successfulEstimation;

				return contract[methodName](...args, {
					gasLimit: calculateGasMargin(gasEstimate),
					...(value && !isZero(value) ? { value, from: account } : { from: account }),
				})
					.then((response) => {
						const inputSymbol = trade.inputAmount.currency.symbol;
						const outputSymbol = trade.outputAmount.currency.symbol;
						const inputAmount = trade.inputAmount.toSignificant(3);
						const outputAmount = trade.outputAmount.toSignificant(3);

						const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
						const withRecipient =
							recipient === account
								? base
								: `${base} to ${
										recipientAddressOrName && isAddress(recipientAddressOrName)
											? shortenAddress(recipientAddressOrName)
											: recipientAddressOrName
									// eslint-disable-next-line no-mixed-spaces-and-tabs
								  }`;

						const withVersion =
							tradeVersion === Version.v2
								? withRecipient
								: `${withRecipient} on ${(tradeVersion).toUpperCase()}`;

						addTransaction(response, {
							summary: withVersion,
						});

						return response.hash;
					})
					.catch((error) => {
						// if the user rejected the tx, pass this along
						if (error?.code === 4001) {
							throw new Error("Transaction rejected.");
						} else {
							// otherwise, the error was unexpected and we need to convey that
							console.error(`Swap failed`, error, methodName, args, value);
							throw new Error(`Swap failed: ${error.message}`);
						}
					});
			},
			error: null,
		};
	}, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction]);
}
