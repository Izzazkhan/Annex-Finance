import Web3 from 'web3';
import * as constants from './constants';

const instance = new Web3(window.ethereum);

const TOKEN_ABI = {
  usdc: constants.CONTRACT_USDC_TOKEN_ABI,
  usdt: constants.CONTRACT_USDT_TOKEN_ABI,
  busd: constants.CONTRACT_BUSD_TOKEN_ABI,
  ann: constants.CONTRACT_ANN_TOKEN_ABI,
  btcb: constants.CONTRACT_BTCB_TOKEN_ABI,
  btc: constants.CONTRACT_BTCB_TOKEN_ABI,
  eth: constants.CONTRACT_ETH_TOKEN_ABI,
  wbtc: constants.CONTRACT_WBTC_TOKEN_ABI,
  wbnb: constants.CONTRACT_WBNB_TOKEN_ABI,
  trx: constants.CONTRACT_TRX_TOKEN_ABI,
  dot: constants.CONTRACT_DOT_TOKEN_ABI,
  ada: constants.CONTRACT_ADA_TOKEN_ABI,
  tusd: constants.CONTRACT_TUSD_TOKEN_ABI,
  xvs: constants.CONTRACT_XVS_TOKEN_ABI,
  cake: constants.CONTRACT_CAKE_TOKEN_ABI,
  link: constants.CONTRACT_LINK_TOKEN_ABI,
  xrp: constants.CONTRACT_XRP_TOKEN_ABI,
};
const AUCTION_ABI = {
  batch: constants.CONTRACT_ANNEX_BATCH_AUCTION_ABI,
  dutch: constants.CONTRACT_ANNEX_DUTCH_AUCTION_ABI,
  fixed: constants.CONTRACT_ANNEX_FIXED_AUCTION_ABI,
};

const call = (method, params) => {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    method(...params)
      .call()
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const send = (method, params, from) => {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    method(...params)
      .send({ from })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// export const getXaiTokenContract = () => {
//   return new instance.eth.Contract(
//     JSON.parse(constants.CONTRACT_XAI_TOKEN_ABI),
//     constants.CONTRACT_XAI_TOKEN_ADDRESS,
//   );
// };

// export const getXaiControllerContract = () => {
//   return new instance.eth.Contract(
//     JSON.parse(constants.CONTRACT_XAI_CONTROLLER_ABI),
//     constants.CONTRACT_XAI_UNITROLLER_ADDRESS,
//   );
// };

// export const getXaiVaultContract = () => {
//   return new instance.eth.Contract(
//     JSON.parse(constants.CONTRACT_XAI_VAULT_ABI),
//     constants.CONTRACT_XAI_VAULT_ADDRESS,
//   );
// };

export const getTokenContract = (name, chainId) => {
  return new instance.eth.Contract(
    JSON.parse(TOKEN_ABI[name]),
    constants.CONTRACT_TOKEN_ADDRESS[chainId][name || 'usdt']
      ? constants.CONTRACT_TOKEN_ADDRESS[chainId][name || 'usdt'].address
      : constants.CONTRACT_TOKEN_ADDRESS[chainId].usdt.address,
  );
};

export const getAbepContract = (name, chainId) => {
  return new instance.eth.Contract(
    JSON.parse(
      (name !== 'bnb' && name !== 'cro' && name !== 'tcro')
        ? constants.CONTRACT_ABEP_ABI
        : constants.CONTRACT_ABNB_ABI
    ),
    constants.CONTRACT_ABEP_ADDRESS[chainId][name || 'usdt']
      ? constants.CONTRACT_ABEP_ADDRESS[chainId][name || 'usdt'].address
      : constants.CONTRACT_ABEP_ADDRESS[chainId].usdt.address,
  );
};

export const getComptrollerContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_COMPTROLLER_ABI),
    constants.CONTRACT_COMPTROLLER_ADDRESS[chainId],
  );
};

export const getPriceOracleContract = (address, chainId) => {
  address = address ? address :  constants.CONTRACT_PRICE_ORACLE_ADDRESS[chainId]
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_PRICE_ORACLE_ABI), address);
};

export const getVoteContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_VOTE_ABI),
    constants.CONTRACT_VOTE_ADDRESS[chainId],
  );
};

export const getInterestModelContract = (address) => {
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_INTEREST_MODEL_ABI), address);
};

export const getAuctionContract = (name, chainId) => {
  return new instance.eth.Contract(
    JSON.parse(AUCTION_ABI[name]),
    constants.CONTRACT_ANNEX_AUCTION[chainId][name || 'batch']
      ? constants.CONTRACT_ANNEX_AUCTION[chainId][name || 'batch'].address
      : constants.CONTRACT_ANNEX_AUCTION[chainId].batch.address,
  );
};

export const getANNTokenContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_ANN_TOKEN_ABI),
    constants.CONTRACT_ANN_TOKEN_ADDRESS[chainId],
  );
};

export const getTokenContractWithDynamicAbi = (addr) => {
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_ANN_TOKEN_ABI), addr);
};

export const getEpochContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_ANN_TOKEN_ABI),
    constants.CONTRACT_TOKEN_ADDRESS[chainId].ann.address,
  );
};

export const dutchAuctionContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_ANNEX_DUTCH_AUCTION_ABI),
    constants.CONTRACT_DUTCH_AUCTION_ADDRESS[chainId],
  );
};

export const fixedAuctionContract = (chainId) => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_ANNEX_FIXED_AUCTION_ABI),
    constants.CONTRACT_FIXED_AUCTION_ADDRESS[chainId],
  );
};

export const methods = {
  call,
  send,
};
