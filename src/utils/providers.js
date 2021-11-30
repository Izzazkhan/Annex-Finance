import {ethers} from "ethers";
import { WEB3_PROVIDERS } from '../utilities/constants';

export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_WEB3_PROVIDER)
export const simpleRpcProviders = {
    56: new ethers.providers.JsonRpcProvider(WEB3_PROVIDERS[56]),
    97: new ethers.providers.JsonRpcProvider(WEB3_PROVIDERS[97]),
    25: new ethers.providers.JsonRpcProvider(WEB3_PROVIDERS[25]),
    339: new ethers.providers.JsonRpcProvider(WEB3_PROVIDERS[339]),
}

export default null
