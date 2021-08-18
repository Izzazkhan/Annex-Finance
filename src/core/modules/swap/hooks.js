import { parseUnits } from "@ethersproject/units";
import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade } from "@annex/sdk";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useENS from "../../../hooks/useENS";
import { useCurrency } from "../../../hooks/Tokens";
import { useTradeExactIn, useTradeExactOut } from "../../../hooks/Trades";
import useParsedQueryString from "../../../hooks/useParsedQueryString";
import { isAddress } from "../../../utils";
import { useCurrencyBalances } from "../../../hooks/wallet";
import { Field, swapActionCreators } from "./actions";

import { useUserSlippageTolerance } from "../user/hooks";
import { computeSlippageAdjustedAmounts } from "../../../utils/prices";
import { useActiveWeb3React } from "../../../hooks";

const {replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput} = swapActionCreators;

export function useSwapState() {
	return useSelector((state) => state.swap);
}

export function useSwapActionHandlers() {
	const dispatch = useDispatch();
	const onCurrencySelection = useCallback(
		(field, currency) => {
			dispatch(
				selectCurrency({
					field,
					currencyId: currency instanceof Token ? currency.address : currency === ETHER ? "ETH" : "",
				})
			);
		},
		[dispatch]
	);

	const onSwitchTokens = useCallback(() => {
		dispatch(switchCurrencies());
	}, [dispatch]);

	const onUserInput = useCallback(
		(field, typedValue) => {
			dispatch(typeInput({ field, typedValue }));
		},
		[dispatch]
	);

	const onChangeRecipient = useCallback(
		(recipient) => {
			dispatch(setRecipient({ recipient }));
		},
		[dispatch]
	);

	return {
		onSwitchTokens,
		onCurrencySelection,
		onUserInput,
		onChangeRecipient,
	};
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value, currency) {
	if (!value || !currency) {
		return undefined;
	}
	try {
		const typedValueParsed = parseUnits(value, currency.decimals).toString();
		if (typedValueParsed !== "0") {
			return currency instanceof Token
				? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
				: CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
		}
	} catch (error) {
		// should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
		console.info(`Failed to parse input amount: "${value}"`, error);
	}
	// necessary for all paths to return a value
	return undefined;
}

const BAD_RECIPIENT_ADDRESSES = [
	"0x8edD47fA123c263377b9C81A449c7e601C89723E", // v2 factory
	"0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", // v2 router 01
	"0x6ec44D20c8f1c746D88547f2c5c3E168D5fE74B0", // v2 router 02
];

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade, checksummedAddress) {
	return (
		trade.route.path.some((token) => token.address === checksummedAddress) ||
		trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
	);
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo() {
	const { account } = useActiveWeb3React();

	const {
		independentField,
		typedValue,
		[Field.INPUT]: { currencyId: inputCurrencyId },
		[Field.OUTPUT]: { currencyId: outputCurrencyId },
		recipient,
	} = useSwapState();

	const inputCurrency = useCurrency(inputCurrencyId);
	const outputCurrency = useCurrency(outputCurrencyId);
	const recipientLookup = useENS(recipient || undefined);
	const to = (recipient === null ? account : recipientLookup.address) || null;

	const relevantTokenBalances = useCurrencyBalances(account || undefined, [
		inputCurrency || undefined,
		outputCurrency || undefined,
	]);

	const isExactIn = independentField === Field.INPUT;
	const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) || undefined);

	const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency || undefined);
	// eslint-disable-next-line max-len
	const bestTradeExactOut = useTradeExactOut(inputCurrency || undefined, !isExactIn ? parsedAmount : undefined);

	const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

	const currencyBalances = {
		[Field.INPUT]: relevantTokenBalances[0],
		[Field.OUTPUT]: relevantTokenBalances[1],
	};

	const currencies = {
		[Field.INPUT]: inputCurrency || undefined,
		[Field.OUTPUT]: outputCurrency || undefined,
	};


	let inputError;
	if (!account) {
		inputError = "Connect Wallet";
	}

	if (!parsedAmount) {
		inputError = inputError || "Enter an amount";
	}

	if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
		inputError = inputError || "Select a token";
	}

	const formattedTo = isAddress(to);
	if (!to || !formattedTo) {
		inputError = inputError || "Enter a recipient";
	} else if (
		BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
		(bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
		(bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
	) {
		inputError = inputError || "Invalid recipient";
	}

	const [allowedSlippage] = useUserSlippageTolerance();

	const slippageAdjustedAmounts =
		v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage);

	// compare input balance to max input based on version
	const [balanceIn, amountIn] = [
		currencyBalances[Field.INPUT],
			slippageAdjustedAmounts
			? slippageAdjustedAmounts[Field.INPUT]
			: null,
	];

	if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
		inputError = `Insufficient ${amountIn.currency.symbol} balance`;
	}

	return {
		currencies,
		currencyBalances,
		parsedAmount,
		v2Trade: v2Trade || undefined,
		inputError,
	};
}

function parseCurrencyFromURLParameter(urlParam) {
	if (typeof urlParam === "string") {
		const valid = isAddress(urlParam);
		if (valid) return valid;
		if (urlParam.toUpperCase() === "ETH") return "ETH";
		if (valid === false) return "ETH";
	}
	return "ETH" || "";
}

function parseTokenAmountURLParameter(urlParam) {
	// eslint-disable-next-line no-restricted-globals
	return typeof urlParam === "string" && !isNaN(parseFloat(urlParam)) ? urlParam : "";
}

function parseIndependentFieldURLParameter(urlParam) {
	return typeof urlParam === "string" && urlParam.toLowerCase() === "output" ? Field.OUTPUT : Field.INPUT;
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function validatedRecipient(recipient) {
	if (typeof recipient !== "string") return null;
	const address = isAddress(recipient);
	if (address) return address;
	if (ENS_NAME_REGEX.test(recipient)) return recipient;
	if (ADDRESS_REGEX.test(recipient)) return recipient;
	return null;
}

export function queryParametersToSwapState(parsedQs) {
	let inputCurrency = parseCurrencyFromURLParameter(parsedQs?.inputCurrency);
	let outputCurrency = parseCurrencyFromURLParameter(parsedQs?.outputCurrency);
	if (inputCurrency === outputCurrency) {
		if (typeof parsedQs?.outputCurrency === "string") {
			inputCurrency = "";
		} else {
			outputCurrency = "";
		}
	}

	const recipient = validatedRecipient(parsedQs.recipient);

	return {
		[Field.INPUT]: {
			currencyId: inputCurrency,
		},
		[Field.OUTPUT]: {
			currencyId: outputCurrency,
		},
		typedValue: parseTokenAmountURLParameter(parsedQs?.exactAmount),
		independentField: parseIndependentFieldURLParameter(parsedQs?.exactField),
		recipient,
	};
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch() {
	const { chainId } = useActiveWeb3React();
	const dispatch = useDispatch();
	const parsedQs = useParsedQueryString();
	const [result, setResult] = useState();

	useEffect(() => {
		if (!chainId) return;
		const parsed = queryParametersToSwapState(parsedQs);

		dispatch(
			replaceSwapState({
				typedValue: parsed.typedValue,
				field: parsed.independentField,
				inputCurrencyId: parsed[Field.INPUT].currencyId,
				outputCurrencyId: parsed[Field.OUTPUT].currencyId,
				recipient: parsed.recipient,
			})
		);

		setResult({
			inputCurrencyId: parsed[Field.INPUT].currencyId,
			outputCurrencyId: parsed[Field.OUTPUT].currencyId,
		});
	}, [dispatch, chainId]);

	return result;
}
