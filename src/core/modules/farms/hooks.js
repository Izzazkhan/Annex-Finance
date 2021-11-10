import { useDispatch, useSelector } from "react-redux";
import useRefresh from "../../../hooks/useRefresh";
import { useActiveWeb3React } from "../../../hooks";
import { useEffect } from "react";
import BigNumber from "bignumber.js";
import { BIG_ZERO } from "../../../utils/bigNumber";
import { getBalanceAmount } from "../../../utils/formatBalance";
import { fetchFarmsPublicDataAsync, fetchFarmsUserDataAsync } from "./actions";

export const useFarms = () => {
    const farms = useSelector((state) => state.farms)
    return farms
}

export const usePollFarmsData = () => {
    const dispatch = useDispatch()
    const { fastRefresh } = useRefresh()
    const { account, chainId } = useActiveWeb3React()
    const { data } = useFarms()

    useEffect(() => {
        dispatch(fetchFarmsPublicDataAsync({ account, data, chainId }))
    }, [dispatch, fastRefresh, account])
}

export const useFarmFromPid = (pid) => {
    const farm = useSelector((state) => state.farms.data.find((f) => f.pid === pid))
    return farm
}

export const useFarmFromLpSymbol = (lpSymbol) => {
    const farm = useSelector((state) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
    return farm
}

export const useFarmUser = (pid) => {
    const farm = useFarmFromPid(pid)

    return {
        allowance: farm.userData ? new BigNumber(farm.userData.allowance) : BIG_ZERO,
        tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : BIG_ZERO,
        stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : BIG_ZERO,
        earnings: farm.userData ? new BigNumber(farm.userData.earnings) : BIG_ZERO,
    }
}
