import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL} from "../../constants";

const options = {
    gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract, pid, amount, account) => {
    const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
    const tx = await masterChefContract.deposit(pid, value, options)
    const receipt = await tx.wait()
    return receipt.status
}

export const unstakeFarm = async (masterChefContract, pid, amount) => {
    const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
    const tx = await masterChefContract.withdraw(pid, value, options)
    const receipt = await tx.wait()
    return receipt.status
}

export const harvestFarm = async (masterChefContract, pid) => {
    const value = new BigNumber('0').times(DEFAULT_TOKEN_DECIMAL).toString()
    const tx = await masterChefContract.deposit(pid, value, options)
    const receipt = await tx.wait()
    return receipt.status
}
