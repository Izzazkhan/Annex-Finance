import {initialState} from "../initialState";
import {TYPE_INPUT} from "./actions";

export default function burn(state = initialState.burn, action) {
    switch(action.type) {
        case TYPE_INPUT: {
            const { field, typedValue } = action.payload;

            return {
                ...state,
                independentField: field,
                typedValue,
            };
        }
        default: {
            return state;
        }
    }
}
