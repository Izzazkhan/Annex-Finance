import { useCallback } from 'react'
import {useMasterchef} from "../useContracts";
import {stakeFarm} from "../../utils/calls";

const useStakeFarms = (pid) => {
    const masterChefContract = useMasterchef()

    const handleStake = useCallback(
        async (amount) => {
            const txHash = await stakeFarm(masterChefContract, pid, amount)
            console.info(txHash)
        },
        [masterChefContract, pid],
    )

    return { onStake: handleStake }
}

export default useStakeFarms
