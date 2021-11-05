import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { NetworkConnector } from './NetworkConnector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const POLLING_INTERVAL = 15000;
// @ts-ignore
const DEFAULT_CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID;

const chains = [56, 97, 338];

const networks = {
  1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  56: 'https://bsc-dataseed.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  338: 'https://cronos-testnet-3.crypto.org:8545/'
};

export const network = new NetworkConnector({
  urls: networks,
  defaultChainId: DEFAULT_CHAIN_ID,
});

export const injected = new InjectedConnector({
  supportedChainIds: chains,
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: networks[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const ledger = new LedgerConnector({
  chainId: 1,
  url: networks[1],
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: networks[DEFAULT_CHAIN_ID],
  appName: 'Annex.finance',
});

const connectors = {
  injected: {
    provider: injected,
    name: 'MetaMask',
  },
  ledger: {
    provider: ledger,
    name: 'Ledger',
  },
  walletConnect: {
    provider: walletconnect,
    name: 'Wallet Connect',
  },
  coinbase: {
    provider: walletlink,
    name: 'Coinbase',
  },
};

export default connectors;
