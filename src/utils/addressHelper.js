import { ChainId } from "@annex/sdk";
import tokens from "../constants/tokens";
import addresses from "../constants/contracts";

export const getAddress = (address, chainId = 56) => {
    return address[chainId] ? address[chainId] : address[ChainId.MAINNET]
}

export const getCakeAddress = () => {
    return getAddress(tokens.cake.address)
}
export const getMasterChefAddress = (chainId) => {
    return getAddress(addresses.masterChef, chainId)
}
export const getMulticallAddress = (chainId) => {
    return getAddress(addresses.multiCall, chainId)
}
export const getWbnbAddress = () => {
    return getAddress(tokens.wbnb.address)
}
export const getLotteryV2Address = () => {
    return getAddress(addresses.lotteryV2)
}
export const getPancakeProfileAddress = () => {
    return getAddress(addresses.pancakeProfile)
}
export const getPancakeRabbitsAddress = () => {
    return getAddress(addresses.pancakeRabbits)
}
export const getBunnyFactoryAddress = () => {
    return getAddress(addresses.bunnyFactory)
}
export const getClaimRefundAddress = () => {
    return getAddress(addresses.claimRefund)
}
export const getPointCenterIfoAddress = () => {
    return getAddress(addresses.pointCenterIfo)
}
export const getBunnySpecialAddress = () => {
    return getAddress(addresses.bunnySpecial)
}
export const getTradingCompetitionAddress = () => {
    return getAddress(addresses.tradingCompetition)
}
export const getEasterNftAddress = () => {
    return getAddress(addresses.easterNft)
}
export const getCakeVaultAddress = () => {
    return getAddress(addresses.cakeVault)
}
export const getPredictionsAddress = () => {
    return getAddress(addresses.predictions)
}
export const getChainlinkOracleAddress = () => {
    return getAddress(addresses.chainlinkOracle)
}
export const getBunnySpecialCakeVaultAddress = () => {
    return getAddress(addresses.bunnySpecialCakeVault)
}
export const getBunnySpecialPredictionAddress = () => {
    return getAddress(addresses.bunnySpecialPrediction)
}
