import {createAction} from "redux-actions";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const LOWER_HEX_REGEX = /^0x[a-f0-9]*$/;
export function toCallKey(call) {
	if (!ADDRESS_REGEX.test(call.address)) {
		throw new Error(`Invalid address: ${call.address}`);
	}
	if (!LOWER_HEX_REGEX.test(call.callData)) {
		throw new Error(`Invalid hex: ${call.callData}`);
	}
	return `${call.address}-${call.callData}`;
}

export function parseCallKey(callKey) {
	const pcs = callKey.split("-");
	if (pcs.length !== 2) {
		throw new Error(`Invalid call key: ${callKey}`);
	}
	return {
		address: pcs[0],
		callData: pcs[1],
	};
}



/**
 * Action Types
 */
export const ADD_MULTICALL_LISTENERS = '@multicall/addMulticallListeners';
export const REMOVE_MULTICALL_LISTENERS = '@multicall/removeMulticallListeners';
export const FETCHING_MULTICALL_RESULTS = '@multicall/fetchingMulticallResults';
export const ERROR_FETCHING_MULTICALL_RESULTS = '@multicall/errorFetchingMulticallResults';
export const UPDATE_MULTICALL_RESULTS = '@multicall/updateMulticallResults';


/**
 * Action Creators
 */
export const multicallActionCreators = {
	addMulticallListeners: createAction(ADD_MULTICALL_LISTENERS),
	removeMulticallListeners: createAction(REMOVE_MULTICALL_LISTENERS),
	fetchingMulticallResults: createAction(FETCHING_MULTICALL_RESULTS),
	errorFetchingMulticallResults: createAction(ERROR_FETCHING_MULTICALL_RESULTS),
	updateMulticallResults: createAction(UPDATE_MULTICALL_RESULTS),
};


