import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBlockNumber } from "../application/hooks";
import { transactionActionCreators } from "./actions";
import { useActiveWeb3React } from "../../../hooks";

const { checkedTransaction, finalizeTransaction } = transactionActionCreators;

export function shouldCheck(
	lastBlockNumber,
	tx
) {
	if (tx.receipt) return false;
	if (!tx.lastCheckedBlockNumber) return true;
	const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
	if (blocksSinceCheck < 1) return false;
	const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
	if (minutesPending > 60) {
		// every 10 blocks if pending for longer than an hour
		return blocksSinceCheck > 9;
	}
	if (minutesPending > 5) {
		// every 3 blocks if pending more than 5 minutes
		return blocksSinceCheck > 2;
	}
	// otherwise every block
	return true;
}

export default function Updater() {
	const { chainId, library } = useActiveWeb3React();

	const lastBlockNumber = useBlockNumber();

	const dispatch = useDispatch();
	const state = useSelector((s) => s.transactions);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const transactions = chainId ? state[chainId] || {} : {};

	useEffect(() => {
		if (!chainId || !library || !lastBlockNumber) return;

		Object.keys(transactions)
			.filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
			.forEach((hash) => {
				library
					.getTransactionReceipt(hash)
					.then((receipt) => {
						if (receipt) {
							dispatch(
								finalizeTransaction({
									chainId,
									hash,
									receipt: {
										blockHash: receipt.blockHash,
										blockNumber: receipt.blockNumber,
										contractAddress: receipt.contractAddress,
										from: receipt.from,
										status: receipt.status,
										to: receipt.to,
										transactionHash: receipt.transactionHash,
										transactionIndex: receipt.transactionIndex,
									},
								})
							);

						} else {
							dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }));
						}
					})
					.catch((error) => {
						console.error(`failed to check transaction hash: ${hash}`, error);
					});
			});
	}, [chainId, library, transactions, lastBlockNumber, dispatch]);

	return null;
}
