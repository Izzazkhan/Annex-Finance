import {
	UPDATE_MULTICALL_RESULTS,
	ERROR_FETCHING_MULTICALL_RESULTS,
	FETCHING_MULTICALL_RESULTS,
	REMOVE_MULTICALL_LISTENERS,
	ADD_MULTICALL_LISTENERS, toCallKey
} from './actions';
import { initialState } from '../initialState';
import {notNull} from "../../../utils/notNull";

export default function multicall(state = initialState.multicall, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case ADD_MULTICALL_LISTENERS: {
			let { blocksPerFetch } = payload?.options || {};
			if(!blocksPerFetch) {
				blocksPerFetch = 1
			}
			const listeners = state.callListeners
				? state.callListeners
				: (state.callListeners = {});
			listeners[payload.chainId] = notNull(listeners[payload.chainId], {});
			payload.calls.forEach((call) => {
				const callKey = toCallKey(call);
				listeners[payload.chainId][callKey] = notNull(listeners[payload.chainId][callKey], {});
				listeners[payload.chainId][callKey][blocksPerFetch] =
					(notNull(listeners[payload.chainId][callKey][blocksPerFetch], 0)) + 1;
			});

			return state;
		}
		case REMOVE_MULTICALL_LISTENERS: {
			let { blocksPerFetch } = payload?.options || {};
			if(!blocksPerFetch) {
				blocksPerFetch = 1
			}
			const listeners = state.callListeners
				? state.callListeners
				: (state.callListeners = {});

			if (!listeners[payload.chainId]) return;
			payload.calls.forEach((call) => {
				const callKey = toCallKey(call);
				if (!listeners[payload.chainId][callKey]) return;
				if (!listeners[payload.chainId][callKey][blocksPerFetch]) return;

				if (listeners[payload.chainId][callKey][blocksPerFetch] === 1) {
					delete listeners[payload.chainId][callKey][blocksPerFetch];
				} else {
					listeners[payload.chainId][callKey][blocksPerFetch]--;
				}
			});

			return state;
		}
		case FETCHING_MULTICALL_RESULTS: {
			state.callResults[payload.chainId] = notNull(state.callResults[payload.chainId], {});
			payload.calls.forEach((call) => {
				const callKey = toCallKey(call);
				const current = state.callResults[payload.chainId][callKey];
				if (!current) {
					state.callResults[payload.chainId][callKey] = {
						fetchingBlockNumber: payload.fetchingBlockNumber,
					};
				} else {
					if ((notNull(current.fetchingBlockNumber, 0)) >= payload.fetchingBlockNumber) return;
					// eslint-disable-next-line max-len
					state.callResults[payload.chainId][callKey].fetchingBlockNumber = payload.fetchingBlockNumber;
				}
			});

			return state;
		}
		case ERROR_FETCHING_MULTICALL_RESULTS: {
			state.callResults[payload.chainId] = notNull(state.callResults[payload.chainId], {});
			payload.calls.forEach((call) => {
				const callKey = toCallKey(call);
				const current = state.callResults[payload.chainId][callKey];
				if (!current) return; // only should be dispatched if we are already fetching
				if (current.fetchingBlockNumber === payload.fetchingBlockNumber) {
					delete current.fetchingBlockNumber;
					current.data = null;
					current.blockNumber = payload.fetchingBlockNumber;
				}
			});

			return state;
		}
		case UPDATE_MULTICALL_RESULTS: {
			state.callResults[payload.chainId] = notNull(state.callResults[payload.chainId], {});
			Object.keys(payload.results).forEach((callKey) => {
				const current = state.callResults[payload.chainId][callKey];
				if ((notNull(current?.blockNumber, 0)) > payload.blockNumber) return;
				state.callResults[payload.chainId][callKey] = {
					data: payload.results[callKey],
					blockNumber: payload.blockNumber,
				};
			});

			return state;
		}
		default: {
			return state;
		}
	}
}
