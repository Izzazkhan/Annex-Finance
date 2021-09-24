import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { ethers } from 'ethers'
import { useMasterchef } from "../useContracts"
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useApproveFarm = (lpContract) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account } = useActiveWeb3React()
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
