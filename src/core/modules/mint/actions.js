import {createAction} from "redux-actions";

export const Field = {
    CURRENCY_A: "CURRENCY_A",
    CURRENCY_B: "CURRENCY_B",
}

/**
 * Action Types
 */
export const TYPE_INPUT_MINT = '@mint/typeInputMint';
export const RESET_MINT_STATE = '@mint/resetMintState';

/**
 * Action Creators
 */
export const mintActionCreators = {
    typeInput: createAction(TYPE_INPUT_MINT),
    resetMintState: createAction(RESET_MINT_STATE),
};


