import {Field} from "./swap/actions";
import {DEFAULT_LIST_OF_LISTS, DEFAULT_TOKEN_LIST_URL} from "../../constants/lists";
import DEFAULT_LIST from "../../constants/tokens/annex.json";
import {DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE} from "../../constants/swap";

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

export const initialState = {
  auth,
  account,
  swap,
  multicall,
  lists,
  application,
  transaction,
  user
};
