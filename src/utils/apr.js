import BigNumber from "bignumber.js";
import {BLOCKS_PER_YEAR, CAKE_PER_YEAR} from "../constants";
import lpAprs from '../constants/lpAprs.json';

/**
 * Get the APR value in %
 * @param stakingTokenPrice Token price in the same quote currency
 * @param rewardTokenPrice Token price in the same quote currency
 * @param totalStaked Total amount of stakingToken in the pool
 * @param tokenPerBlock Amount of new cake allocated to the pool for each new block
 * @returns Null if the APR is NaN or infinite.
 */

export const getPoolApr = (
    stakingTokenPrice,
    rewardTokenPrice,
    totalStaked,
    tokenPerBlock,
) => {
    const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
    const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
    const apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)
    return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber()
}

/**
 * Get farm APR value in %
 * @param poolWeight allocationPoint / totalAllocationPoint
 * @param cakePriceUsd Cake price in USD
 * @param poolLiquidityUsd Total pool liquidity in USD
 * @returns
 */
export const getFarmApr = (
    poolWeight,
    cakePriceUsd,
    poolLiquidityUsd,
    farmAddress,
) => {
    const yearlyCakeRewardAllocation = CAKE_PER_YEAR.times(poolWeight)
    const cakeRewardsApr = yearlyCakeRewardAllocation.times(cakePriceUsd).div(poolLiquidityUsd).times(100)
    let cakeRewardsAprAsNumber = null
    if (!cakeRewardsApr.isNaN() && cakeRewardsApr.isFinite()) {
        cakeRewardsAprAsNumber = cakeRewardsApr.toNumber()
    }
    const lpRewardsApr = lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
    return { cakeRewardsApr: cakeRewardsAprAsNumber, lpRewardsApr }
}

export default null
