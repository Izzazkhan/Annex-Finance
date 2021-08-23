import {initialState} from "../initialState";
import {
    LOAD_ARCHIVED_FARMS_DATA,
    SET_FARMS_PUBLIC_DATA,
    SET_FARMS_USER_DATA
} from "./actions";

export default function farms(state = initialState.farms, action) {
    switch(action.type) {
        case LOAD_ARCHIVED_FARMS_DATA: {
            return {
                ...state,
                loadArchivedFarmsData: action.payload
            }
        }
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
            const newData = state.data.map((farm) => {
                const liveFarmData = action.payload.find((farmData) => farmData.pid === farm.pid)
                return { ...farm, ...liveFarmData }
            })

            return {
                ...state,
                data: newData
            }
        }
        default:
            return state;
    }
}
