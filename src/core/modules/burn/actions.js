import { createAction } from "@reduxjs/toolkit";

export const Field = {
    LIQUIDITY_PERCENT: "LIQUIDITY_PERCENT",
    LIQUIDITY: "LIQUIDITY",
    CURRENCY_A: "CURRENCY_A",
    CURRENCY_B: "CURRENCY_B",
}


/**
 * Action Types
 */
export const TYPE_INPUT = '@burn/typeInput';



/**
 * Action Creators
 */
export const burnActionCreators = {
    typeInput: createAction(TYPE_INPUT),
};

