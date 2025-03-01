import { ChainId, JSBI, Percent, Token, WETH } from "@annex/sdk";
import { CONTRACT_ROUTER_ADDRESS } from "../utilities/constants";

export const ROUTER_ADDRESS = CONTRACT_ROUTER_ADDRESS;

export const BUSD = new Token(
	ChainId.MAINNET,
	"0xe9e7cea3dedca5984780bafc599bd69add087d56",
	18,
	"BUSD",
	"Binance USD"
);
export const USDT = new Token(
	ChainId.MAINNET,
	"0x55d398326f99059ff775485246999027b3197955",
	18,
	"USDT",
	"Tether USD"
);
export const USDC = new Token(
	ChainId.MAINNET,
	"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
	18,
	"USDC",
	"USD Coin"
);

const WETH_ONLY = {
	[ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
	[ChainId.BSCTESTNET]: [WETH[ChainId.BSCTESTNET]],
	[ChainId.CASSINI]: [WETH[ChainId.CASSINI]],
	[ChainId.CRONOS]: [WETH[ChainId.CRONOS]],
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], BUSD, USDT, USDC],
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases
 * that are considered for these tokens.
 */
export const CUSTOM_BASES = {
	[ChainId.MAINNET]: {},
	[ChainId.CASSINI]: {},
	[ChainId.CRONOS]: {},
};

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], BUSD, USDT, USDC],
	[ChainId.CASSINI]: [
		...WETH_ONLY[ChainId.CASSINI],
		new Token(ChainId.CASSINI, "0x2C074fDeFc6613FA77d48332B5c57A013Ab85DCE", 18, "USDT", "Tether USD")
	],
	[ChainId.CRONOS]: [
		...WETH_ONLY[ChainId.CRONOS],
		new Token(ChainId.CRONOS, "0x66e428c3f67a68878562e79A0234c1F83c208770", 6, "USDT", "Tether USD"),
		new Token(ChainId.CRONOS, "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", 6, "USDC", "USD Coin"),
		new Token(ChainId.CRONOS, "0xF2001B145b43032AAF5Ee2884e456CCd805F677D", 18, "DAI", "DAI Token")
	],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], BUSD, USDT, USDC],
	[ChainId.CASSINI]: [
		...WETH_ONLY[ChainId.CASSINI],
		new Token(ChainId.CASSINI, "0x2C074fDeFc6613FA77d48332B5c57A013Ab85DCE", 18, "USDT", "Tether USD"),
		new Token(ChainId.CASSINI, "0x1D8A354655398EFE91a3Bc5BfAFB9602344Eeaf8", 18, "ETH", "Ethereum Token"),
	],
	[ChainId.CRONOS]: [
		...WETH_ONLY[ChainId.CRONOS],
		new Token(ChainId.CRONOS, "0x66e428c3f67a68878562e79A0234c1F83c208770", 6, "USDT", "Tether USD"),
		new Token(ChainId.CRONOS, "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", 6, "USDC", "USD Coin"),
		new Token(ChainId.CRONOS, "0xF2001B145b43032AAF5Ee2884e456CCd805F677D", 18, "DAI", "DAI Token"),
	],
};

export const PINNED_PAIRS = {
	[ChainId.MAINNET]: [
		[
			new Token(
				ChainId.MAINNET,
				"0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067",
				18,
				"ANN",
				"Annex Token"
			),
			new Token(ChainId.MAINNET, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB"),
		],
		[BUSD, USDT],
	],
	[ChainId.CASSINI]: [
		[
			new Token(ChainId.CASSINI, "0x8Ef3aC0BfC2BEd64F5Ba19987B9369aD72dC7fA8", 18, "ANN", "Annex Token"),
			new Token(ChainId.CASSINI, "0x7b99bD319036FAF92C02478f973bAadEdea7a1Aa", 18, "WCRO", "Wrapped WCRO"),
		],
		[
			new Token(ChainId.CASSINI, "0x1D8A354655398EFE91a3Bc5BfAFB9602344Eeaf8", 18, "ETH", "Ethereum Token"),
			new Token(ChainId.CASSINI, "0x2C074fDeFc6613FA77d48332B5c57A013Ab85DCE", 18, "USDT", "Tether USD"),
		]
	],
	[ChainId.CRONOS]: [
		[
			new Token(ChainId.CRONOS, "0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067", 18, "ANN", "Annex Token"),
			new Token(ChainId.CRONOS, "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 18, "WCRO", "Wrapped WCRO"),
		],
		[
			new Token(ChainId.CRONOS, "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a", 18, "ETH", "Ethereum Token"),
			new Token(ChainId.CRONOS, "0x66e428c3f67a68878562e79A0234c1F83c208770", 6, "USDT", "Tether USD"),
		],
		[
			new Token(ChainId.CRONOS, "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", 6, "USDC", "USD Coin"),
			new Token(ChainId.CRONOS, "0x66e428c3f67a68878562e79A0234c1F83c208770", 6, "USDT", "Tether USD"),
		],
		[
			new Token(ChainId.CRONOS, "0xF2001B145b43032AAF5Ee2884e456CCd805F677D", 18, "DAI", "DAI Token"),
			new Token(ChainId.CRONOS, "0x66e428c3f67a68878562e79A0234c1F83c208770", 6, "USDT", "Tether USD"),
		]
	]
};

export const NetworkContextName = "NETWORK";

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 80;
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20;

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));
export const BIPS_BASE = JSBI.BigInt(10000);
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW = new Percent(JSBI.BigInt(100), BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM = new Percent(JSBI.BigInt(300), BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH = new Percent(JSBI.BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = new Percent(JSBI.BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT = new Percent(JSBI.BigInt(1500), BIPS_BASE); // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000));
