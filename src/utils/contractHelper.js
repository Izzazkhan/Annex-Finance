import { ethers } from 'ethers'

import {
    getBunnyFactoryAddress,
    getBunnySpecialAddress, getBunnySpecialCakeVaultAddress, getBunnySpecialPredictionAddress,
    getCakeAddress,
    getCakeVaultAddress, getChainlinkOracleAddress,
    getClaimRefundAddress,
    getEasterNftAddress,
    getLotteryV2Address,
    getMasterChefAddress, getMulticallAddress,
    getPancakeProfileAddress,
    getPancakeRabbitsAddress,
    getPointCenterIfoAddress, getPredictionsAddress,
    getTradingCompetitionAddress,
    getAddress
} from "./addressHelper";
import poolsConfig from '../constants/pools'
import {PoolCategory} from "../constants/pools";
import { simpleRpcProvider, simpleRpcProviders } from "./providers";


import profileABI from '../constants/abis/pancakeProfile.json'
import pancakeRabbitsAbi from '../constants/abis/pancakeRabbits.json'
import bunnyFactoryAbi from '../constants/abis/bunnyFactory.json'
import bunnySpecialAbi from '../constants/abis/bunnySpecial.json'
import bep20Abi from '../constants/abis/erc20.json'
import erc721Abi from '../constants/abis/erc721.json'
import lpTokenAbi from '../constants/abis/lpToken.json'
import cakeAbi from '../constants/abis/cake.json'
import ifoV1Abi from '../constants/abis/ifoV1.json'
import ifoV2Abi from '../constants/abis/ifoV2.json'
import pointCenterIfo from '../constants/abis/pointCenterIfo.json'
import lotteryV2Abi from '../constants/abis/lotteryV2.json'
import masterChef from '../constants/abis/masterchef.json'
import sousChef from '../constants/abis/sousChef.json'
import sousChefV2 from '../constants/abis/sousChefV2.json'
import sousChefBnb from '../constants/abis/sousChefBnb.json'
import claimRefundAbi from '../constants/abis/claimRefund.json'
import tradingCompetitionAbi from '../constants/abis/tradingCompetition.json'
import easterNftAbi from '../constants/abis/easterNft.json'
import cakeVaultAbi from '../constants/abis/cakeVault.json'
import predictionsAbi from '../constants/abis/predictions.json'
import chainlinkOracleAbi from '../constants/abis/chainlinkOracle.json'
import MultiCallAbi from '../constants/abis/multical.json'
import bunnySpecialCakeVaultAbi from '../constants/abis/bunnySpecialCakeVault.json'
import bunnySpecialPredictionAbi from '../constants/abis/bunnySpecialPrediction.json'

const getContract = (abi, address, chainId, signer, isWrite = false) => {
    // const signerOrProvider = signer || simpleRpcProviders[chainId] || simpleRpcProvider
    const signerOrProvider = simpleRpcProviders[chainId] || simpleRpcProvider
    return isWrite
        ? new ethers.Contract(address, abi, signer)
        : new ethers.Contract(address, abi, signerOrProvider.getSigner().provider)
}

export const getBep20Contract = (address, chainId, signer) => {
    return getContract(bep20Abi, address, chainId, signer)
}
export const getErc721Contract = (address, chainId, signer) => {
    return getContract(erc721Abi, address, chainId, signer)
}
export const getLpContract = (address, chainId, signer, isWrite) => {
    return getContract(lpTokenAbi, address, chainId, signer, isWrite)
}
export const getIfoV1Contract = (address, chainId, signer) => {
    return getContract(ifoV1Abi, address, chainId, signer)
}
export const getIfoV2Contract = (address, chainId, signer) => {
    return getContract(ifoV2Abi, address, chainId, signer)
}
export const getSouschefContract = (id, chainId, signer) => {
    const config = poolsConfig.find((pool) => pool.sousId === id)
    const abi = config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
    return getContract(abi, getAddress(config.contractAddress), chainId, signer)
}
export const getSouschefV2Contract = (id, chainId, signer) => {
    const config = poolsConfig.find((pool) => pool.sousId === id)
    return getContract(sousChefV2, getAddress(config.contractAddress), chainId, signer)
}
export const getPointCenterIfoContract = (chainId, signer) => {
    return getContract(pointCenterIfo, getPointCenterIfoAddress(), chainId, signer)
}
export const getCakeContract = (chainId, signer) => {
    return getContract(cakeAbi, getCakeAddress(), chainId, signer)
}
export const getProfileContract = (chainId, signer) => {
    return getContract(profileABI, getPancakeProfileAddress(), chainId, signer)
}
export const getPancakeRabbitContract = (chainId, signer) => {
    return getContract(pancakeRabbitsAbi, getPancakeRabbitsAddress(), chainId, signer)
}
export const getBunnyFactoryContract = (chainId, signer) => {
    return getContract(bunnyFactoryAbi, getBunnyFactoryAddress(), chainId, signer)
}
export const getBunnySpecialContract = (chainId, signer) => {
    return getContract(bunnySpecialAbi, getBunnySpecialAddress(), chainId, signer)
}
export const getLotteryV2Contract = (chainId, signer) => {
    return getContract(lotteryV2Abi, getLotteryV2Address(), chainId, signer)
}
export const getMasterchefContract = (chainId, signer, isWrite = false) => {
    return getContract(masterChef, getMasterChefAddress(chainId), chainId, signer, isWrite)
}
export const getClaimRefundContract = (chainId, signer) => {
    return getContract(claimRefundAbi, getClaimRefundAddress(), chainId, signer)
}
export const getTradingCompetitionContract = (chainId, signer) => {
    return getContract(tradingCompetitionAbi, getTradingCompetitionAddress(), chainId, signer)
}
export const getEasterNftContract = (chainId, signer) => {
    return getContract(easterNftAbi, getEasterNftAddress(), chainId, signer)
}
export const getCakeVaultContract = (chainId, signer) => {
    return getContract(cakeVaultAbi, getCakeVaultAddress(), chainId, signer)
}
export const getPredictionsContract = (chainId, signer) => {
    return getContract(predictionsAbi, getPredictionsAddress(), chainId, signer)
}
export const getChainlinkOracleContract = (chainId, signer) => {
    return getContract(chainlinkOracleAbi, getChainlinkOracleAddress(), chainId, signer)
}
export const getMulticallContract = (chainId, signer, isWrite = false) => {
    return getContract(MultiCallAbi, getMulticallAddress(chainId), chainId, signer, isWrite)
}
export const getBunnySpecialCakeVaultContract = (chainId, signer) => {
    return getContract(bunnySpecialCakeVaultAbi, getBunnySpecialCakeVaultAddress(), chainId, signer)
}
export const getBunnySpecialPredictionContract = (chainId, signer) => {
    return getContract(bunnySpecialPredictionAbi, getBunnySpecialPredictionAddress(), chainId, signer)
}
