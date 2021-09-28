import {BIG_TEN} from "../utils/bigNumber";
import BigNumber from "bignumber.js";

export const NetworkContextName = "NETWORK";

export const BSC_BLOCK_TIME = 3
export const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18)
export const DEFAULT_GAS_LIMIT = 400000
export const DEFAULT_GAS_PRICE = 5
export const CAKE_PER_BLOCK = new BigNumber(40)
export const BLOCKS_PER_YEAR = new BigNumber((60 / BSC_BLOCK_TIME) * 60 * 24 * 365) // 10512000
export const CAKE_PER_YEAR = CAKE_PER_BLOCK.times(BLOCKS_PER_YEAR)


export const MobileColumnSchema = [
    {
        id: 1,
        name: 'farm',
        sortable: true,
        label: '',
    },
    {
        id: 2,
        name: 'earned',
        sortable: true,
        label: 'Earned',
    },
    {
        id: 3,
        name: 'apr',
        sortable: true,
        label: 'APR',
    },
    {
        id: 6,
        name: 'details',
        sortable: true,
        label: '',
    },
]

export const DesktopColumnSchema = [
    {
        id: 1,
        name: 'farm',
        sortable: true,
        label: '',
    },
    {
        id: 2,
        name: 'earned',
        sortable: true,
        label: 'Earned',
    },
    {
        id: 3,
        name: 'apr',
        sortable: true,
        label: 'APR',
    },
    {
        id: 4,
        name: 'liquidity',
        sortable: true,
        label: 'Liquidity',
    },
    {
        id: 5,
        name: 'multiplier',
        sortable: true,
        label: 'Multiplier',
    },
    {
        id: 6,
        name: 'details',
        sortable: true,
        label: '',
    },
]
