import { useCallback } from 'react'
import {useMasterchef} from "../useContracts";
import {unstakeFarm} from "../../utils/calls";

const useUnstakeFarms = (pid) => {
    const masterChefContract = useMasterchef()

    const handleUnstake = useCallback(
        async (amount) => {
            await unstakeFarm(masterChefContract, pid, amount)
        },
        [masterChefContract, pid],
    )

    return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
