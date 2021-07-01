import {createAction} from "redux-actions";

export const Field = {
	INPUT: "INPUT",
	OUTPUT: "OUTPUT"
}


/**
 * Action Types
 */
export const SELECT_CURRENCY = '@swap/selectCurrency';
export const SWITCH_CURRENCIES = '@swap/switchCurrencies';
export const TYPE_INPUT = '@swap/typeInput';
export const REPLACE_SWAP_STATE = '@swap/replaceSwapState';
export const SET_RECIPIENT = '@swap/setRecipient';

/**
 * Action Creators
 */
export const swapActionCreators = {
	selectCurrency: createAction(SELECT_CURRENCY),
	switchCurrencies: createAction(SWITCH_CURRENCIES),
	typeInput: createAction(TYPE_INPUT),
	replaceSwapState: createAction(REPLACE_SWAP_STATE),
	setRecipient: createAction(SET_RECIPIENT),
};

