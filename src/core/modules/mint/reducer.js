import {
    RESET_MINT_STATE,
    TYPE_INPUT_MINT
} from './actions';
import { initialState } from '../initialState';

export default function mint(state = initialState.mint, action = {}) {
    const { type, payload } = action;

    switch (type) {
        case RESET_MINT_STATE: {
            return initialState.mint
        }
        case TYPE_INPUT_MINT: {
            const { field, typedValue, noLiquidity } = payload;
            console.log('=======', payload)
            if (noLiquidity) {
                // they're typing into the field they've last typed in
                if (field === state.independentField) {
                    return {
                        ...state,
                        independentField: field,
                        typedValue,
                    };
                }
                // they're typing into a new field, store the other value

                return {
                    ...state,
                    independentField: field,
                    typedValue,
                    otherTypedValue: state.typedValue,
                };
            }
            return {
                ...state,
                independentField: field,
                typedValue,
                otherTypedValue: "",
            };
        }
        default: {
            return state;
        }
    }
}
