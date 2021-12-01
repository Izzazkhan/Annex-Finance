import { ChainId, WETH } from "@annex/sdk";
import { abi as IUniswapV2PairABI } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { useMemo } from "react";
import ENS_ABI from "../constants/abis/ens-registrar.json";
import ENS_PUBLIC_RESOLVER_ABI from "../constants/abis/ens-public-resolver.json";
import { ERC20_BYTES32_ABI } from "../constants/abis/erc20";
import ERC20_ABI from "../constants/abis/erc20.json";
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from "../constants/abis/migrator";
import UNISOCKS_ABI from "../constants/abis/unisocks.json";
import WETH_ABI from "../constants/abis/weth.json";
import { MULTICALL_ABI, MULTICALL_NETWORKS } from "../constants/multicall";
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from "../constants/v1";
import { getContract } from "../utils";
import { useActiveWeb3React } from "./index";

// returns null on errors
function useContract(address, ABI, withSignerIfPossible = true) {
	const { account, library, chainId } = useActiveWeb3React();

	return useMemo(() => {
		if (!address || !ABI || !library) return null;
		try {
			return getContract(address, ABI, library, chainId, withSignerIfPossible && account ? account : undefined);
		} catch (error) {
			console.error("Failed to get contract", error);
			return null;
		}
	}, [address, ABI, library, withSignerIfPossible, account, chainId]);
}

export function useV1FactoryContract() {
	const { chainId } = useActiveWeb3React();
	// @ts-ignore
	return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false);
}

export function useV2MigratorContract() {
	return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true);
}

export function useV1ExchangeContract(address, withSignerIfPossible) {
	return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible);
}

export function useTokenContract(tokenAddress, withSignerIfPossible) {
	return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible) {
	const { chainId } = useActiveWeb3React();
	return useContract(chainId ? WETH[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible);
}

export function useENSRegistrarContract(withSignerIfPossible) {
	const { chainId } = useActiveWeb3React();
	let address;
	if (chainId) {
		switch (chainId) {
			case ChainId.MAINNET:
			case ChainId.BSCTESTNET:
		}
	}
	return useContract(address, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(address, withSignerIfPossible) {
	return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(tokenAddress, withSignerIfPossible) {
	return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function usePairContract(pairAddress, withSignerIfPossible) {
	return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible);
}

export function useMulticallContract() {
	const { chainId } = useActiveWeb3React();
	// @ts-ignore
	return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false);
}

export function useSocksController() {
	const { chainId } = useActiveWeb3React();
	return useContract(
		chainId === ChainId.MAINNET ? "0x65770b5283117639760beA3F867b69b3697a91dd" : undefined,
		UNISOCKS_ABI,
		false
	);
}
