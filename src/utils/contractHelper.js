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
import {simpleRpcProvider} from "./providers";


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

const getContract = (abi, address, signer) => {
    const signerOrProvider = signer || simpleRpcProvider
    return new ethers.Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address, signer) => {
    return getContract(bep20Abi, address, signer)
}
export const getErc721Contract = (address, signer) => {
    return getContract(erc721Abi, address, signer)
}
export const getLpContract = (address, signer) => {
    return getContract(lpTokenAbi, address, signer)
}
export const getIfoV1Contract = (address, signer) => {
    return getContract(ifoV1Abi, address, signer)
}
export const getIfoV2Contract = (address, signer) => {
    return getContract(ifoV2Abi, address, signer)
}
export const getSouschefContract = (id, signer) => {
    const config = poolsConfig.find((pool) => pool.sousId === id)
    const abi = config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
    return getContract(abi, getAddress(config.contractAddress), signer)
}
export const getSouschefV2Contract = (id, signer) => {
    const config = poolsConfig.find((pool) => pool.sousId === id)
    return getContract(sousChefV2, getAddress(config.contractAddress), signer)
}
export const getPointCenterIfoContract = (signer) => {
    return getContract(pointCenterIfo, getPointCenterIfoAddress(), signer)
}
export const getCakeContract = (signer) => {
    return getContract(cakeAbi, getCakeAddress(), signer)
}
export const getProfileContract = (signer) => {
    return getContract(profileABI, getPancakeProfileAddress(), signer)
}
export const getPancakeRabbitContract = (signer) => {
    return getContract(pancakeRabbitsAbi, getPancakeRabbitsAddress(), signer)
}
export const getBunnyFactoryContract = (signer) => {
    return getContract(bunnyFactoryAbi, getBunnyFactoryAddress(), signer)
}
export const getBunnySpecialContract = (signer) => {
    return getContract(bunnySpecialAbi, getBunnySpecialAddress(), signer)
}
export const getLotteryV2Contract = (signer) => {
    return getContract(lotteryV2Abi, getLotteryV2Address(), signer)
}
export const getMasterchefContract = (chainId, signer) => {
    return getContract(masterChef, getMasterChefAddress(chainId), signer)
}
export const getClaimRefundContract = (signer) => {
    return getContract(claimRefundAbi, getClaimRefundAddress(), signer)
}
export const getTradingCompetitionContract = (signer) => {
    return getContract(tradingCompetitionAbi, getTradingCompetitionAddress(), signer)
}
export const getEasterNftContract = (signer) => {
    return getContract(easterNftAbi, getEasterNftAddress(), signer)
}
export const getCakeVaultContract = (signer) => {
    return getContract(cakeVaultAbi, getCakeVaultAddress(), signer)
}

export const getPredictionsContract = (signer) => {
    return getContract(predictionsAbi, getPredictionsAddress(), signer)
}

export const getChainlinkOracleContract = (signer) => {
    return getContract(chainlinkOracleAbi, getChainlinkOracleAddress(), signer)
}
export const getMulticallContract = (chainId, signer) => {
    return getContract(MultiCallAbi, getMulticallAddress(chainId), signer)
}
export const getBunnySpecialCakeVaultContract = (signer) => {
    return getContract(bunnySpecialCakeVaultAbi, getBunnySpecialCakeVaultAddress(), signer)
}
export const getBunnySpecialPredictionContract = (signer) => {
    return getContract(bunnySpecialPredictionAbi, getBunnySpecialPredictionAddress(), signer)
}
