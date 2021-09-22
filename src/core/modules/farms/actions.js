import { createAction } from "redux-actions";
import {
    fetchFarms,
    fetchFarmsPrices,
    fetchFarmUserAllowances, fetchFarmUserEarnings,
    fetchFarmUserStakedBalances,
    fetchFarmUserTokenBalances
} from "./helpers";
import priceHelperLpsConfig from '../../../constants/priceHelperLPs';
import farmsConfig from '../../../constants/farms';

/**
 * Action Types
 */
export const LOAD_ARCHIVED_FARMS_DATA = "LOAD_ARCHIVED_FARMS_DATA";
export const SET_FARMS_PUBLIC_DATA = "SET_FARMS_PUBLIC_DATA";
export const SET_FARMS_USER_DATA = "SET_FARMS_USER_DATA";
export const GET_FARMS_ACCOUNT_DATA = "GET_FARMS_ACCOUNT_DATA";
export const SET_FARMS_ACCOUNT_DATA = "SET_FARMS_ACCOUNT_DATA";


/**
 * Action Creators
 */
export const farmsActionCreators = {
    loadArchivedFarmsData: createAction(LOAD_ARCHIVED_FARMS_DATA),
    setFarmsPublicData: createAction(SET_FARMS_PUBLIC_DATA),
    setFarmsUserData: createAction(SET_FARMS_USER_DATA),
    getFarmsData: createAction(GET_FARMS_ACCOUNT_DATA),
    setFarmsAccountData: createAction(SET_FARMS_ACCOUNT_DATA),
};


/**
 * Thunk functions
 */

export const fetchFarmsPublicDataAsync = (pids) => {
    return async (dispatch) => {
        const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))

        const farms = await fetchFarms(farmsToFetch)
        const farmsWithPrices = await fetchFarmsPrices(farms)

        // Filter out price helper LP config farms
        const farmsWithoutHelperLps = farmsWithPrices.filter((farm) => {
            return farm.pid || farm.pid === 0
        })

        dispatch(farmsActionCreators.setFarmsPublicData(farmsWithoutHelperLps))
    }
}

export const fetchFarmsUserDataAsync = ({ account, pids }) => {
    return async dispatch => {
        const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))
        const userFarmAllowances = await fetchFarmUserAllowances(account, farmsToFetch)
        const userFarmTokenBalances = await fetchFarmUserTokenBalances(account, farmsToFetch)
        const userStakedBalances = await fetchFarmUserStakedBalances(account, farmsToFetch)
        const userFarmEarnings = await fetchFarmUserEarnings(account, farmsToFetch)

        const farms = userFarmAllowances.map((farmAllowance, index) => {
            return {
                pid: farmsToFetch[index].pid,
                allowance: userFarmAllowances[index],
                tokenBalance: userFarmTokenBalances[index],
                stakedBalance: userStakedBalances[index],
                earnings: userFarmEarnings[index],
            }
        })

        dispatch(farmsActionCreators.setFarmsUserData(farms));
    }
}
