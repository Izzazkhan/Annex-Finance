import {initialState} from "../initialState";
import {burnActionCreators} from "./actions";

export default function burn(state = initialState.burn, action) {
    switch(action.type) {
        case burnActionCreators.typeInput: {
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
