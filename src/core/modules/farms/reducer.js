import {initialState} from "../initialState";
import {
    SET_FARMS_PUBLIC_DATA,
    SET_FARMS_USER_DATA,
} from "./actions";

export default function farms(state = initialState.farms, action) {
    switch(action.type) {
        case SET_FARMS_USER_DATA: {
            const newState = {
                ...state,
                data: [
                    ...state.data
                ]
            }
            action.payload.forEach((userDataEl) => {
                const { pid } = userDataEl
                const index = newState.data.findIndex((farm) => farm.pid === pid)
                newState.data[index] = { ...newState.data[index], userData: userDataEl }
            })

            return {
                ...newState,
                userDataLoaded: true
            }
        }
        case SET_FARMS_PUBLIC_DATA: {
            return {
                ...state,
                data: action.payload
            }
        }
        default:
            return state;
    }
}
