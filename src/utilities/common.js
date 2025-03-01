import * as constants from './constants';
import BigNumber from 'bignumber.js';

const ethers = require('ethers');
const commaNumber = require('comma-number');

const format = commaNumber.bindWith(',', '.');

export const encodeParameters = (types, values) => {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
};

export const getArgs = (func) => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/.*?\(([^)]*)\)/)
    ? func.toString().match(/.*?\(([^)]*)\)/)[1]
    : '';
  // Split the arguments string into an array comma delimited.
  return args
    .split(',')
    .map((arg) => {
      // Ensure no inline comments are parsed and trim the whitespace.
      return arg.replace(/\/\*.*\*\//, '').trim();
    })
    .filter((arg) => {
      // Ensure no undefined values are added.
      return arg;
    });
};

export const checkIsValidNetwork = (walletType = 'metamask') => {
  if (window.ethereum) {
    let netId;
    if (walletType === 'binance' && window.BinanceChain) {
      netId = +window.BinanceChain.chainId;
    } else if (window.ethereum) {
      netId = window.ethereum.networkVersion
        ? +window.ethereum.networkVersion
        : +window.ethereum.chainId;
    }
    if (netId) {
      if (!constants.AVAILABLE_CHAINS.includes(netId)) {
        return false;
      }
      return true;
    }
  }
  return false;
};

export const addToken = async (asset = 'xai', decimal, type, chainId) => {
  let tokenAddress = '';
  let tokenSymbol = '';
  let tokenDecimals = 18;
  let tokenImage = '';
  if (asset === 'xai') {
    tokenAddress = constants.CONTRACT_XAI_TOKEN_ADDRESS[chainId];
    tokenSymbol = 'XAI';
    tokenDecimals = 18;
    tokenImage = `${window.location.origin}/coins/xai.svg`;
  } else {
    tokenAddress =
      type === 'token'
        ? constants.CONTRACT_TOKEN_ADDRESS[chainId][asset].address
        : constants.CONTRACT_ABEP_ADDRESS[chainId][asset].address;
    tokenSymbol =
      type === 'token'
        ? asset.toUpperCase()
        : `a${(asset === 'btcb' ? 'btc' : asset).toUpperCase()}`;
    tokenDecimals = decimal || (type === 'token' ? 18 : 8);
    tokenImage = `${window.location.origin}/images/coins/${type === 'token' ? (asset === 'ann' ?
      'ANN' : asset.toLowerCase()) : `a${asset === 'btcb' ? 'btc' : asset.toLowerCase()}`
      }.png`;
  }

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      // eslint-disable-next-line no-console
      console.log('Thanks for your interest!');
    } else {
      // eslint-disable-next-line no-console
      console.log('Your loss!');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

export const getBigNumber = (value) => {
  if (!value) {
    return new BigNumber(0);
  }
  if (BigNumber.isBigNumber(value)) {
    return value;
  }
  return new BigNumber(value);
};

export const currencyFormatter = (labelValue, rowValue) => {
  let suffix = '';
  let unit = 1;
  const abs = Math.abs(Number(labelValue));
  if (rowValue === 'price') {
    return `$${new BigNumber(`${abs}`).dp(2, 1)}`;
  }
  else if (rowValue === 'reservesValue') {
    return `$${(new BigNumber(`${abs}`).dp(2, 1)) / 1.0e6}M`;
  } else {
    if (abs >= 1.0e12) {
      // Nine Zeroes for Trillion
      suffix = 'T';
      unit = 1.0e12;
    } else if (abs >= 1.0e9) {
      // Nine Zeroes for Billions
      suffix = 'B';
      unit = 1.0e9;
    } else if (abs >= 1.0e6) {
      // Six Zeroes for Millions
      suffix = 'M';
      unit = 1.0e6;
    } else if (abs >= 1.0e3) {
      // Three Zeroes for Thousands
      suffix = 'K';
      unit = 1.0e3;
    }
  }

  return `$${format(new BigNumber(`${abs / unit}`).dp(2, 1))}${suffix}`;
  // return Math.abs(Number(labelValue)) >= 1.0e9
  //   ? `$${format(
  //       new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e9}`).dp(2, 1)
  //     )}B`
  //   : Math.abs(Number(labelValue)) >= 1.0e6
  //   ? `$${format(
  //       new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e6}`).dp(2, 1)
  //     )}M`
  //   : Math.abs(Number(labelValue)) >= 1.0e3
  //   ? `$${format(
  //       new BigNumber(`${Math.abs(Number(labelValue)) / 1.0e3}`).dp(2, 1)
  //     )}K`
  //   : `$${format(new BigNumber(`${Math.abs(Number(labelValue))}`).dp(2, 1))}`;
};
