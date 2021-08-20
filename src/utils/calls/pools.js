import multicall from "../multicall";
import BigNumber from "bignumber.js";
import { getAddress } from '../addressHelper'
import {simpleRpcProvider} from "../providers";
import pools from '../../constants/pools';
import sousChefV2 from '../../constants/abis/sousChefV2.json'

/**
 * Returns the total number of pools that were active at a given block
 */

export const getActivePools = async (block) => {
    const eligiblePools = pools
        .filter((pool) => pool.sousId !== 0)
        .filter((pool) => pool.isFinished === false || pool.isFinished === undefined)
    const blockNumber = block || (await simpleRpcProvider.getBlockNumber())
    const startBlockCalls = eligiblePools.map(({ contractAddress }) => ({
        address: getAddress(contractAddress),
        name: 'startBlock',
    }))
    const endBlockCalls = eligiblePools.map(({ contractAddress }) => ({
        address: getAddress(contractAddress),
        name: 'bonusEndBlock',
    }))
    const startBlocks = await multicall(sousChefV2, startBlockCalls)
    const endBlocks = await multicall(sousChefV2, endBlockCalls)

    return eligiblePools.reduce((accum, poolCheck, index) => {
        const startBlock = startBlocks[index] ? new BigNumber(startBlocks[index]) : null
        const endBlock = endBlocks[index] ? new BigNumber(endBlocks[index]) : null

        if (!startBlock || !endBlock) {
            return accum
        }

        if (startBlock.gte(blockNumber) || endBlock.lte(blockNumber)) {
            return accum
        }

        return [...accum, poolCheck]
    }, [])
}
