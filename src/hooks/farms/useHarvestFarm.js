import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { harvestFarm } from '../../utils/calls'
import { useMasterchef } from '../useContracts'
import { fetchFarmsUserDataAsync, useFarms } from 'core'

const useHarvestFarm = (pid) => {
    const dispatch = useDispatch()
    const { data } = useFarms()
    const { account } = useActiveWeb3React()
    const masterChefContract = useMasterchef()

    const handleHarvest = useCallback(async () => {
        await harvestFarm(masterChefContract, pid)
        dispatch(fetchFarmsUserDataAsync({account, data}))
    }, [pid, masterChefContract])

    return { onReward: handleHarvest }
}

export default useHarvestFarm
