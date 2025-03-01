import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { stakeFarm } from '../../utils/calls'
import { useMasterchef } from '../useContracts'
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useStakeFarms = (pid) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account, chainId, library } = useActiveWeb3React()
    const masterChefContract = useMasterchef(true)

    const handleStake = useCallback(
        async (amount) => {
            const txHash = await stakeFarm(masterChefContract, pid, amount, account)
            dispatch(fetchFarmsUserDataAsync({account, data, chainId, library}))
        },
        [masterChefContract, pid],
    )

    return { onStake: handleStake }
}

export default useStakeFarms
