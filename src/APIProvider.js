import {accountActionCreators, connectAccount} from "./core";
import {bindActionCreators} from "redux";
import * as constants from './utilities/constants'
import {
	getAbepContract,
	getComptrollerContract,
	getTokenContract,
	getXaiTokenContract,
	methods
} from "./utilities/ContractService";
import {promisify} from "./utilities";
import commaNumber from "comma-number";
import Web3 from "web3";
import {useActiveWeb3React} from "./hooks";
import {checkIsValidNetwork} from "./utilities/common";
import {useEffect} from "react";
import BigNumber from "bignumber.js";

const APIProvider = ({settings, setSetting, getGovernanceAnnex, ...props}) => {
	const { account } = useActiveWeb3React();

	const setDecimals = async () => {
		const decimals = {};
		for (const item of Object.values(constants.CONTRACT_TOKEN_ADDRESS)) {
			decimals[`${item.id}`] = {};
			if (item.id !== 'bnb') {
				const tokenContract = getTokenContract(item.id);
				const tokenDecimals = await methods.call(
					tokenContract.methods.decimals,
					[]
				);
				const aBepContract = getAbepContract(item.id);
				const atokenDecimals = await methods.call(
					aBepContract.methods.decimals,
					[]
				);
				decimals[`${item.id}`].token = Number(tokenDecimals);
				decimals[`${item.id}`].atoken = Number(atokenDecimals);
				decimals[`${item.id}`].price = 18 + 18 - Number(tokenDecimals);
			} else {
				decimals[`${item.id}`].token = 18;
				decimals[`${item.id}`].atoken = 8;
				decimals[`${item.id}`].price = 18;
			}
		}
		decimals.mantissa = +process.env.REACT_APP_MANTISSA_DECIMALS;
		decimals.comptroller = +process.env.REACT_APP_COMPTROLLER_DECIMALS;
		await setSetting({ decimals });
	};

	const initSettings = async () => {
		await setDecimals();
		setSetting({
			pendingInfo: {
				type: '',
				status: false,
				amount: 0,
				symbol: ''
			}
		});
	};


	const getMarkets = async () => {
		const res = await promisify(getGovernanceAnnex, {});
		if (!res.status) {
			return;
		}

		setSetting({
			markets: res.data.markets,
			dailyAnnex: res.data.dailyAnnex
		});
	};


	useEffect(() => {
		let updateTimer;
		if (account) {
			updateTimer = setInterval(() => {
				if (checkIsValidNetwork('metamask')) {
					getMarkets();
				}
			}, 3000);
		}
		return function cleanup() {
			if (updateTimer) {
				clearInterval(updateTimer);
			}
		};
	}, [account, settings.assetList, settings.accountLoading]);

	useEffect(() => {
		if (window.ethereum) {
			if (
				account &&
				checkIsValidNetwork('metamask')
			) {
				initSettings();
			}
		}
	}, [account]);



	const updateMarketInfo = async () => {
		const accountAddress = account;
		if (!accountAddress || !settings.decimals || !settings.markets) {
			return;
		}

		const appContract = getComptrollerContract();
		const xaiContract = getXaiTokenContract();

		// Total Vai Staked
		let xaiVaultStaked = await methods.call(xaiContract.methods.balanceOf, [
			constants.CONTRACT_XAI_VAULT_ADDRESS
		]);
		xaiVaultStaked = new BigNumber(xaiVaultStaked)
			.div(1e18)
			.dp(4, 1)
			.toString(10);

		// minted xai amount
		let xaiMinted = await methods.call(appContract.methods.mintedXAIs, [
			accountAddress
		]);
		xaiMinted = new BigNumber(xaiMinted).div(new BigNumber(10).pow(18));

		// XAI APY
		let xaiAPY;
		if (settings.dailyAnnex && xaiVaultStaked) {
			let annexXAIVaultRate = await methods.call(
				appContract.methods.annexXAIVaultRate,
				[]
			);
			annexXAIVaultRate = new BigNumber(annexXAIVaultRate)
				.div(1e18)
				.times(20 * 60 * 24);
			const annMarket = settings.markets.find(
				ele => ele.underlyingSymbol === 'ANN'
			);
			xaiAPY = new BigNumber(annexXAIVaultRate)
				.times(annMarket.tokenPrice)
				.times(365 * 100)
				.div(xaiVaultStaked)
				.dp(2, 1)
				.toString(10);
			setSetting({
				xaiAPY
			});
		}

		const assetsIn = await methods.call(appContract.methods.getAssetsIn, [
			accountAddress
		]);

		let totalSupplyBalance = new BigNumber(0);
		let totalBorrowBalance = new BigNumber(0);
		let totalBorrowLimit = new BigNumber(0);
		let totalLiquidity = new BigNumber(0);
		const assetList = [];

		for (
			let index = 0;
			index < Object.values(constants.CONTRACT_TOKEN_ADDRESS).length;
			index += 1
		) {
			const item = Object.values(constants.CONTRACT_TOKEN_ADDRESS)[index];
			if (!settings.decimals[item.id]) {
				return;
			}

			let market = settings.markets.find(
				ele => ele.underlyingSymbol === item.symbol
			);
			if (!market) market = {};
			const asset = {
				key: index,
				id: item.id,
				img: item.asset,
				aimg: item.aAsset,
				name: market.underlyingSymbol || item.symbol,
				symbol: market.underlyingSymbol || item.symbol,
				tokenAddress: item.address,
				asymbol: market.symbol,
				atokenAddress: constants.CONTRACT_ABEP_ADDRESS[item.id].address,
				supplyApy: new BigNumber(market.supplyApy || 0),
				borrowApy: new BigNumber(market.borrowApy || 0),
				annSupplyApy: new BigNumber(market.supplyAnnexApy || 0),
				annBorrowApy: new BigNumber(market.borrowAnnexApy || 0),
				collateralFactor: new BigNumber(market.collateralFactor || 0).div(1e18),
				tokenPrice: new BigNumber(market.tokenPrice || 0),
				liquidity: new BigNumber(market.liquidity || 0),
				borrowCaps: new BigNumber(market.borrowCaps || 0),
				totalBorrows: new BigNumber(market.totalBorrows2 || 0),
				walletBalance: new BigNumber(0),
				supplyBalance: new BigNumber(0),
				borrowBalance: new BigNumber(0),
				isEnabled: false,
				collateral: false,
				percentOfLimit: '0'
			};

			const tokenDecimal = settings.decimals[item.id].token;
			const aBepContract = getAbepContract(item.id);
			asset.collateral = assetsIn.includes(asset.atokenAddress);
			// wallet balance
			if (item.id !== 'bnb') {
				const tokenContract = getTokenContract(item.id);
				const walletBalance = await methods.call(
					tokenContract.methods.balanceOf,
					[accountAddress]
				);
				asset.walletBalance = new BigNumber(walletBalance).div(
					new BigNumber(10).pow(tokenDecimal)
				);

				// allowance
				let allowBalance = await methods.call(tokenContract.methods.allowance, [
					accountAddress,
					asset.atokenAddress
				]);
				allowBalance = new BigNumber(allowBalance).div(
					new BigNumber(10).pow(tokenDecimal)
				);
				asset.isEnabled = allowBalance.isGreaterThan(asset.walletBalance);
			} else if (window.ethereum) {
				const web3 = new Web3(
					Web3.givenProvider
					|| new Web3.providers.HttpProvider(process.env.REACT_APP_WEB3_PROVIDER)
				);
				await web3.eth.getBalance(accountAddress, (err, res) => {
					if (!err) {
						asset.walletBalance = new BigNumber(res).div(
							new BigNumber(10).pow(tokenDecimal)
						);
					}
				});
				asset.isEnabled = true;
			}
			// supply balance
			const supplyBalance = await methods.call(
				aBepContract.methods.balanceOfUnderlying,
				[accountAddress]
			);
			asset.supplyBalance = new BigNumber(supplyBalance).div(
				new BigNumber(10).pow(tokenDecimal)
			);

			// borrow balance
			const borrowBalance = await methods.call(
				aBepContract.methods.borrowBalanceCurrent,
				[accountAddress]
			);
			asset.borrowBalance = new BigNumber(borrowBalance).div(
				new BigNumber(10).pow(tokenDecimal)
			);

			// percent of limit
			asset.percentOfLimit = new BigNumber(settings.totalBorrowLimit).isZero()
				? '0'
				: asset.borrowBalance
					.times(asset.tokenPrice)
					.div(settings.totalBorrowLimit)
					.times(100)
					.dp(0, 1)
					.toString(10);

			// hypotheticalLiquidity
			const totalBalance = await methods.call(aBepContract.methods.balanceOf, [
				accountAddress
			]);
			asset.hypotheticalLiquidity = await methods.call(
				appContract.methods.getHypotheticalAccountLiquidity,
				[accountAddress, asset.atokenAddress, totalBalance, 0]
			);

			assetList.push(asset);

			const supplyBalanceUSD = asset.supplyBalance.times(asset.tokenPrice);
			const borrowBalanceUSD = asset.borrowBalance.times(asset.tokenPrice);

			totalSupplyBalance = totalSupplyBalance.plus(supplyBalanceUSD);
			totalBorrowBalance = totalBorrowBalance.plus(borrowBalanceUSD);

			if (asset.collateral) {
				totalBorrowLimit = totalBorrowLimit.plus(
					supplyBalanceUSD.times(asset.collateralFactor)
				);
			}

			totalLiquidity = totalLiquidity.plus(
				new BigNumber(market.totalSupplyUsd || 0)
			);
		}
		let xaiBalance = await methods.call(xaiContract.methods.balanceOf, [
			constants.CONTRACT_XAI_VAULT_ADDRESS
		]);
		xaiBalance = new BigNumber(xaiBalance).div(1e18);

		setSetting({
			assetList,
			xaiMinted,
			totalLiquidity: totalLiquidity.plus(xaiBalance).toString(10),
			totalSupplyBalance: totalSupplyBalance.toString(10),
			totalBorrowBalance: totalBorrowBalance.plus(xaiMinted).toString(10),
			totalBorrowLimit: totalBorrowLimit.toString(10)
		});
	};


	const handleAccountChange = async () => {
		setSetting({
			accountLoading: true
		});
		await updateMarketInfo();
		setSetting({
			accountLoading: false
		});
	};

	useEffect(() => {
		updateMarketInfo();
	}, [settings.markets, account]);

	useEffect(() => {
		if (!account) return;
		handleAccountChange();
	}, [account]);


	return props.children;
}

const mapStateToProps = ({ account }) => ({
	settings: account.setting
});

const mapDispatchToProps = dispatch => {
	const { setSetting, getGovernanceAnnex } = accountActionCreators;

	return bindActionCreators(
		{
			setSetting,
			getGovernanceAnnex
		},
		dispatch
	);
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(APIProvider);
