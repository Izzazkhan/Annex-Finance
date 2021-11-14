import { MaxUint256 } from "@ethersproject/constants";
import { TransactionResponse } from "@ethersproject/providers";
import { Trade, TokenAmount, CurrencyAmount, ETHERS } from "@annex/sdk";
import { useCallback, useMemo } from "react";
import { ROUTER_ADDRESS } from "../constants/swap";
import { useTokenAllowance } from "../data/Allowances";
import { getTradeVersion, useV1TradeExchangeAddress } from "../data/V1";
import { Field } from "../core/modules/swap/actions";
import { useTransactionAdder, useHasPendingApproval } from "../core/modules/transactions/hooks";
import { computeSlippageAdjustedAmounts } from "../utils/prices";
import { calculateGasMargin } from "../utils";
import { useTokenContract } from "./useContract";
import { Version } from "./useToggledVersion";
import { useActiveWeb3React } from "./index";

export const ApprovalState = {
	UNKNOWN: 0,
	NOT_APPROVED: 1,
	PENDING: 2,
	APPROVED: 3,
}

export function useApproveCallback(
	amountToApprove,
	spender
) {
	const { account } = useActiveWeb3React();
	const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
	const currentAllowance = useTokenAllowance(token, account || undefined, spender);
	const pendingApproval = useHasPendingApproval(token?.address, spender);

	// check the current approval status
	const approvalState = useMemo(() => {
		if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
		if (amountToApprove.currency === ETHERS[amountToApprove.currency.chainId]) return ApprovalState.APPROVED;
		// we might not have enough data to know whether or not we need to approve
		if (!currentAllowance) return ApprovalState.UNKNOWN;

		// amountToApprove will be defined if currentAllowance is
		return currentAllowance.lessThan(amountToApprove)
			? pendingApproval
				? ApprovalState.PENDING
				: ApprovalState.NOT_APPROVED
			: ApprovalState.APPROVED;
	}, [amountToApprove, currentAllowance, pendingApproval, spender]);

	const tokenContract = useTokenContract(token?.address);
	const addTransaction = useTransactionAdder();

	const approve = useCallback(async () => {
		if (approvalState !== ApprovalState.NOT_APPROVED) {
			console.error("approve was called unnecessarily");
			return;
		}
		if (!token) {
			console.error("no token");
			return;
		}

		if (!tokenContract) {
			console.error("tokenContract is null");
			return;
		}

		if (!amountToApprove) {
			console.error("missing amount to approve");
			return;
		}

		if (!spender) {
			console.error("no spender");
			return;
		}

		let useExact = false;
		const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
			// general fallback for tokens who restrict approval amounts
			useExact = true;
			return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString());
		});

		// eslint-disable-next-line consistent-return
		return tokenContract
			.approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256, {
				gasLimit: calculateGasMargin(estimatedGas),
			})
			.then((response) => {
				addTransaction(response, {
					summary: `Approve ${amountToApprove.currency.symbol}`,
					approval: { tokenAddress: token.address, spender },
				});
			})
			.catch((error) => {
				console.error("Failed to approve token", error);
				throw error;
			});
	}, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction]);

	return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade, allowedSlippage = 0, chainId) {
	const amountToApprove = useMemo(
		() => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
		[trade, allowedSlippage]
	);
	const tradeIsV1 = getTradeVersion(trade) === Version.v1;
	const v1ExchangeAddress = useV1TradeExchangeAddress(trade);
	return useApproveCallback(amountToApprove, tradeIsV1 ? v1ExchangeAddress : ROUTER_ADDRESS[chainId]);
}
