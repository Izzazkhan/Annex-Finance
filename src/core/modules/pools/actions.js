/**
 * Action Types
 */
import {createAction} from "redux-actions";
import {
    fetchPoolsAllowance,
    fetchPoolsBlockLimits,
    fetchPoolsStakingLimits,
    fetchPoolsTotalStaking,
    fetchPublicVaultData,
    fetchUserBalances,
    fetchUserPendingRewards,
    fetchUserStakeBalances,
    fetchVaultFees, fetchVaultUser,
    getTokenPricesFromFarm
} from "./helpers";
import { getAddress } from "../../../utils/addressHelper";
import BigNumber from "bignumber.js";
import {getBalanceNumber} from "../../../utils/formatBalance";
import poolsConfig from '../../../constants/pools';
import {getPoolApr} from "../../../utils/apr";
import {BIG_ZERO} from "../../../utils/bigNumber";

export const SET_POOLS_PUBLIC_DATA = "SET_POOLS_PUBLIC_DATA"
export const SET_POOLS_USER_DATA = "SET_POOLS_USER_DATA"
export const UPDATE_POOLS_USER_DATA = "UPDATE_POOLS_USER_DATA"
export const SET_CAKE_VAULT_PUBLIC_DATA = "SET_CAKE_VAULT_PUBLIC_DATA"
export const SET_CAKE_VAULT_FEES = "SET_CAKE_VAULT_FEES"
export const SET_CAKE_VAULT_USER_DATA = "SET_CAKE_VAULT_USER_DATA"



/**
 * Action Creators
 */
export const poolsActionCreators = {
    setPoolsPublicData: createAction(SET_POOLS_PUBLIC_DATA),
    setPoolsUserData: createAction(SET_POOLS_USER_DATA),
    updatePoolsUserData: createAction(UPDATE_POOLS_USER_DATA),
    setCakeVaultPublicData: createAction(SET_CAKE_VAULT_PUBLIC_DATA),
    setCakeVaultFees: createAction(SET_CAKE_VAULT_FEES),
    setCakeVaultUserData: createAction(SET_CAKE_VAULT_USER_DATA),
}



/**
 * Thunk functions
 */
export const fetchPoolsPublicDataAsync = (currentBlock) => async (dispatch, getState) => {
    const blockLimits = await fetchPoolsBlockLimits()
    const totalStakings = await fetchPoolsTotalStaking()

    const prices = getTokenPricesFromFarm(getState().farms.data)

    const liveData = poolsConfig.map((pool) => {
        const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
        const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
        const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
        const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

        const stakingTokenAddress = pool.stakingToken.address ? getAddress(pool.stakingToken.address).toLowerCase() : null
        const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

        const earningTokenAddress = pool.earningToken.address ? getAddress(pool.earningToken.address).toLowerCase() : null
        const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
        const apr = !isPoolFinished
            ? getPoolApr(
                stakingTokenPrice,
                earningTokenPrice,
                getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
                parseFloat(pool.tokenPerBlock),
            )
            : 0

        return {
            ...blockLimit,
            ...totalStaking,
            stakingTokenPrice,
            earningTokenPrice,
            apr,
            isFinished: isPoolFinished,
        }
    })

    dispatch(poolsActionCreators.setPoolsPublicData(liveData))
}


export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
    const poolsWithStakingLimit = getState()
        .pools.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
        .map((pool) => pool.sousId)

    const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

    const stakingLimitData = poolsConfig.map((pool) => {
        if (poolsWithStakingLimit.includes(pool.sousId)) {
            return { sousId: pool.sousId }
        }
        const stakingLimit = stakingLimits[pool.sousId] || BIG_ZERO
        return {
            sousId: pool.sousId,
            stakingLimit: stakingLimit.toJSON(),
        }
    })

    dispatch(poolsActionCreators.setPoolsPublicData(stakingLimitData))
}


export const fetchPoolsUserDataAsync = (account) =>
    async (dispatch) => {
        const allowances = await fetchPoolsAllowance(account)
        const stakingTokenBalances = await fetchUserBalances(account)
        const stakedBalances = await fetchUserStakeBalances(account)
        const pendingRewards = await fetchUserPendingRewards(account)

        const userData = poolsConfig.map((pool) => ({
            sousId: pool.sousId,
            allowance: allowances[pool.sousId],
            stakingTokenBalance: stakingTokenBalances[pool.sousId],
            stakedBalance: stakedBalances[pool.sousId],
            pendingReward: pendingRewards[pool.sousId],
        }))

        dispatch(poolsActionCreators.setPoolsUserData(userData))
    }


export const updateUserAllowance = (sousId, account) =>
    async (dispatch) => {
        const allowances = await fetchPoolsAllowance(account)
        dispatch(poolsActionCreators.updatePoolsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
    }

export const updateUserBalance = (sousId, account) =>
    async (dispatch) => {
        const tokenBalances = await fetchUserBalances(account)
        dispatch(poolsActionCreators.updatePoolsUserData({ sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }))
    }

export const updateUserStakedBalance = (sousId, account) =>
    async (dispatch) => {
        const stakedBalances = await fetchUserStakeBalances(account)
        dispatch(poolsActionCreators.updatePoolsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
    }

export const updateUserPendingReward = (sousId, account) =>
    async (dispatch) => {
        const pendingRewards = await fetchUserPendingRewards(account)
        dispatch(poolsActionCreators.updatePoolsUserData({ sousId, field: 'pendingReward', value: pendingRewards[sousId] }))
    }


export const fetchCakeVaultPublicData = () => {
    return async dispatch => {
        const publicVaultInfo = await fetchPublicVaultData()
        dispatch(poolsActionCreators.setCakeVaultPublicData(publicVaultInfo));
    }
}

export const fetchCakeVaultFees = () => {
    return async dispatch => {
        const vaultFees = await fetchVaultFees()
        dispatch(poolsActionCreators.setCakeVaultFees(vaultFees));
    }
}

export const fetchCakeVaultUserData = ({ account }) => {
    return async dispatch => {
        const userData = await fetchVaultUser(account)
        dispatch(poolsActionCreators.setCakeVaultUserData(userData));
    }
}
