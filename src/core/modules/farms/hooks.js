import {useDispatch, useSelector} from "react-redux";
import useRefresh from "../../../hooks/useRefresh";
import {useActiveWeb3React} from "../../../hooks";
import {useEffect} from "react";
import farmsConfig from '../../../constants/farms';
import {nonArchivedFarms} from "../initialState";
import BigNumber from "bignumber.js";
import {BIG_ZERO} from "../../../utils/bigNumber";
import {getBalanceAmount} from "../../../utils/formatBalance";
import {fetchFarmsPublicDataAsync, fetchFarmsUserDataAsync} from "./actions";

export const usePollFarmsData = (includeArchive = false) => {
    const dispatch = useDispatch()
    const { slowRefresh } = useRefresh()
    const { account } = useActiveWeb3React()

    useEffect(() => {
        const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
        const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)


        dispatch(fetchFarmsPublicDataAsync(pids))

        if (account) {
            dispatch(fetchFarmsUserDataAsync({ account, pids }))
        }
    }, [includeArchive, dispatch, slowRefresh, account])
}

/**
 * Fetches the "core" farm data used globally
 * 251 = CAKE-BNB LP
 * 252 = BUSD-BNB LP
 */
export const usePollCoreFarmData = () => {
    const dispatch = useDispatch()
    const { fastRefresh } = useRefresh()

    useEffect(() => {
        dispatch(fetchFarmsPublicDataAsync([251, 252]))
    }, [dispatch, fastRefresh])
}

export const useFarms = () => {
    const farms = useSelector((state) => state.farms)
    return farms
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

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromPid = (pid) => {
    const farm = useFarmFromPid(pid)
    return farm && new BigNumber(farm.token.busdPrice)
}

export const useLpTokenPrice = (symbol) => {
    const farm = useFarmFromLpSymbol(symbol)
    const farmTokenPriceInUsd = useBusdPriceFromPid(farm.pid)
    let lpTokenPrice = BIG_ZERO

    if (farm.lpTotalSupply && farm.lpTotalInQuoteToken) {
        // Total value of base token in LP
        const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(farm.tokenAmountTotal)
        // Double it to get overall value in LP
        const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
        // Divide total value of all tokens, by the number of LP tokens
        const totalLpTokens = getBalanceAmount(new BigNumber(farm.lpTotalSupply))
        lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
    }

    return lpTokenPrice
}


export const usePriceCakeBusd = () => {
    const cakeBnbFarm = useFarmFromPid(251)
    return new BigNumber(cakeBnbFarm.token.busdPrice)
}
