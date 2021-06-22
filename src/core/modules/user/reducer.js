import {
	UPDATE_USER_DEADLINE,
	UPDATE_USER_SLIPPAGE_TOLERANCE
} from './actions';
import { initialState } from '../initialState';

const currentTimestamp = () => new Date().getTime();

export default function user(state = initialState.user, action = {}) {
	const { type, payload } = action;

	switch (type) {
		case UPDATE_USER_SLIPPAGE_TOLERANCE: {
			return {
				...state,
				userSlippageTolerance: payload.userSlippageTolerance,
				timestamp: currentTimestamp()
			}
		}
		case UPDATE_USER_DEADLINE: {
			return {
				...state,
				userDeadline: payload.userDeadline,
				timestamp: currentTimestamp()
			}
		}
		default: {
			return state;
		}
	}
}
