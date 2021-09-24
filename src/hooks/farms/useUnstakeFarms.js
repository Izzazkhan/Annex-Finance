import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import {unstakeFarm} from '../../utils/calls'
import {useMasterchef} from '../useContracts'
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useUnstakeFarms = (pid) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account } = useWeb3React()
    const masterChefContract = useMasterchef()

    const handleUnstake = useCallback(
        async (amount) => {
            await unstakeFarm(masterChefContract, pid, amount)
            dispatch(fetchFarmsUserDataAsync({account, data}))
        },
        [masterChefContract, pid],
    )

    return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
