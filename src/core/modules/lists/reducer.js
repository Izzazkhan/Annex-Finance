import {
	ACCEPT_LIST_UPDATE,
	ADD_LIST,
	REMOVE_LIST,
	SELECT_LIST,
	REJECT_VERSION_UPDATE,
	UPDATE_VERSION,
	FETCH_TOKEN_LIST_PENDING,
	FETCH_TOKEN_LIST_FULFILLED,
	FETCH_TOKEN_LIST_REJECTED,
} from './actions';
import { initialState } from '../initialState';
import {DEFAULT_LIST_OF_LISTS} from "../../../constants/lists";


const NEW_LIST_STATE = {
	error: null,
	current: null,
	loadingRequestId: null,
	pendingUpdate: null,
};

export default function lists(state = initialState.lists, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case FETCH_TOKEN_LIST_PENDING: {
			const oldState = {...state}
			oldState.byUrl[payload.url] = {
				current: null,
				pendingUpdate: null,
				...oldState.byUrl[payload.url],
				loadingRequestId: payload.requestId,
				error: null,
			};

			return oldState;
		}
		case FETCH_TOKEN_LIST_FULFILLED: {
			const { requestId, tokenList, url } = payload;
			const current = state.byUrl[url]?.current;
			const loadingRequestId = state.byUrl[url]?.loadingRequestId;

			const oldState = {...state}

			oldState.byUrl[url] = {
				...oldState.byUrl[url],
				loadingRequestId: null,
				error: null,
				current: tokenList,
				pendingUpdate: null,
			};

			return oldState;
		}
		case FETCH_TOKEN_LIST_REJECTED: {
			const { url, requestId, errorMessage } = payload;
			const oldState = {...state}
			if (oldState.byUrl[url]?.loadingRequestId !== requestId) {
				// no-op since it's not the latest request
				return;
			}

			oldState.byUrl[url] = {
				...oldState.byUrl[url],
				loadingRequestId: null,
				error: errorMessage,
				current: null,
				pendingUpdate: null,
			};

			return oldState;
		}
		case SELECT_LIST: {
			const url = payload.url;

			const oldState = {...state}
			oldState.selectedListUrl = url;
			// automatically adds list
			if (!oldState.byUrl[url]) {
				oldState.byUrl[url] = NEW_LIST_STATE;
			}

			return oldState;
		}
		case ADD_LIST: {
			const url = payload.url;
			const oldState = {...state}

			if (!oldState.byUrl[url]) {
				oldState.byUrl[url] = NEW_LIST_STATE;
			}

			return oldState;
		}
		case REMOVE_LIST: {
			const url = payload.url;
			const oldState = {...state}
			if (oldState.byUrl[url]) {
				delete oldState.byUrl[url];
			}
			if (oldState.selectedListUrl === url) {
				oldState.selectedListUrl = Object.keys(oldState.byUrl)[0];
			}
			return oldState;
		}
		case ACCEPT_LIST_UPDATE: {
			const url = payload.url;
			const oldState = {...state}
			if (!oldState.byUrl[url]?.pendingUpdate) {
				throw new Error("accept list update called without pending update");
			}
			oldState.byUrl[url] = {
				...oldState.byUrl[url],
				pendingUpdate: null,
				current: oldState.byUrl[url].pendingUpdate,
			};

			return oldState;
		}
		case UPDATE_VERSION: {
			const oldState = {...state}
			if (!oldState.lastInitializedDefaultListOfLists) {
				oldState.byUrl = initialState.byUrl;
				oldState.selectedListUrl = undefined;
			} else if (oldState.lastInitializedDefaultListOfLists) {
				const lastInitializedSet = oldState.lastInitializedDefaultListOfLists.reduce(
					(s, l) => s.add(l),
						// eslint-disable-next-line no-undef
						new Set()
				);
				// eslint-disable-next-line no-undef
				const newListOfListsSet = DEFAULT_LIST_OF_LISTS.reduce((s, l) => s.add(l), new Set());

				DEFAULT_LIST_OF_LISTS.forEach((listUrl) => {
					if (!lastInitializedSet.has(listUrl)) {
						oldState.byUrl[listUrl] = NEW_LIST_STATE;
					}
				});

				oldState.lastInitializedDefaultListOfLists.forEach((listUrl) => {
					if (!newListOfListsSet.has(listUrl)) {
						delete oldState.byUrl[listUrl];
					}
				});
			}

			oldState.lastInitializedDefaultListOfLists = DEFAULT_LIST_OF_LISTS;

			return oldState;
		}
		default: {
			return state;
		}
	}
}
