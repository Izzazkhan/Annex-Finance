import {
	ADD_TRANSACTION,
	CHECKED_TRANSACTION,
	FINALIZE_TRANSACTION,
	CLEAR_ALL_TRANSACTION
} from './actions';
import { initialState } from '../initialState';

const now = () => new Date().getTime();

export default function transaction(state = initialState.transaction, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case ADD_TRANSACTION: {
			const { chainId, hash, approval, summary, from } = payload;
			const oldState = { ...state };
			if (oldState[chainId]?.[hash]) {
				throw Error("Attempted to add existing transaction.");
			}
			const txs = oldState[chainId] ?? {};
			txs[hash] = { hash, approval, summary, from, addedTime: now() };
			oldState[chainId] = txs;

			return oldState;
		}
		case CLEAR_ALL_TRANSACTION: {
			const { chainId } = payload;
			return {
				...state,
				[chainId]: {}
			}
		}
		case CHECKED_TRANSACTION: {
			const { chainId, hash, blockNumber } = payload;

			const tx = state[chainId]?.[hash];
			if (!tx) {
				return state;
			}
			if (!tx.lastCheckedBlockNumber) {
				tx.lastCheckedBlockNumber = blockNumber;
			} else {
				tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
			}

			return state;
		}

		case FINALIZE_TRANSACTION: {
			const { chainId, hash, receipt } = payload;

			const tx = state[chainId]?.[hash];
			if (!tx) {
				return;
			}
			tx.receipt = receipt;
			tx.confirmedTime = now();

			return state;
		}
		default: {
			return state;
		}
	}
}
