import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { NetworkConnector } from "./NetworkConnector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

const POLLING_INTERVAL = 15000;
// @ts-ignore
const NETWORK_URL = process.env.REACT_APP_WEB3_PROVIDER;
// @ts-ignore
const CHAIN_ID = Number(process.env.REACT_APP_ENV === 'dev' ? 97 : 56);

const chains = [
	1,
	56,
	97
]

const networks = {
	"56": NETWORK_URL,
	"97": "https://data-seed-prebsc-1-s1.binance.org:8545"
}

if (typeof NETWORK_URL === "undefined") {
	throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`);
}

export const network = new NetworkConnector({
	urls: networks,
	defaultChainId: CHAIN_ID
});


export const injected = new InjectedConnector({
	supportedChainIds: chains,
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
	rpc: { 1: NETWORK_URL },
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: POLLING_INTERVAL,
});

export const ledger = new LedgerConnector({
	chainId: 1,
	url: NETWORK_URL,
	pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
	url: NETWORK_URL,
	appName: "Annex.finance",
});

const connectors = {
	injected: {
		provider: injected,
		name: "MetaMask",
	},
	ledger: {
		provider: ledger,
		name: "Ledger",
	},
	walletConnect: {
		provider: walletconnect,
		name: "Wallet Connect",
	},
	coinbase: {
		provider: walletlink,
		name: "Coinbase",
	},
};

export default connectors;
