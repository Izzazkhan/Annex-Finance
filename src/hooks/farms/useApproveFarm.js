import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { ethers, Contract } from 'ethers'
import { useMasterchef } from "../useContracts"
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useApproveFarm = (lpContract) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account } = useWeb3React()
    const masterChefContract = useMasterchef()
    const handleApprove = useCallback(async () => {
        try {
            const tx = await lpContract.approve(masterChefContract.address, ethers.constants.MaxUint256)
            const receipt = await tx.wait()
            dispatch(fetchFarmsUserDataAsync({account, data}))
            return receipt.status
        } catch (e) {
            return false
        }
    }, [lpContract, masterChefContract])

    return { onApprove: handleApprove }
}

export default useApproveFarm
