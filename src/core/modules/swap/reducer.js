import {
	Field,
	SET_RECIPIENT,
	REPLACE_SWAP_STATE,
	TYPE_INPUT,
	SWITCH_CURRENCIES,
	SELECT_CURRENCY
} from './actions';
import { initialState } from '../initialState';

export default function swap(state = initialState.swap, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case SET_RECIPIENT: {
			return {
				...state,
				recipient: payload.recipient
			};
		}
		case TYPE_INPUT: {
			return {
				...state,
				independentField: payload.field,
				typedValue: payload.typedValue
			}
		}
		case SWITCH_CURRENCIES: {
			return {
				...state,
				independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
				[Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
				[Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
			}
		}
		case SELECT_CURRENCY: {
			const otherField = payload.field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
			if (payload.currencyId === state[otherField].currencyId) {
				// the case where we have to swap the order
				return {
					...state,
					independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
					[payload.field]: { currencyId: payload.currencyId },
					[otherField]: { currencyId: state[payload.field].currencyId },
				};
			}
			// the normal case
			return {
				...state,
				[payload.field]: { currencyId: payload.currencyId },
			};
		}
		case REPLACE_SWAP_STATE: {
			return {
				[Field.INPUT]: {
					currencyId: payload.inputCurrencyId,
				},
				[Field.OUTPUT]: {
					currencyId: payload.outputCurrencyId,
				},
				independentField: payload.field,
				typedValue: payload.typedValue,
				recipient: payload.recipient,
			}
		}
		default: {
			return state;
		}
	}
}
