import {useDispatch, useSelector} from "react-redux";
import {useActiveWeb3React} from "../../../hooks";
import {usePair} from "../../../data/Reserves";
import {useTokenBalances} from "../../../hooks/wallet";
import {wrappedCurrency} from "../../../utils/wrappedCurrency";
import {burnActionCreators, Field} from "./actions";
import useTotalSupply from "../../../data/TotalSupply";
import {JSBI, Percent, TokenAmount} from "@annex/sdk";
import {tryParseAmount} from "../swap";
import {useCallback} from "react";

export function useBurnState() {
    return useSelector((state) => state.burn);
}

export function useDerivedBurnInfo(
    currencyA,
    currencyB
) {
    const { account, chainId } = useActiveWeb3React();

    const { independentField, typedValue } = useBurnState();

    // pair + totalsupply
    const [, pair] = usePair(currencyA, currencyB);

    // balances
    const relevantTokenBalances = useTokenBalances(account ?? undefined, [pair?.liquidityToken]);
    const userLiquidity = relevantTokenBalances?.[pair?.liquidityToken?.address ?? ""];

    const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)];
    const tokens = {
        [Field.CURRENCY_A]: tokenA,
        [Field.CURRENCY_B]: tokenB,
        [Field.LIQUIDITY]: pair?.liquidityToken,
    };

    // liquidity values
    const totalSupply = useTotalSupply(pair?.liquidityToken);
    const liquidityValueA =
        pair &&
        totalSupply &&
        userLiquidity &&
        tokenA &&
        // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
        JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
            ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false).raw)
            : undefined;
    const liquidityValueB =
        pair &&
        totalSupply &&
        userLiquidity &&
        tokenB &&
        // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
        JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
            ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, totalSupply, userLiquidity, false).raw)
            : undefined;
    const liquidityValues = {
        [Field.CURRENCY_A]: liquidityValueA,
        [Field.CURRENCY_B]: liquidityValueB,
    };

    let percentToRemove = new Percent("0", "100");
    // user specified a %
    if (independentField === Field.LIQUIDITY_PERCENT) {
        percentToRemove = new Percent(typedValue, "100");
    }
    // user specified a specific amount of liquidity tokens
    else if (independentField === Field.LIQUIDITY) {
        if (pair?.liquidityToken) {
            const independentAmount = tryParseAmount(typedValue, pair.liquidityToken, chainId);
            if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
                percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw);
            }
        }
    }
        // user specified a specific amount of token a or b
    // @ts-ignore
    else if (tokens[independentField]) {
        // @ts-ignore
        const independentAmount = tryParseAmount(typedValue, tokens[independentField], chainId);
        // @ts-ignore
        const liquidityValue = liquidityValues[independentField];
        if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
            percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw);
        }
    }

    const parsedAmounts = {
        [Field.LIQUIDITY_PERCENT]: percentToRemove,
        [Field.LIQUIDITY]:
            userLiquidity && percentToRemove && percentToRemove.greaterThan("0")
                ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
                : undefined,
        [Field.CURRENCY_A]:
            tokenA && percentToRemove && percentToRemove.greaterThan("0") && liquidityValueA
                ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
                : undefined,
        [Field.CURRENCY_B]:
            tokenB && percentToRemove && percentToRemove.greaterThan("0") && liquidityValueB
                ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
                : undefined,
    };

    let error;
    if (!account) {
        error = "Connect Wallet";
    }

    if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
        error = error ?? "Enter an amount";
    }

    return { pair, parsedAmounts, error };
}

export function useBurnActionHandlers() {
    const dispatch = useDispatch();

    const onUserInput = useCallback(
        (field, typedValue) => {
            dispatch(burnActionCreators.typeInput({ field, typedValue }));
        },
        [dispatch]
    );

    return {
        onUserInput,
    };
}
