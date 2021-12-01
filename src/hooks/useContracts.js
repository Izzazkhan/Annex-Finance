/**
 * Helper hooks to get specific contracts (by ABI)
 */
import { MULTICALL_NETWORKS } from "../constants/multicall";
import { useActiveWeb3React } from "./index";
import { ChainId, WETH } from "@annex/sdk";
import { getContract } from "../utils";
import { useMemo } from "react";
import {
    getLpContract,
    getBep20Contract,
    getBunnyFactoryContract,
    getBunnySpecialCakeVaultContract,
    getBunnySpecialContract,
    getBunnySpecialPredictionContract, getCakeContract,
    getCakeVaultContract,
    getChainlinkOracleContract,
    getClaimRefundContract,
    getEasterNftContract, getErc721Contract, getIfoV1Contract, getIfoV2Contract,
    getLotteryV2Contract,
    getMasterchefContract,
    getPancakeRabbitContract,
    getPointCenterIfoContract,
    getPredictionsContract,
    getProfileContract,
    getSouschefContract,
    getSouschefV2Contract,
    getTradingCompetitionContract
} from "../utils/contractHelper";

import ENS_ABI from '../constants/abis/ens-registrar.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import WETH_ABI from '../constants/abis/weth.json'
import ERC20_ABI from '../constants/abis/erc20.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import MULTICALL_ABI from '../constants/abis/multical.json';


export const useIfoV1Contract = (address) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getIfoV1Contract(address, chainId, library.getSigner()), [address, library])
}

export const useIfoV2Contract = (address) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getIfoV2Contract(address, chainId, library.getSigner()), [address, library])
}

export const useERC20 = (address) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getBep20Contract(address, chainId, library.getSigner()), [address, library])
}

/**
 * @see https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
 */
export const useERC721 = (address) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getErc721Contract(address, chainId, library.getSigner()), [address, library])
}

export const useCake = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getCakeContract(chainId, library.getSigner()), [library])
}

export const useBunnyFactory = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getBunnyFactoryContract(library.getSigner()), [library])
}

export const usePancakeRabbits = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getPancakeRabbitContract(library.getSigner()), [library])
}

export const useProfile = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getProfileContract(chainId, library.getSigner()), [library])
}

export const useLotteryV2Contract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getLotteryV2Contract(library.getSigner()), [library])
}

export const useLP = (address, isWrite = false) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getLpContract(address, chainId, library.getSigner(), isWrite), [library])
}

export const useMasterchef = (isWrite = false) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getMasterchefContract(chainId, library.getSigner(), isWrite), [library])
}

export const useSousChef = (id) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getSouschefContract(id, chainId, library.getSigner()), [id, library])
}

export const useSousChefV2 = (id) => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getSouschefV2Contract(id, chainId, library.getSigner()), [id, library])
}

export const usePointCenterIfoContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getPointCenterIfoContract(chainId, library.getSigner()), [library])
}

export const useBunnySpecialContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getBunnySpecialContract(chainId, library.getSigner()), [library])
}

export const useClaimRefundContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getClaimRefundContract(chainId, library.getSigner()), [library])
}

export const useTradingCompetitionContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getTradingCompetitionContract(chainId, library.getSigner()), [library])
}

export const useEasterNftContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getEasterNftContract(chainId, library.getSigner()), [library])
}

export const useCakeVaultContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getCakeVaultContract(chainId, library.getSigner()), [library])
}

export const usePredictionsContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getPredictionsContract(chainId, library.getSigner()), [library])
}

export const useChainlinkOracleContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getChainlinkOracleContract(chainId, library.getSigner()), [library])
}

export const useSpecialBunnyCakeVaultContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getBunnySpecialCakeVaultContract(chainId, library.getSigner()), [library])
}

export const useSpecialBunnyPredictionContract = () => {
    const { library, chainId } = useActiveWeb3React()
    return useMemo(() => getBunnySpecialPredictionContract(chainId, library.getSigner()), [library])
}

// Code below migrated from Exchange useContract.ts

// returns null on errors
function useContract(address, ABI, withSignerIfPossible = true) {
    const { library, account, chainId } = useActiveWeb3React()

    return useMemo(() => {
        if (!address || !ABI || !library) return null
        try {
            return getContract(address, ABI, chainId, library, chainId, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [address, ABI, library, withSignerIfPossible, account, chainId])
}

export function useTokenContract(tokenAddress, withSignerIfPossible) {
    return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible) {
    const { chainId } = useActiveWeb3React()
    return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useENSRegistrarContract(withSignerIfPossible) {
    const { chainId } = useActiveWeb3React()
    let address
    if (chainId) {
        // eslint-disable-next-line default-case
        switch (chainId) {
            case ChainId.MAINNET:
            case ChainId.BSCTESTNET:
                address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
                break
        }
    }
    return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address, withSignerIfPossible) {
    return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress, withSignerIfPossible) {
    return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMulticallContract() {
    const { chainId } = useActiveWeb3React()
    return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}
