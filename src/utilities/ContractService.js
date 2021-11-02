import Web3 from 'web3';
import * as constants from './constants';

const instance = new Web3(window.ethereum);

const TOKEN_ABI = {
  usdc: constants.CONTRACT_USDC_TOKEN_ABI,
  usdt: constants.CONTRACT_USDT_TOKEN_ABI,
  busd: constants.CONTRACT_BUSD_TOKEN_ABI,
  ann: constants.CONTRACT_ANN_TOKEN_ABI,
  btcb: constants.CONTRACT_BTCB_TOKEN_ABI,
  eth: constants.CONTRACT_ETH_TOKEN_ABI,
  wbtc: constants.CONTRACT_WBTC_TOKEN_ABI,
  wbnb: constants.CONTRACT_WBNB_TOKEN_ABI,
  trx: constants.CONTRACT_TRX_TOKEN_ABI,
  dot: constants.CONTRACT_DOT_TOKEN_ABI,
  ada: constants.CONTRACT_ADA_TOKEN_ABI,
  tusd: constants.CONTRACT_TUSD_TOKEN_ABI,
};
const AUCTION_ABI = {
  batch: constants.CONTRACT_ANNEX_BATCH_AUCTION_ABI,
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

export const getTokenContract = (name) => {
  return new instance.eth.Contract(
    JSON.parse(TOKEN_ABI[name]),
    constants.CONTRACT_TOKEN_ADDRESS[name || 'usdc']
      ? constants.CONTRACT_TOKEN_ADDRESS[name || 'usdc'].address
      : constants.CONTRACT_TOKEN_ADDRESS.usdc.address,
  );
};

export const getAbepContract = (name) => {
  return new instance.eth.Contract(
    JSON.parse(name !== 'bnb' ? constants.CONTRACT_ABEP_ABI : constants.CONTRACT_ABNB_ABI),
    constants.CONTRACT_ABEP_ADDRESS[name || 'usdc']
      ? constants.CONTRACT_ABEP_ADDRESS[name || 'usdc'].address
      : constants.CONTRACT_ABEP_ADDRESS.usdc.address,
  );
};

export const getComptrollerContract = () => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_COMPTROLLER_ABI),
    constants.CONTRACT_COMPTROLLER_ADDRESS,
  );
};

export const getPriceOracleContract = (address = constants.CONTRACT_PRICE_ORACLE_ADDRESS) => {
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_PRICE_ORACLE_ABI), address);
};

export const getVoteContract = () => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_VOTE_ABI),
    constants.CONTRACT_VOTE_ADDRESS,
  );
};

export const getInterestModelContract = (address) => {
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_INTEREST_MODEL_ABI), address);
};

export const getAuctionContract = (name) => {
  return new instance.eth.Contract(
    JSON.parse(AUCTION_ABI[name]),
    constants.CONTRACT_ANNEX_AUCTION[name || 'batch']
      ? constants.CONTRACT_ANNEX_AUCTION[name || 'batch'].address
      : constants.CONTRACT_ANNEX_AUCTION.batch.address,
  );
};

export const getANNTokenContract = () => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_ANN_TOKEN_ABI),
    constants.CONTRACT_ANN_TOKEN_ADDRESS,
  );
};

export const getTokenContractWithDynamicAbi = (addr) => {
  return new instance.eth.Contract(JSON.parse(constants.CONTRACT_ANN_TOKEN_ABI), addr);
};

export const getEpochContract = () => {
  return new instance.eth.Contract(
    JSON.parse(constants.CONTRACT_EPOCH_ABI),
    constants.CONTRACT_TOKEN_ADDRESS.ann.address,
  );
};

export const methods = {
  call,
  send,
};
