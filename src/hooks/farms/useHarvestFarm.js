import { useCallback } from 'react'
import {useMasterchef} from "../useContracts";
import {harvestFarm} from "../../utils/calls";

const useHarvestFarm = (farmPid) => {
    const masterChefContract = useMasterchef()

    const handleHarvest = useCallback(async () => {
        await harvestFarm(masterChefContract, farmPid)
    }, [farmPid, masterChefContract])

    return { onReward: handleHarvest }
}

export default useHarvestFarm
