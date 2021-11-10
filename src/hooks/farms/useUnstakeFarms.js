import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { unstakeFarm } from '../../utils/calls'
import { useMasterchef } from '../useContracts'
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useUnstakeFarms = (pid) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account, chainId } = useActiveWeb3React()
    const masterChefContract = useMasterchef()

    const handleUnstake = useCallback(
        async (amount) => {
            await unstakeFarm(masterChefContract, pid, amount)
            dispatch(fetchFarmsUserDataAsync({account, data, chainId}))
        },
        [masterChefContract, pid],
    )

    return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
