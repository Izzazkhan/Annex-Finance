import {getWbnbAddress} from "./addressHelper";

const getLiquidityUrlPathParts = ({ quoteTokenAddress, tokenAddress }) => {
    const chainId = process.env.REACT_APP_CHAIN_ID
    const wBNBAddressString = getWbnbAddress()
    const quoteTokenAddressString = quoteTokenAddress ? quoteTokenAddress[chainId] : null
    const tokenAddressString = tokenAddress ? tokenAddress[chainId] : null
    const firstPart =
        !quoteTokenAddressString || quoteTokenAddressString === wBNBAddressString ? 'ETH' : quoteTokenAddressString
    const secondPart = !tokenAddressString || tokenAddressString === wBNBAddressString ? 'ETH' : tokenAddressString
    return `${firstPart}/${secondPart}`
}

export default getLiquidityUrlPathParts
