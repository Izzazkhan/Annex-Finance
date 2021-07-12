import {createAction} from "redux-actions";


/**
 * Action Types
 */
export const ACCEPT_LIST_UPDATE = '@lists/acceptListUpdate';
export const ADD_LIST = '@lists/addList';
export const REMOVE_LIST = '@lists/removeList';
export const SELECT_LIST = '@lists/selectList';
export const REJECT_VERSION_UPDATE = '@lists/rejectVersionUpdate';
export const UPDATE_VERSION = '@lists/updateVersion';

export const FETCH_TOKEN_LIST_PENDING = '@lists/fetchTokenList/pending'
export const FETCH_TOKEN_LIST_FULFILLED = '@lists/fetchTokenList/fulfilled'
export const FETCH_TOKEN_LIST_REJECTED = '@lists/fetchTokenList/rejected'


/**
 * Action Creators
 */
export const listActionCreators = {
	acceptListUpdate: createAction(ACCEPT_LIST_UPDATE),
	addList: createAction(ADD_LIST),
	removeList: createAction(REMOVE_LIST),
	selectList: createAction(SELECT_LIST),
	rejectVersionUpdate: createAction(REJECT_VERSION_UPDATE),
	updateVersion: createAction(UPDATE_VERSION),
	fetchTokenList: {
		pending: createAction(FETCH_TOKEN_LIST_PENDING),
		fulfilled: createAction(FETCH_TOKEN_LIST_FULFILLED),
		rejected: createAction(FETCH_TOKEN_LIST_REJECTED)
	},
};


