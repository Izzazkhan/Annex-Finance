import {ethers} from "ethers";

export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_WEB3_PROVIDER)

export default null
