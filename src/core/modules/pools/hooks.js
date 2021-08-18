import {useDispatch, useSelector} from "react-redux";
import useRefresh from "../../../hooks/useRefresh";
import {useEffect, useMemo} from "react";
import {simpleRpcProvider} from "../../../utils/providers";
import {useActiveWeb3React} from "../../../hooks";
import BigNumber from "bignumber.js";
import {transformPool} from "./helpers";
import {
    fetchCakeVaultFees,
    fetchCakeVaultPublicData, fetchCakeVaultUserData,
    fetchPoolsPublicDataAsync,
    fetchPoolsStakingLimitsAsync,
    fetchPoolsUserDataAsync
} from "./actions";

export const useFetchPublicPoolsData = () => {
    const dispatch = useDispatch()
    const { slowRefresh } = useRefresh()

    useEffect(() => {
        const fetchPoolsPublicData = async () => {
            const blockNumber = await simpleRpcProvider.getBlockNumber()
            dispatch(fetchPoolsPublicDataAsync(blockNumber))
        }

        fetchPoolsPublicData()
        dispatch(fetchPoolsStakingLimitsAsync())
    }, [dispatch, slowRefresh])
}

export const usePools = (account) => {
    const { fastRefresh } = useRefresh()
    const dispatch = useDispatch()
    useEffect(() => {
        if (account) {
            dispatch(fetchPoolsUserDataAsync(account))
        }
    }, [account, dispatch, fastRefresh])

    const { pools, userDataLoaded } = useSelector((state) => ({
        pools: state.pools.data,
        userDataLoaded: state.pools.userDataLoaded,
    }))
    return { pools: pools.map(transformPool), userDataLoaded }
}

export const useFetchCakeVault = () => {
    const { account } = useActiveWeb3React()
    const { fastRefresh } = useRefresh()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchCakeVaultPublicData())
    }, [dispatch, fastRefresh])

    useEffect(() => {
        dispatch(fetchCakeVaultUserData({ account }))
    }, [dispatch, fastRefresh, account])

    useEffect(() => {
        dispatch(fetchCakeVaultFees())
    }, [dispatch])
}

export const useCakeVault = () => {
    const {
        totalShares: totalSharesAsString,
        pricePerFullShare: pricePerFullShareAsString,
        totalCakeInVault: totalCakeInVaultAsString,
        estimatedCakeBountyReward: estimatedCakeBountyRewardAsString,
        totalPendingCakeHarvest: totalPendingCakeHarvestAsString,
        fees: { performanceFee, callFee, withdrawalFee, withdrawalFeePeriod },
        userData: {
            isLoading,
            userShares: userSharesAsString,
            cakeAtLastUserAction: cakeAtLastUserActionAsString,
            lastDepositedTime,
            lastUserActionTime,
        },
    } = useSelector((state) => state.pools.cakeVault)

    const estimatedCakeBountyReward = useMemo(() => {
        return new BigNumber(estimatedCakeBountyRewardAsString)
    }, [estimatedCakeBountyRewardAsString])

    const totalPendingCakeHarvest = useMemo(() => {
        return new BigNumber(totalPendingCakeHarvestAsString)
    }, [totalPendingCakeHarvestAsString])

    const totalShares = useMemo(() => {
        return new BigNumber(totalSharesAsString)
    }, [totalSharesAsString])

    const pricePerFullShare = useMemo(() => {
        return new BigNumber(pricePerFullShareAsString)
    }, [pricePerFullShareAsString])

    const totalCakeInVault = useMemo(() => {
        return new BigNumber(totalCakeInVaultAsString)
    }, [totalCakeInVaultAsString])

    const userShares = useMemo(() => {
        return new BigNumber(userSharesAsString)
    }, [userSharesAsString])

    const cakeAtLastUserAction = useMemo(() => {
        return new BigNumber(cakeAtLastUserActionAsString)
    }, [cakeAtLastUserActionAsString])

    return {
        totalShares,
        pricePerFullShare,
        totalCakeInVault,
        estimatedCakeBountyReward,
        totalPendingCakeHarvest,
        fees: {
            performanceFee,
            callFee,
            withdrawalFee,
            withdrawalFeePeriod,
        },
        userData: {
            isLoading,
            userShares,
            cakeAtLastUserAction,
            lastDepositedTime,
            lastUserActionTime,
        },
    }
}
