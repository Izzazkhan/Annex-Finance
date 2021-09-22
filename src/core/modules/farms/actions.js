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
import { restService } from "utilities";

/**
 * Action Types
 */
export const LOAD_ARCHIVED_FARMS_DATA = "LOAD_ARCHIVED_FARMS_DATA";
export const SET_FARMS_PUBLIC_DATA = "SET_FARMS_PUBLIC_DATA";
export const SET_FARMS_USER_DATA = "SET_FARMS_USER_DATA";
export const SET_FARMS_ACCOUNT_DATA = "SET_FARMS_ACCOUNT_DATA";


/**
 * Action Creators
 */
export const farmsActionCreators = {
    loadArchivedFarmsData: createAction(LOAD_ARCHIVED_FARMS_DATA),
    setFarmsPublicData: createAction(SET_FARMS_PUBLIC_DATA),
    setFarmsUserData: createAction(SET_FARMS_USER_DATA),
};


/**
 * Thunk functions
 */

export const fetchFarmsPublicDataAsync = () => {
    return async (dispatch) => {
        const response = await restService({
            api: `https://api.annex.finance/api/v1/farming`,
            third_party: true,
            method: 'GET',
            params: {}
        });

        if (response.status === 200) {
            dispatch(farmsActionCreators.setFarmsPublicData(response.data.data.pairs))
        }
    }
}

export const fetchFarmsUserDataAsync = ({ account, data }) => {
    return async dispatch => {
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

        dispatch(farmsActionCreators.setFarmsUserData(farms));
    }
}
