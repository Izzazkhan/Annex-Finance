import {initialState} from "../initialState";
import {
    SET_POOLS_PUBLIC_DATA,
    SET_CAKE_VAULT_FEES,
    SET_POOLS_USER_DATA,
    SET_CAKE_VAULT_PUBLIC_DATA,
    SET_CAKE_VAULT_USER_DATA,
    UPDATE_POOLS_USER_DATA
} from "./actions";

export default function pools(state = initialState.pools, action) {
    switch(action.type) {
        case SET_POOLS_PUBLIC_DATA: {
            const livePoolsData = action.payload
            const newData = state.data.map((pool) => {
                const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
                return { ...pool, ...livePoolData }
            })

            return {
                ...state,
                data: newData
            }
        }
        case SET_POOLS_USER_DATA: {
            const userData = action.payload
            const newData = state.data.map((pool) => {
                const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
                return { ...pool, userData: userPoolData }
            })

            return {
                ...state,
                data: newData,
                userDataLoaded: true,
            }
        }
        case UPDATE_POOLS_USER_DATA: {
            const { field, value, sousId } = action.payload
            const index = state.data.findIndex((p) => p.sousId === sousId)

            if (index >= 0) {
                return {
                    ...state,
                    data: state.data.map((item, _i) => {
                        if(_i === index) {
                            return {
                                ...item,
                                userData: {
                                    ...item.userData,
                                    [field]: value
                                }
                            }
                        }
                        return item;
                    })
                }
            } else {
                return state;
            }
        }
        case SET_CAKE_VAULT_PUBLIC_DATA: {
            return {
                ...state,
                cakeVault: {
                    ...state.cakeVault,
                    ...action.payload
                }
            }
        }
        case SET_CAKE_VAULT_FEES: {
            const fees = action.payload;
            return {
                ...state,
                cakeVault: {
                    ...state.cakeVault,
                    fees,
                }
            }
        }
        case SET_CAKE_VAULT_USER_DATA: {
            const userData = { ...action.payload };
            userData.isLoading = false;
            return {
                ...state,
                cakeVault: {
                    ...state.cakeVault,
                    userData
                }
            }
        }
        default: {
            return state;
        }
    }
}
