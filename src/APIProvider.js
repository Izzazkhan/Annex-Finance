import { accountActionCreators, connectAccount } from './core';
import { bindActionCreators } from 'redux';
import * as constants from './utilities/constants';
import {
  getAbepContract,
  getComptrollerContract,
  getTokenContract,
  // getXaiTokenContract,
  methods,
} from './utilities/ContractService';
import { promisify } from './utilities';
import commaNumber from 'comma-number';
import Web3 from 'web3';
import { useActiveWeb3React } from './hooks';
import { checkIsValidNetwork } from './utilities/common';
import { useEffect } from 'react';
import BigNumber from 'bignumber.js';

const APIProvider = ({ settings, setSetting, getGovernanceAnnex, ...props }) => {
  const { account, chainId } = useActiveWeb3React();

  const setDecimals = async () => {
    const decimals = {};

    const contractAddresses = Object.values(constants.CONTRACT_TOKEN_ADDRESS[chainId]).filter(item => {
      return item.id && item.id != 'ann'
    });

    const contractDecimals = await Promise.all(
      contractAddresses.map(item => {
        if (item.id !== 'bnb' && item.id !== 'cro' && item.id !== 'tcro') {
          const tokenContract = getTokenContract(item.id, chainId);
          const aBepContract = getAbepContract(item.id, chainId);
          return Promise.all([
            Promise.resolve(item.id),
            methods.call(tokenContract.methods.decimals, []),
            methods.call(aBepContract.methods.decimals, [])
          ]);
        } else {
          return Promise.all([
            Promise.resolve(item.id),
            Promise.resolve(18),
            Promise.resolve(8),
          ]);
        }
      })
    );

    contractDecimals.forEach(item => {
      decimals[`${item[0]}`] = {
        token: Number(item[1]),
        atoken: Number(item[2]),
        price: 18 + 18 - Number(item[1]),
      };
    });

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
        symbol: '',
      },
    });
  };

  const getMarkets = async () => {
    const res = await promisify(getGovernanceAnnex, {});
    if (!res.status) {
      return;
    }
    setSetting({
      annPrice: res.data.annexPrice,
      annPricePCS: res.data.annexPricePCS,
      markets: res.data.markets,
      dailyAnnex: res.data.dailyAnnex,
      blockNumber: res.data.blockNumber,
      farmTVL: res.data.farmTVL,
      totalAnnexDistributed: res.data.totalAnnexDistributed,
    });

    getTotalLiquidity(res.data.markets, res.data.farmTVL);
  };

  useEffect(() => {
    let updateTimer;
    if (account) {
      updateTimer = setInterval(() => {
        if (checkIsValidNetwork('metamask')) {
          getMarkets();
        }
      }, 7000);
    }
    return function cleanup() {
      if (updateTimer) {
        clearInterval(updateTimer);
      }
    };
  }, [account, settings.assetList, settings.accountLoading]);

  useEffect(() => {
    if (window.ethereum) {
      if (account && checkIsValidNetwork('metamask')) {
        initSettings();
      }
    }
  }, [account, chainId]);

  const getTotalLiquidity = async (markets, farmTVL) => {
    let totalLiquidity = new BigNumber(0);

    for (
      let index = 0;
      index < Object.values(constants.CONTRACT_TOKEN_ADDRESS[chainId]).length;
      index += 1
    ) {
      const item = Object.values(constants.CONTRACT_TOKEN_ADDRESS[chainId])[index];
      let market = markets.find((ele) => ele.underlyingSymbol === item.symbol);
      if (!market) market = {};
      totalLiquidity = totalLiquidity.plus(new BigNumber(market.totalSupplyUsd || 0));
    }
    totalLiquidity = totalLiquidity.plus(farmTVL);
    setSetting({
      totalLiquidity: totalLiquidity.toString(10),
    });
  };

  const appContract = getComptrollerContract(chainId);
  const updateMarketInfo = async () => {
    const accountAddress = account;
    if (!accountAddress || !settings.decimals || !settings.markets) {
      return;
    }

    // const xaiContract = getXaiTokenContract();

    // Total Vai Staked
    // let xaiVaultStaked = await methods.call(xaiContract.methods.balanceOf, [
    // 	constants.CONTRACT_XAI_VAULT_ADDRESS
    // ]);
    // xaiVaultStaked = new BigNumber(xaiVaultStaked)
    // 	.div(1e18)
    // 	.dp(4, 1)
    // 	.toString(10);

    // minted xai amount
    // let xaiMinted = await methods.call(appContract.methods.mintedXAIs, [
    // 	accountAddress
    // ]);
    // xaiMinted = new BigNumber(xaiMinted).div(new BigNumber(10).pow(18));

    // XAI APY
    // let xaiAPY;
    // if (settings.dailyAnnex && xaiVaultStaked) {
    if (settings.dailyAnnex) {
      // let annexXAIVaultRate = await methods.call(
      // 	appContract.methods.annexXAIVaultRate,
      // 	[]
      // );
      // annexXAIVaultRate = new BigNumber(annexXAIVaultRate)
      // 	.div(1e18)
      // 	.times(20 * 60 * 24);
      // const annMarket = settings.markets.find((ele) => ele.underlyingSymbol === 'ANN');
      // xaiAPY = new BigNumber(annexXAIVaultRate)
      // 	.times(annMarket.tokenPrice)
      // 	.times(365 * 100)
      // 	.div(xaiVaultStaked)
      // 	.dp(2, 1)
      // 	.toString(10);
      // setSetting({
      // 	xaiAPY
      // });
    }

    const assetsIn = await methods.call(appContract.methods.getAssetsIn, [accountAddress]);

    let totalSupplyBalance = new BigNumber(0);
    let totalBorrowBalance = new BigNumber(0);
    let totalBorrowLimit = new BigNumber(0);
    const assetList = [];

    const contractAddresses = Object.values(constants.CONTRACT_TOKEN_ADDRESS[chainId]).filter(item => {
      return settings.decimals[item.id]
    });

    let web3 = null;
    if (window.ethereum) {
      web3 = new Web3(
        Web3.givenProvider ||
          new Web3.providers.HttpProvider(process.env.REACT_APP_WEB3_PROVIDER),
      );
    }

    const contractData = await Promise.all(
      contractAddresses.map(item => {
        let market = settings.markets.find((ele) => ele.underlyingSymbol.toLowerCase() === item.symbol.toLowerCase());
        if (!market) market = {};

        const aBepContract = getAbepContract(item.id, chainId);
        if (item.id !== 'bnb' && item.id !== 'cro' && item.id !== 'tcro') {
          const tokenContract = getTokenContract(item.id, chainId);

          return Promise.all([
            Promise.resolve(item),
            Promise.resolve(market),
            methods.call(tokenContract.methods.balanceOf, [accountAddress]),
            methods.call(tokenContract.methods.allowance, [
              accountAddress,
              constants.CONTRACT_ABEP_ADDRESS[chainId][item.id].address,
            ]),
            methods.call(aBepContract.methods.balanceOfUnderlying, [
              accountAddress,
            ]),
            methods.call(aBepContract.methods.borrowBalanceCurrent, [
              accountAddress,
            ]),
            methods.call(aBepContract.methods.balanceOf, [accountAddress]),
          ])
        } else {
          return Promise.all([
            Promise.resolve(item),
            Promise.resolve(market),
            web3 ? web3.eth.getBalance(accountAddress) : Promise.resolve(0),
            Promise.resolve(1),
            methods.call(aBepContract.methods.balanceOfUnderlying, [
              accountAddress,
            ]),
            methods.call(aBepContract.methods.borrowBalanceCurrent, [
              accountAddress,
            ]),
            methods.call(aBepContract.methods.balanceOf, [accountAddress]),
          ])
        }
      })
    );

    const hypotheticalLiquidities = await Promise.all(
      contractData.map(data => {
        return methods.call(
          appContract.methods.getHypotheticalAccountLiquidity,
          [accountAddress, constants.CONTRACT_ABEP_ADDRESS[chainId][data[0].id].address, data[6], 0],
        )
      })
    );

    // for (
    //   let index = 0;
    //   index < contractData.length;
    //   index += 1
    // ) {
    contractData.forEach((data, index) => {
      const tokenDecimal = settings.decimals[data[0].id].token;
      const allowBalance = (data[0].id !== 'bnb' && data[0].id !== 'cro' && data[0].id !== 'tcro')
        ? new BigNumber(data[3]).div(new BigNumber(10).pow(tokenDecimal))
        : 0;
      const walletBalance = new BigNumber(data[2]).div(new BigNumber(10).pow(tokenDecimal));
      const isEnabled = (data[0].id !== 'bnb' && data[0].id !== 'cro' && data[0].id !== 'tcro')
        ? allowBalance.isGreaterThan(walletBalance)
        : true;
      const borrowBalance = new BigNumber(data[5]).div(new BigNumber(10).pow(tokenDecimal));
      const percentOfLimit = new BigNumber(settings.totalBorrowLimit).isZero()
        ? '0'
        : borrowBalance
            .times(new BigNumber(data[1].tokenPrice || 0))
            .div(settings.totalBorrowLimit)
            .times(100)
            .dp(0, 1)
            .toString(10);

      const asset = {
        key: index,
        id: data[0].id,
        img: data[0].asset,
        aimg: data[0].aAsset,
        name: data[1].underlyingSymbol || data[0].symbol,
        symbol: data[1].underlyingSymbol || data[0].symbol,
        tokenAddress: data[0].address,
        asymbol: data[1].symbol,
        atokenAddress: constants.CONTRACT_ABEP_ADDRESS[chainId][data[0].id].address,
        supplyApy: new BigNumber(data[1].supplyApy || 0),
        borrowApy: new BigNumber(data[1].borrowApy || 0),
        annSupplyApy: new BigNumber(data[1].supplyAnnexApy || 0),
        annBorrowApy: new BigNumber(data[1].borrowAnnexApy || 0),
        collateralFactor: new BigNumber(data[1].collateralFactor || 0).div(1e18),
        tokenPrice: new BigNumber(data[1].tokenPrice || 0),
        liquidity: new BigNumber(data[1].liquidity || 0),
        borrowCaps: new BigNumber(data[1].borrowCaps || 0),
        totalBorrows: new BigNumber(data[1].totalBorrows2 || 0),
        walletBalance,
        supplyBalance: new BigNumber(data[4]).div(new BigNumber(10).pow(tokenDecimal)),
        borrowBalance,
        isEnabled,
        collateral: assetsIn.includes(constants.CONTRACT_ABEP_ADDRESS[chainId][data[0].id].address),
        percentOfLimit,
      }

      // hypotheticalLiquidity
      asset.hypotheticalLiquidity = hypotheticalLiquidities[index];

      assetList.push(asset);

      const supplyBalanceUSD = asset.supplyBalance.times(asset.tokenPrice);
      const borrowBalanceUSD = asset.borrowBalance.times(asset.tokenPrice);

      totalSupplyBalance = totalSupplyBalance.plus(supplyBalanceUSD);
      totalBorrowBalance = totalBorrowBalance.plus(borrowBalanceUSD);

      if (asset.collateral) {
        totalBorrowLimit = totalBorrowLimit.plus(supplyBalanceUSD.times(asset.collateralFactor));
      }
    });

    // let xaiBalance = await methods.call(xaiContract.methods.balanceOf, [
    // 	constants.CONTRACT_XAI_VAULT_ADDRESS
    // ]);
    // xaiBalance = new BigNumber(xaiBalance).div(1e18);

    setSetting({
      assetList,
      // xaiMinted,
      totalSupplyBalance: totalSupplyBalance.toString(10),
      totalBorrowBalance: totalBorrowBalance.toString(10),
      totalBorrowLimit: totalBorrowLimit.toString(10),
    });
  };

  const handleAccountChange = async () => {
    setSetting({
      accountLoading: true,
    });
    await updateMarketInfo();
    setSetting({
      accountLoading: false,
    });
  };

  useEffect(() => {
    updateMarketInfo();
  }, [account, settings.markets]);

  useEffect(async () => {
    if (!account) {
      {
        await getMarkets();
      }

      //   // fetch total supply
    }
    // handleAccountChange();
  }, []);

  return null;
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting, getGovernanceAnnex } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
      getGovernanceAnnex,
    },
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(APIProvider);
