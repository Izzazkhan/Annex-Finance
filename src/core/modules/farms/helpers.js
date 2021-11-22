import BigNumber from "bignumber.js";
import {BIG_ONE, BIG_TEN, BIG_ZERO} from "../../../utils/bigNumber";
import filterFarmsByQuoteToken from "../../../utils/farmsPriceHelpers";
import {getMasterChefAddress, getAddress} from "../../../utils/addressHelper";
import multicall from "../../../utils/multicall";

import erc20ABI from '../../../constants/abis/erc20.json';
import masterchefABI from '../../../constants/abis/masterchef.json'


// Fetch farm
export const fetchFarm = async (farm) => {
    const farmPublicData = await fetchPublicFarmData(farm)

    return { ...farm, ...farmPublicData }
}

// Fetch Farm prices
const getFarmFromTokenSymbol = (farms, tokenSymbol, preferredQuoteTokens) => {
    const farmsWithTokenSymbol = farms.filter((farm) => farm.token.symbol === tokenSymbol)
    const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
    return filteredFarm
}

const getFarmBaseTokenPrice = (farm, quoteTokenFarm, bnbPriceBusd) => {
    const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

    if (farm.quoteToken.symbol === 'BUSD') {
        return hasTokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO
    }

    if (farm.quoteToken.symbol === 'wBNB') {
        return hasTokenPriceVsQuote ? bnbPriceBusd.times(farm.tokenPriceVsQuote) : BIG_ZERO
    }

    // We can only calculate profits without a quoteTokenFarm for BUSD/BNB farms
    if (!quoteTokenFarm) {
        return BIG_ZERO
    }

    // Possible alternative farm quoteTokens:
    // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
    // If the farm's quote token isn't BUSD or wBNB, we then use the quote token, of the original farm's quote token
    // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - BNB, (pBTC - BNB)
    // from the BNB - pBTC price, we can calculate the PNT - BUSD price
    if (quoteTokenFarm.quoteToken.symbol === 'wBNB') {
        const quoteTokenInBusd = bnbPriceBusd.times(quoteTokenFarm.tokenPriceVsQuote)
        return hasTokenPriceVsQuote && quoteTokenInBusd
            ? new BigNumber(farm.tokenPriceVsQuote).times(quoteTokenInBusd)
            : BIG_ZERO
    }

    if (quoteTokenFarm.quoteToken.symbol === 'BUSD') {
        const quoteTokenInBusd = quoteTokenFarm.tokenPriceVsQuote
        return hasTokenPriceVsQuote && quoteTokenInBusd
            ? new BigNumber(farm.tokenPriceVsQuote).times(quoteTokenInBusd)
            : BIG_ZERO
    }

    // Catch in case token does not have immediate or once-removed BUSD/wBNB quoteToken
    return BIG_ZERO
}

const getFarmQuoteTokenPrice = (farm, quoteTokenFarm, bnbPriceBusd) => {
    if (farm.quoteToken.symbol === 'BUSD') {
        return BIG_ONE
    }

    if (farm.quoteToken.symbol === 'wBNB') {
        return bnbPriceBusd
    }

    if (!quoteTokenFarm) {
        return BIG_ZERO
    }

    if (quoteTokenFarm.quoteToken.symbol === 'wBNB') {
        return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd.times(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
    }

    if (quoteTokenFarm.quoteToken.symbol === 'BUSD') {
        return quoteTokenFarm.tokenPriceVsQuote ? new BigNumber(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
    }

    return BIG_ZERO
}

// Fetch Farm users
export const fetchFarmUserAllowances = async (account, farmsToFetch, chainId, library) => {
    const masterChefAddress = getMasterChefAddress(chainId)

    const calls = farmsToFetch.map((farm) => {
        const lpContractAddress = farm.lpAddress
        return { address: lpContractAddress, name: 'allowance', params: [account, masterChefAddress] }
    })

    const rawLpAllowances = await multicall(erc20ABI, calls, chainId, library)
    const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
        return new BigNumber(lpBalance).toJSON()
    })
    return parsedLpAllowances
}

export const fetchFarmUserTokenBalances = async (account, farmsToFetch, chainId, library) => {
    const calls = farmsToFetch.map((farm) => {
        const lpContractAddress = farm.lpAddress
        return {
            address: lpContractAddress,
            name: 'balanceOf',
            params: [account],
        }
    })

    const rawTokenBalances = await multicall(erc20ABI, calls, chainId, library)
    const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
        return new BigNumber(tokenBalance).toJSON()
    })
    return parsedTokenBalances
}

export const fetchFarmUserStakedBalances = async (account, farmsToFetch, chainId, library) => {
    const masterChefAddress = getMasterChefAddress(chainId)

    const calls = farmsToFetch.map((farm) => {
        return {
            address: masterChefAddress,
            name: 'userInfo',
            params: [farm.pid, account],
        }
    })

    const rawStakedBalances = await multicall(masterchefABI, calls, chainId, library)
    const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
        return new BigNumber(stakedBalance[0]._hex).toString(10)
    })
    return parsedStakedBalances
}

export const fetchFarmUserEarnings = async (account, farmsToFetch, chainId, library) => {
    const masterChefAddress = getMasterChefAddress(chainId)

    const calls = farmsToFetch.map((farm) => {
        return {
            address: masterChefAddress,
            name: 'pendingAnnex',
            params: [farm.pid, account],
        }
    })

    const rawEarnings = await multicall(masterchefABI, calls, chainId, library)
    const parsedEarnings = rawEarnings.map((earnings) => {
        return new BigNumber(earnings).toJSON()
    })
    return parsedEarnings
}


// Fetch Farm

export const fetchPublicFarmData = async (farm) => {
    const { pid, lpAddresses, token, quoteToken } = farm
    const lpAddress = getAddress(lpAddresses)
    const calls = [
        // Balance of token in the LP contract
        {
            address: getAddress(token.address),
            name: 'balanceOf',
            params: [lpAddress],
        },
        // Balance of quote token on LP contract
        {
            address: getAddress(quoteToken.address),
            name: 'balanceOf',
            params: [lpAddress],
        },
        // Balance of LP tokens in the master chef contract
        {
            address: lpAddress,
            name: 'balanceOf',
            params: [getMasterChefAddress()],
        },
        // Total supply of LP tokens
        {
            address: lpAddress,
            name: 'totalSupply',
        },
        // Token decimals
        {
            address: getAddress(token.address),
            name: 'decimals',
        },
        // Quote token decimals
        {
            address: getAddress(quoteToken.address),
            name: 'decimals',
        },
    ]


    const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
        await multicall(erc20ABI, calls)

    // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
    const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))

    // Raw amount of token in the LP, including those not staked
    const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
    const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

    // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
    const tokenAmountMc = tokenAmountTotal.times(lpTokenRatio)
    const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

    // Total staked in LP, in quote token value
    const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))

    // Only make masterchef calls if farm has pid
    const [info, totalAllocPoint] =
        pid || pid === 0
            ? await multicall(masterchefABI, [
                {
                    address: getMasterChefAddress(),
                    name: 'poolInfo',
                    params: [pid],
                },
                {
                    address: getMasterChefAddress(),
                    name: 'totalAllocPoint',
                },
            ])
            : [null, null]

    const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
    const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO

    return {
        tokenAmountMc: tokenAmountMc.toJSON(),
        quoteTokenAmountMc: quoteTokenAmountMc.toJSON(),
        tokenAmountTotal: tokenAmountTotal.toJSON(),
        quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
        lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
        poolWeight: poolWeight.toJSON(),
        multiplier: `${allocPoint.div(100).toString()}X`,
    }
}
