import {getBalanceNumber, getDecimalAmount, getFullDisplayBalance} from "../../../utils/formatBalance";
import BigNumber from "bignumber.js";
import {getRoi, tokenEarnedPerThousandDollarsCompounding} from "../../../utils/compoundApyHelpers";
import {BIG_ZERO} from "../../../utils/bigNumber";
import {getAddress, getCakeVaultAddress, getWbnbAddress} from "../../../utils/addressHelper";
import multicall, {multicallv2} from "../../../utils/multicall";
import {getCakeVaultContract, getMasterchefContract, getSouschefV2Contract} from "../../../utils/contractHelper";
import poolsConfig from '../../../constants/pools'
import sousChefABI from '../../../constants/abis/sousChef.json'
import wbnbABI from '../../../constants/abis/weth.json'
import cakeABI from '../../../constants/abis/cake.json'
import erc20ABI from '../../../constants/abis/erc20.json'
import cakeVaultAbi from '../../../constants/abis/cakeVault.json';
import {simpleRpcProvider} from "../../../utils/providers";

export const convertSharesToCake = (
    shares,
    cakePerFullShare,
    decimals = 18,
    decimalsToRound = 3,
) => {
    const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals)
    const amountInCake = new BigNumber(shares.multipliedBy(sharePriceNumber))
    const cakeAsNumberBalance = getBalanceNumber(amountInCake, decimals)
    const cakeAsBigNumber = getDecimalAmount(new BigNumber(cakeAsNumberBalance), decimals)
    const cakeAsDisplayBalance = getFullDisplayBalance(amountInCake, decimals, decimalsToRound)
    return { cakeAsNumberBalance, cakeAsBigNumber, cakeAsDisplayBalance }
}

export const convertCakeToShares = (
    cake,
    cakePerFullShare,
    decimals = 18,
    decimalsToRound = 3,
) => {
    const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals)
    const amountInShares = new BigNumber(cake.dividedBy(sharePriceNumber))
    const sharesAsNumberBalance = getBalanceNumber(amountInShares, decimals)
    const sharesAsBigNumber = getDecimalAmount(new BigNumber(sharesAsNumberBalance), decimals)
    const sharesAsDisplayBalance = getFullDisplayBalance(amountInShares, decimals, decimalsToRound)
    return { sharesAsNumberBalance, sharesAsBigNumber, sharesAsDisplayBalance }
}

const AUTO_VAULT_COMPOUND_FREQUENCY = 288
const MANUAL_POOL_COMPOUND_FREQUENCY = 1

export const getAprData = (pool, performanceFee) => {
    const { isAutoVault, earningTokenPrice, apr } = pool
    // special handling for tokens like tBTC or BIFI where the daily token rewards for $1000 dollars will be less than 0.001 of that token
    const isHighValueToken = Math.round(earningTokenPrice / 1000) > 0
    const roundingDecimals = isHighValueToken ? 4 : 2

    //   Estimate & manual for now. 288 = once every 5 mins. We can change once we have a better sense of this
    const compoundFrequency = isAutoVault ? AUTO_VAULT_COMPOUND_FREQUENCY : MANUAL_POOL_COMPOUND_FREQUENCY

    if (isAutoVault) {
        const oneThousandDollarsWorthOfToken = 1000 / earningTokenPrice
        const tokenEarnedPerThousand365D = tokenEarnedPerThousandDollarsCompounding({
            numberOfDays: 365,
            farmApr: apr,
            tokenPrice: earningTokenPrice,
            roundingDecimals,
            compoundFrequency,
            performanceFee,
        })
        const autoApr = getRoi({
            amountEarned: tokenEarnedPerThousand365D,
            amountInvested: oneThousandDollarsWorthOfToken,
        })
        return { apr: autoApr, isHighValueToken, roundingDecimals, compoundFrequency }
    }
    return { apr, isHighValueToken, roundingDecimals, compoundFrequency }
}

export const getCakeVaultEarnings = (
    account,
    cakeAtLastUserAction,
    userShares,
    pricePerFullShare,
    earningTokenPrice,
) => {
    const hasAutoEarnings =
        account && cakeAtLastUserAction && cakeAtLastUserAction.gt(0) && userShares && userShares.gt(0)
    const { cakeAsBigNumber } = convertSharesToCake(userShares, pricePerFullShare)
    const autoCakeProfit = cakeAsBigNumber.minus(cakeAtLastUserAction)
    const autoCakeToDisplay = autoCakeProfit.gte(0) ? getBalanceNumber(autoCakeProfit, 18) : 0

    const autoUsdProfit = autoCakeProfit.times(earningTokenPrice)
    const autoUsdToDisplay = autoUsdProfit.gte(0) ? getBalanceNumber(autoUsdProfit, 18) : 0
    return { hasAutoEarnings, autoCakeToDisplay, autoUsdToDisplay }
}

export const getPoolBlockInfo = (pool, currentBlock) => {
    const { startBlock, endBlock, isFinished } = pool
    const shouldShowBlockCountdown = Boolean(!isFinished && startBlock && endBlock)
    const blocksUntilStart = Math.max(startBlock - currentBlock, 0)
    const blocksRemaining = Math.max(endBlock - currentBlock, 0)
    const hasPoolStarted = blocksUntilStart === 0 && blocksRemaining > 0
    const blocksToDisplay = hasPoolStarted ? blocksRemaining : blocksUntilStart
    return { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay }
}





// State helpers

export const transformUserData = (userData) => {
    return {
        allowance: userData ? new BigNumber(userData.allowance) : BIG_ZERO,
        stakingTokenBalance: userData ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO,
        stakedBalance: userData ? new BigNumber(userData.stakedBalance) : BIG_ZERO,
        pendingReward: userData ? new BigNumber(userData.pendingReward) : BIG_ZERO,
    }
}

export const transformPool = (pool) => {
    const { totalStaked, stakingLimit, userData, ...rest } = pool

    return {
        ...rest,
        userData: transformUserData(userData),
        totalStaked: new BigNumber(totalStaked),
        stakingLimit: new BigNumber(stakingLimit),
    }
}

export const getTokenPricesFromFarm = (farms) => {
    return farms.reduce((prices, farm) => {
        const quoteTokenAddress = getAddress(farm.quoteToken.address).toLocaleLowerCase()
        const tokenAddress = getAddress(farm.token.address).toLocaleLowerCase()
        /* eslint-disable no-param-reassign */
        if (!prices[quoteTokenAddress]) {
            prices[quoteTokenAddress] = new BigNumber(farm.quoteToken.busdPrice).toNumber()
        }
        if (!prices[tokenAddress]) {
            prices[tokenAddress] = new BigNumber(farm.token.busdPrice).toNumber()
        }
        /* eslint-enable no-param-reassign */
        return prices
    }, {})
}


// fetch helpers

// Fetch pools
export const fetchPoolsBlockLimits = async () => {
    const poolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0)
    const callsStartBlock = poolsWithEnd.map((poolConfig) => {
        return {
            address: getAddress(poolConfig.contractAddress),
            name: 'startBlock',
        }
    })
    const callsEndBlock = poolsWithEnd.map((poolConfig) => {
        return {
            address: getAddress(poolConfig.contractAddress),
            name: 'bonusEndBlock',
        }
    })

    const starts = await multicall(sousChefABI, callsStartBlock)
    const ends = await multicall(sousChefABI, callsEndBlock)

    return poolsWithEnd.map((cakePoolConfig, index) => {
        const startBlock = starts[index]
        const endBlock = ends[index]
        return {
            sousId: cakePoolConfig.sousId,
            startBlock: new BigNumber(startBlock).toJSON(),
            endBlock: new BigNumber(endBlock).toJSON(),
        }
    })
}

export const fetchPoolsTotalStaking = async () => {
    const nonBnbPools = poolsConfig.filter((p) => p.stakingToken.symbol !== 'BNB')
    const bnbPool = poolsConfig.filter((p) => p.stakingToken.symbol === 'BNB')

    const callsNonBnbPools = nonBnbPools.map((poolConfig) => {
        return {
            address: getAddress(poolConfig.stakingToken.address),
            name: 'balanceOf',
            params: [getAddress(poolConfig.contractAddress)],
        }
    })

    const callsBnbPools = bnbPool.map((poolConfig) => {
        return {
            address: getWbnbAddress(),
            name: 'balanceOf',
            params: [getAddress(poolConfig.contractAddress)],
        }
    })

    const nonBnbPoolsTotalStaked = await multicall(cakeABI, callsNonBnbPools)
    const bnbPoolsTotalStaked = await multicall(wbnbABI, callsBnbPools)

    return [
        ...nonBnbPools.map((p, index) => ({
            sousId: p.sousId,
            totalStaked: new BigNumber(nonBnbPoolsTotalStaked[index]).toJSON(),
        })),
        ...bnbPool.map((p, index) => ({
            sousId: p.sousId,
            totalStaked: new BigNumber(bnbPoolsTotalStaked[index]).toJSON(),
        })),
    ]
}

export const fetchPoolStakingLimit = async (sousId) => {
    try {
        const sousContract = getSouschefV2Contract(sousId)
        const stakingLimit = await sousContract.poolLimitPerUser()
        return new BigNumber(stakingLimit.toString())
    } catch (error) {
        return BIG_ZERO
    }
}

export const fetchPoolsStakingLimits = async (
    poolsWithStakingLimit,
) => {
    const validPools = poolsConfig
        .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
        .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

    // Get the staking limit for each valid pool
    // Note: We cannot batch the calls via multicall because V1 pools do not have "poolLimitPerUser" and will throw an error
    const stakingLimitPromises = validPools.map((validPool) => fetchPoolStakingLimit(validPool.sousId))
    // eslint-disable-next-line no-undef
    const stakingLimits = await Promise.all(stakingLimitPromises)

    return stakingLimits.reduce((accum, stakingLimit, index) => {
        return {
            ...accum,
            [validPools[index].sousId]: stakingLimit,
        }
    }, {})
}


// Fetch pools user

// Pool 0, Cake / Cake is a different kind of contract (master chef)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
const nonBnbPools = poolsConfig.filter((p) => p.stakingToken.symbol !== 'BNB')
const bnbPools = poolsConfig.filter((p) => p.stakingToken.symbol === 'BNB')
const nonMasterPools = poolsConfig.filter((p) => p.sousId !== 0)

export const fetchPoolsAllowance = async (account) => {
    const calls = nonBnbPools.map((p) => ({
        address: getAddress(p.stakingToken.address),
        name: 'allowance',
        params: [account, getAddress(p.contractAddress)],
    }))

    const allowances = await multicall(erc20ABI, calls)
    return nonBnbPools.reduce(
        (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
        {},
    )
}

export const fetchUserBalances = async (account) => {
    // Non BNB pools
    const calls = nonBnbPools.map((p) => ({
        address: getAddress(p.stakingToken.address),
        name: 'balanceOf',
        params: [account],
    }))
    const tokenBalancesRaw = await multicall(erc20ABI, calls)
    const tokenBalances = nonBnbPools.reduce(
        (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(tokenBalancesRaw[index]).toJSON() }),
        {},
    )

    // BNB pools
    const bnbBalance = await simpleRpcProvider.getBalance(account)
    const bnbBalances = bnbPools.reduce(
        (acc, pool) => ({ ...acc, [pool.sousId]: new BigNumber(bnbBalance.toString()).toJSON() }),
        {},
    )

    return { ...tokenBalances, ...bnbBalances }
}

export const fetchUserStakeBalances = async (account) => {
    // const masterChefContract = getMasterchefContract(56)
    // const calls = nonMasterPools.map((p) => ({
    //     address: getAddress(p.contractAddress),
    //     name: 'userInfo',
    //     params: [account],
    // }))
    // const userInfo = await multicall(sousChefABI, calls)
    // const stakedBalances = nonMasterPools.reduce(
    //     (acc, pool, index) => ({
    //         ...acc,
    //         [pool.sousId]: new BigNumber(userInfo[index].amount._hex).toJSON(),
    //     }),
    //     {},
    // )

    // // Cake / Cake pool
    // const { amount: masterPoolAmount } = await masterChefContract.userInfo('0', account)

    // return { ...stakedBalances, 0: new BigNumber(masterPoolAmount.toString()).toJSON() }
}

export const fetchUserPendingRewards = async (account) => {
    // const masterChefContract = getMasterchefContract(56)
    // const calls = nonMasterPools.map((p) => ({
    //     address: getAddress(p.contractAddress),
    //     name: 'pendingReward',
    //     params: [account],
    // }))
    // const res = await multicall(sousChefABI, calls)
    // const pendingRewards = nonMasterPools.reduce(
    //     (acc, pool, index) => ({
    //         ...acc,
    //         [pool.sousId]: new BigNumber(res[index]).toJSON(),
    //     }),
    //     {},
    // )

    // // Cake / Cake pool
    // const pendingReward = await masterChefContract.pendingCake('0', account)

    // return { ...pendingRewards, 0: new BigNumber(pendingReward.toString()).toJSON() }
}


// Fetch Vault public
export const fetchPublicVaultData = async () => {
    try {
        const calls = [
            'getPricePerFullShare',
            'totalShares',
            'calculateHarvestCakeRewards',
            'calculateTotalPendingCakeRewards',
        ].map((method) => ({
            address: getCakeVaultAddress(),
            name: method,
        }))

        const [[sharePrice], [shares], [estimatedCakeBountyReward], [totalPendingCakeHarvest]] = await multicallv2(
            cakeVaultAbi,
            calls,
        )

        const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
        const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
        const totalCakeInVaultEstimate = convertSharesToCake(totalSharesAsBigNumber, sharePriceAsBigNumber)
        return {
            totalShares: totalSharesAsBigNumber.toJSON(),
            pricePerFullShare: sharePriceAsBigNumber.toJSON(),
            totalCakeInVault: totalCakeInVaultEstimate.cakeAsBigNumber.toJSON(),
            estimatedCakeBountyReward: new BigNumber(estimatedCakeBountyReward.toString()).toJSON(),
            totalPendingCakeHarvest: new BigNumber(totalPendingCakeHarvest.toString()).toJSON(),
        }
    } catch (error) {
        return {
            totalShares: null,
            pricePerFullShare: null,
            totalCakeInVault: null,
            estimatedCakeBountyReward: null,
            totalPendingCakeHarvest: null,
        }
    }
}

export const fetchVaultFees = async () => {
    try {
        const calls = ['performanceFee', 'callFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
            address: getCakeVaultAddress(),
            name: method,
        }))

        const [[performanceFee], [callFee], [withdrawalFee], [withdrawalFeePeriod]] = await multicallv2(cakeVaultAbi, calls)

        return {
            performanceFee: performanceFee.toNumber(),
            callFee: callFee.toNumber(),
            withdrawalFee: withdrawalFee.toNumber(),
            withdrawalFeePeriod: withdrawalFeePeriod.toNumber(),
        }
    } catch (error) {
        return {
            performanceFee: null,
            callFee: null,
            withdrawalFee: null,
            withdrawalFeePeriod: null,
        }
    }
}


// Fetch Vault user
export const fetchVaultUser = async (account) => {
    try {
        const cakeVaultContract = getCakeVaultContract()
        const userContractResponse = await cakeVaultContract.userInfo(account)
        return {
            isLoading: false,
            userShares: new BigNumber(userContractResponse.shares.toString()).toJSON(),
            lastDepositedTime: userContractResponse.lastDepositedTime.toString(),
            lastUserActionTime: userContractResponse.lastUserActionTime.toString(),
            cakeAtLastUserAction: new BigNumber(userContractResponse.cakeAtLastUserAction.toString()).toJSON(),
        }
    } catch (error) {
        return {
            isLoading: true,
            userShares: null,
            lastDepositedTime: null,
            lastUserActionTime: null,
            cakeAtLastUserAction: null,
        }
    }
}
