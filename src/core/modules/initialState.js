import {Field} from "./swap/actions";
import {Field as MintField} from "./mint/actions";
import {Field as BurnField} from "./burn/actions";
import {DEFAULT_LIST_OF_LISTS, DEFAULT_TOKEN_LIST_URL} from "../../constants/lists";
import DEFAULT_LIST from "../../constants/tokens/annex.json";
import {DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE} from "../../constants/swap";
import poolsConfig from '../../constants/pools'

const auth = {
  user: null
};

const account = {
  setting: {
    selectedAddress: null,
    marketType: 'supply',
    borrowMarket: [],
    supplyMarket: [],
    latestBlockNumber: '',
    decimals: {},
    assetList: [],
    totalLiquidity: '0',
    totalSupplyBalance: '0',
    totalBorrowBalance: '0',
    totalBorrowLimit: '0',
    pendingInfo: {
      type: '',
      status: false,
      amount: 0,
      symbol: ''
    },
    withANN: true,
    markets: []
  }
};

const swap = {
  independentField: Field.INPUT,
  typedValue: "",
  [Field.INPUT]: {
    currencyId: "",
  },
  [Field.OUTPUT]: {
    currencyId: "",
  },
  recipient: null,

}

const multicall = {
  callResults: {},
}


const NEW_LIST_STATE = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null,
};

const lists = {
  lastInitializedDefaultListOfLists: DEFAULT_LIST_OF_LISTS,
  byUrl: {
    ...DEFAULT_LIST_OF_LISTS.reduce((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE;
      return memo;
    }, {}),
    [DEFAULT_TOKEN_LIST_URL]: {
      error: null,
      current: DEFAULT_LIST,
      loadingRequestId: null,
      pendingUpdate: null,
    },
  },
  selectedListUrl: DEFAULT_TOKEN_LIST_URL,
}

const application = {
  blockNumber: {},
  currentChainId: Number(process.env.REACT_APP_DEFAULT_CHAIN_ID || 56)
}

const transaction = {}

const currentTimestamp = () => new Date().getTime();

const user = {
  userExpertMode: false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
}

const mint = {
  independentField: MintField.CURRENCY_A,
  typedValue: "",
  otherTypedValue: "",
}

const burn = {
  independentField: BurnField.LIQUIDITY_PERCENT,
  typedValue: "0",
}

const farms = { data: [], userDataLoaded: false, loading: false }

const pools = {
  data: [...poolsConfig],
  userDataLoaded: false,
  cakeVault: {
    totalShares: null,
    pricePerFullShare: null,
    totalCakeInVault: null,
    estimatedCakeBountyReward: null,
    totalPendingCakeHarvest: null,
    fees: {
      performanceFee: null,
      callFee: null,
      withdrawalFee: null,
      withdrawalFeePeriod: null,
    },
    userData: {
      isLoading: true,
      userShares: null,
      cakeAtLastUserAction: null,
      lastDepositedTime: null,
      lastUserActionTime: null,
    },
  },
}

export const initialState = {
  auth,
  account,
  swap,
  multicall,
  lists,
  application,
  transaction,
  user,
  mint,
  burn,
  farms,
  pools
};
