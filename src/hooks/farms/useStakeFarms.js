import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { stakeFarm } from "../../utils/calls";
import { useMasterchef } from "../useContracts";
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useStakeFarms = (pid) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account } = useWeb3React()
    const masterChefContract = useMasterchef()

    const handleStake = useCallback(
        async (amount) => {
            const txHash = await stakeFarm(masterChefContract, pid, amount)
            dispatch(fetchFarmsUserDataAsync({account, data}))
        },
        [masterChefContract, pid],
    )

    return { onStake: handleStake }
}

export default useStakeFarms
