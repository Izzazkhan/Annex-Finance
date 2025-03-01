import { ethers } from 'ethers'
import { getMulticallContract } from './contractHelper'


const multicall = async (abi, calls, chainId, library, isWrite = false) => {
    try {
        const multi = getMulticallContract(chainId, library, isWrite)
        const itf = new ethers.utils.Interface(abi)

        const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
        const { returnData } = await multi.aggregate(calldata)

        const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

        return res
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Multicall V2 uses the new "tryAggregate" function. It is different in 2 ways
 *
 * 1. If "requireSuccess" is false multicall will not bail out if one of the calls fails
 * 2. The return inclues a boolean whether the call was successful e.g. [wasSuccessfull, callResult]
 */
export const multicallv2 = async(
    abi,
    calls,
    options = { requireSuccess: true },
) => {
    const { requireSuccess } = options
    const multi = getMulticallContract()
    const itf = new ethers.utils.Interface(abi)

    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const returnData = await multi.tryAggregate(requireSuccess, calldata)
    const res = returnData.map((call, i) => {
        const [result, data] = call
        return result ? itf.decodeFunctionResult(calls[i].name, data) : null
    })

    return res
}

export default multicall
