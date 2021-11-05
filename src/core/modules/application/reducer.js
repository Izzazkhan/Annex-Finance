import {
	UPDATE_BLOCK_NUMBER
} from './actions';
import { initialState } from '../initialState';


export default function application(state = initialState.application, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case UPDATE_BLOCK_NUMBER: {
			const { chainId, blockNumber } = payload;
			// let newBlockNumber;
			// if (typeof state.blockNumber[chainId] !== "number") {
			// 	newBlockNumber = blockNumber;
			// } else {
			// 	newBlockNumber = Math.max(blockNumber, state.blockNumber[chainId]);
			// }

			return {
				...state,
				currentChainId: chainId,
				blockNumber: {
					...state.blockNumber,
					[chainId]: blockNumber
				}
			}
		}
		default: {
			return state;
		}
	}
}
