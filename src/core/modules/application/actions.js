import {createAction} from "redux-actions";

/**
 * Action Types
 */
export const UPDATE_BLOCK_NUMBER = '@application/updateBlockNumber';


/**
 * Action Creators
 */
export const applicationActionCreators = {
	updateBlockNumber: createAction(UPDATE_BLOCK_NUMBER),
};


