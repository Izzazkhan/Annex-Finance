import { createAction } from "redux-actions";
import {
    fetchFarmUserAllowances,
    fetchFarmUserEarnings,
    fetchFarmUserStakedBalances,
    fetchFarmUserTokenBalances
} from "./helpers";
import { restService } from "utilities";

/**
 * Action Types
 */
export const SET_FARMS_PUBLIC_DATA = "SET_FARMS_PUBLIC_DATA";
export const SET_FARMS_USER_DATA = "SET_FARMS_USER_DATA";
export const SET_LOADING = "SET_LOADING"

/**
 * Action Creators
 */
export const farmsActionCreators = {
    setFarmsPublicData: createAction(SET_FARMS_PUBLIC_DATA),
    setFarmsUserData: createAction(SET_FARMS_USER_DATA),
    setLoading: createAction(SET_LOADING)
};


/**
 * Thunk functions
 */

export const setLoading = (loading) => {
    return farmsActionCreators.setLoading(loading)
}

export const fetchFarmsPublicDataAsync = ({ account, data }) => {
    return async (dispatch) => {
        dispatch(setLoading(true))
        const response = await restService({
            api: `https://api.annex.finance/api/v1/farming`,
            third_party: true,
            method: 'GET',
            params: {}
        });

        if (response.status === 200) {
            dispatch(farmsActionCreators.setFarmsPublicData(response.data.data.pairs))
            if (account) {
                dispatch(fetchFarmsUserDataAsync({ account, data }))
            } else {
                dispatch(setLoading(false))
            }
        } else {
            dispatch(setLoading(false))
        }
    }
}

export const fetchFarmsUserDataAsync = ({ account, data }) => {
    return async dispatch => {
        dispatch(setLoading(true))
        const [userFarmAllowances, userFarmTokenBalances, userStakedBalances, userFarmEarnings] = await Promise.all([
            fetchFarmUserAllowances(account, data),
            fetchFarmUserTokenBalances(account, data),
            fetchFarmUserStakedBalances(account, data),
            fetchFarmUserEarnings(account, data),
        ])

        const farms = userFarmAllowances.map((farmAllowance, index) => {
            return {
                pid: data[index].pid,
                allowance: userFarmAllowances[index],
                tokenBalance: userFarmTokenBalances[index],
                stakedBalance: userStakedBalances[index],
                earnings: userFarmEarnings[index],
            }
        })
        dispatch(setLoading(false))
        dispatch(farmsActionCreators.setFarmsUserData(farms));
    }
}
