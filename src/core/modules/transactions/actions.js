import {createAction} from "redux-actions";

/**
 * Action Types
 */
export const ADD_TRANSACTION = '@transactions/addTransaction';
export const FINALIZE_TRANSACTION = '@transactions/finalizeTransaction';
export const CLEAR_ALL_TRANSACTION = '@transactions/clearAllTransactions';
export const CHECKED_TRANSACTION = '@transactions/checkedTransaction';


/**
 * Action Creators
 */
export const transactionActionCreators = {
	addTransaction: createAction(ADD_TRANSACTION),
	finalizeTransaction: createAction(FINALIZE_TRANSACTION),
	clearAllTransactions: createAction(CLEAR_ALL_TRANSACTION),
	checkedTransaction: createAction(CHECKED_TRANSACTION),
};


