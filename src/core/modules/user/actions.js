import {createAction} from "redux-actions";

/**
 * Action Types
 */
export const UPDATE_USER_SLIPPAGE_TOLERANCE = '@user/updateUserSlippageTolerance';
export const UPDATE_USER_DEADLINE = '@user/updateUserDeadline';


/**
 * Action Creators
 */
export const userActionCreators = {
	updateUserSlippageTolerance: createAction(UPDATE_USER_SLIPPAGE_TOLERANCE),
	updateUserDeadline: createAction(UPDATE_USER_DEADLINE),
};


