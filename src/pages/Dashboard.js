/*eslint-disable*/
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Layout from '../layouts/MainLayout/MainLayout';
import DataTable from '../components/common/DataTable';
import CandleChart from '../components/common/CandleChart';
import MiniLogo from '../components/UI/MiniLogo';
import Switch from '../components/UI/Switch';
import Select from '../components/UI/Select';
import { fillArray } from '../utils';
import close from '../assets/icons/close.svg';
import plusButtonIcon from '../assets/icons/plusButonIcon.svg';
import SupplyWithdrawModal from '../components/common/SupplyWithdrawModal';
import BorrowRepayModal from '../components/common/BorrowRepayModal';
import BalanceModal from '../components/common/BalanceModal';
import ConfirmTransactionModal from '../components/common/ConfirmTransactionModal';
import EnableCollateralModal from '../components/common/EnableCollateralModal';
import { connectAccount, accountActionCreators } from '../core';
import { bindActionCreators } from 'redux';
import BigNumber from 'bignumber.js';
import {
  getAbepContract,
  getComptrollerContract,
  getTokenContract,
  // getXaiControllerContract,
  // getXaiTokenContract, getXaiVaultContract,
  methods,
} from '../utilities/ContractService';
import * as constants from '../utilities/constants';
import { useActiveWeb3React } from '../hooks';
import commaNumber from 'comma-number';
import { getBigNumber } from '../utilities/common';
import { promisify } from '../utilities';
import sxp from '../assets/images/coins/sxp.png';
import arrowUp from '../assets/icons/arrowUp.png';
import arrowDown from '../assets/icons/arrowDown.png';
import PendingTransaction from '../components/Dashboard/PendingTransaction.js';
import toast from '../components/UI/Toast';
import AccountOverview from '../components/Dashboard/AccountOverview.js';
import MarketHistory from '../components/Dashboard/MarketHistory.js';
import styled from 'styled-components';

const format = commaNumber.bindWith(',', '.');

const Styles = styled.div`
    th {
      padding: 0.5rem 1rem !important;
    }
  }
`;

const AVAILABLE_NETWORKS = [56, 97, 339, 25]

function Dashboard({ settings, setSetting, getMarketHistory }) {
  // debugger;
  const { account, chainId } = useActiveWeb3React();
  const updateMarketInfo = async () => {
    const accountAddress = account;
    if (!accountAddress || !settings.decimals || !settings.markets) {
      return;
    }
    try {
      // const appContract = getComptrollerContract();
      // const xaiControllerContract = getXaiControllerContract();
      // const xaiContract = getXaiTokenContract();
      // xai amount in wallet
      // let xaiBalance = await methods.call(xaiContract.methods.balanceOf, [
      //   accountAddress
      // ]);

      // xaiBalance = new BigNumber(xaiBalance).div(new BigNumber(10).pow(18));

      // minted xai amount
      // let xaiMinted = await methods.call(appContract.methods.mintedXAIs, [
      //   accountAddress
      // ]);

      // xaiMinted = new BigNumber(xaiMinted).div(new BigNumber(10).pow(18));

      // mintable xai amount
      // let { 1: mintableXai } = await methods.call(
      //   xaiControllerContract.methods.getMintableXAI,
      //   [accountAddress]
      // );
      // mintableXai = new BigNumber(mintableXai).div(new BigNumber(10).pow(18));
      // allowable amount
      // let allowBalance = await methods.call(xaiContract.methods.allowance, [
      //   accountAddress,
      //   constants.CONTRACT_XAI_UNITROLLER_ADDRESS
      // ]);
      // allowBalance = new BigNumber(allowBalance).div(new BigNumber(10).pow(18));
      // const xaiEnabled = allowBalance.isGreaterThanOrEqualTo(xaiMinted);

      setSetting({
        // xaiBalance,
        // xaiEnabled,
        // xaiMinted,
        // mintableXai
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleAccountChange = async () => {
    await updateMarketInfo();
    setSetting({
      accountLoading: false,
    });
  };

  useEffect(() => {
    updateMarketInfo();
  }, [settings.markets, account]);

  useEffect(() => {
    handleAccountChange();
  }, [account]);

  // Borrow Limits
  const [available, setAvailable] = useState('0');
  const [borrowPercent, setBorrowPercent] = useState('0');

  useEffect(() => {
    if (account) {
      const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
      const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
      const total = BigNumber.maximum(totalBorrowLimit, 0);
      setAvailable(total.dp(2, 1).toString(10));
      setBorrowPercent(
        total.isZero() || total.isNaN()
          ? 0
          : totalBorrowBalance.div(total).times(100).dp(0, 1).toString(10),
      );
    }
  }, [settings.totalBorrowBalance, settings.totalBorrowLimit, account]);

  // Rewards
  const [earnedBalance, setEarnedBalance] = useState('0.0000');
  // const [xaiMint, setXaiMint] = useState('0.0000');

  /* ********************************** */
  // ANN wallet balance
  // will be removed after ANN listed to market
  const [annBalance, setAnnBalance] = useState('0.0000');
  ///////////////////////////

  const getVoteInfo = async () => {
    const myAddress = account;
    if (!myAddress) return;
    const appContract = getComptrollerContract(chainId);
    // const xaiContract = getXaiControllerContract();
    const annexInitialIndex = await methods.call(appContract.methods.annexInitialIndex, []);
    let annexEarned = new BigNumber(0);
    /* **************************************** */
    // will be removed after ANN listed to market
    let annexBalance = new BigNumber(0);
    ///////////////////////////////////
    // console.log('===== ', constants.CONTRACT_ABEP_ADDRESS)
    const promiseAssetCall = settings.assetList.map((asset) => {
      const aBepContract = getAbepContract(asset.id, chainId);

      return Promise.all([
        methods.call(appContract.methods.annexSupplyState, [asset.atokenAddress]),
        methods.call(appContract.methods.annexSupplierIndex, [asset.atokenAddress, myAddress]),
        methods.call(aBepContract.methods.balanceOf, [myAddress]),
        methods.call(appContract.methods.annexBorrowState, [asset.atokenAddress]),
        methods.call(appContract.methods.annexBorrowerIndex, [asset.atokenAddress, myAddress]),
        methods.call(aBepContract.methods.borrowBalanceStored, [myAddress]),
        methods.call(aBepContract.methods.borrowIndex, []),
      ]);
    });
    const assetValues = await Promise.all(promiseAssetCall);
    assetValues.forEach(
      ([
        supplyState,
        supplierIndex,
        supplierTokens,
        borrowState,
        borrowerIndex,
        borrowBalanceStored,
        borrowIndex,
      ]) => {
        const supplyIndex = supplyState.index;
        if (+supplierIndex === 0 && +supplyIndex > 0) {
          supplierIndex = annexInitialIndex;
        }
        let deltaIndex = new BigNumber(supplyIndex).minus(supplierIndex);
        const supplierDelta = new BigNumber(supplierTokens)
          .multipliedBy(deltaIndex)
          .dividedBy(1e36);

        annexEarned = annexEarned.plus(supplierDelta);
        let initBorrowIndex = borrowState.index;
        if (+borrowerIndex > 0) {
          deltaIndex = new BigNumber(initBorrowIndex).minus(borrowerIndex);
          const borrowerAmount = new BigNumber(borrowBalanceStored)
            .multipliedBy(1e18)
            .dividedBy(borrowIndex);
          const borrowerDelta = borrowerAmount.times(deltaIndex).dividedBy(1e36);
          annexEarned = annexEarned.plus(borrowerDelta);
        }
      },
    );

    const annexAccrued = await methods.call(appContract.methods.annexAccrued, [myAddress]);
    annexEarned = annexEarned.plus(annexAccrued).dividedBy(1e18).dp(4, 1).toString(10);
    /* **************************************** */
    // will be removed after ANN listed to market
    const ann = Object.values(constants.CONTRACT_ABEP_ADDRESS[chainId]).find((t) => t.id === 'ann');
    const annContract = getTokenContract(ann.id, chainId);
    const annWalletBalance = await methods.call(annContract.methods.balanceOf, [myAddress]);
    annexBalance = new BigNumber(annWalletBalance).div(1e18);
    /////////////////////////////////

    // const annexXAIState = await methods.call(
    //   xaiContract.methods.annexXAIState,
    //   []
    // );
    // const xaiMintIndex = annexXAIState.index;
    // let xaiMinterIndex = await methods.call(
    //   xaiContract.methods.annexXAIMinterIndex,
    //   [myAddress]
    // );
    // if (+xaiMinterIndex === 0 && +xaiMintIndex > 0) {
    //   xaiMinterIndex = annexInitialIndex;
    // }
    // const deltaIndex = new BigNumber(xaiMintIndex).minus(
    //   new BigNumber(xaiMinterIndex)
    // );
    // const xaiMinterAmount = await methods.call(appContract.methods.mintedXAIs, [
    //   myAddress
    // ]);
    // const xaiMinterDelta = new BigNumber(xaiMinterAmount)
    //   .times(deltaIndex)
    //   .div(1e54)
    //   .dp(4, 1)
    //   .toString(10);
    setEarnedBalance(annexEarned && annexEarned !== '0' ? `${annexEarned}` : '0.0000');
    setAnnBalance(annexBalance && annexBalance !== '0' ? annexBalance : '0.0000');
    // setXaiMint(
    //   xaiMinterDelta && xaiMinterDelta !== '0'
    //     ? `${xaiMinterDelta}`
    //     : '0.0000'
    // );
  };

  useEffect(() => {
    getVoteInfo();
  }, [settings.markets, account]);

  // Wallet balance
  const [netAPY, setNetAPY] = useState('0');
  const [withANN, setWithANN] = useState(true);

  const estDailyEarning = useMemo(() => {
    if (!netAPY || !settings.totalSupplyBalance) return '0';
    const apy = new BigNumber(netAPY);
    const res = apy.times(settings.totalSupplyBalance).div(100).div(365);

    return res.dp(2, 1).toString(10);
  }, [netAPY, settings.totalSupplyBalance]);

  const annualEarning = useMemo(() => {
    if (!netAPY || !settings.totalSupplyBalance) return '0';
    const apy = new BigNumber(netAPY);
    const res = apy.times(settings.totalSupplyBalance).div(100);

    return res.dp(2, 1).toString(10);
  }, [netAPY, settings.totalSupplyBalance]);

  const addXAIApy = useCallback(
    async (apy) => {
      if (!account) {
        return;
      }
      setNetAPY(apy.dp(2, 1).toString(10));
    },
    [settings, account],
  );

  const updateNetAPY = useCallback(async () => {
    let totalSum = new BigNumber(0);
    let totalSupplied = new BigNumber(0);
    let totalBorrowed = new BigNumber(0);
    const { assetList } = settings;
    assetList.forEach((asset) => {
      const {
        supplyBalance,
        borrowBalance,
        tokenPrice,
        supplyApy,
        borrowApy,
        annSupplyApy,
        annBorrowApy,
      } = asset;
      const supplyBalanceUSD = getBigNumber(supplyBalance).times(getBigNumber(tokenPrice));
      const borrowBalanceUSD = getBigNumber(borrowBalance).times(getBigNumber(tokenPrice));
      totalSupplied = totalSupplied.plus(supplyBalanceUSD);
      totalBorrowed = totalSupplied.plus(borrowBalanceUSD);

      const supplyApyWithANN = withANN
        ? getBigNumber(supplyApy).plus(getBigNumber(annSupplyApy))
        : getBigNumber(supplyApy);
      const borrowApyWithANN = withANN
        ? getBigNumber(annBorrowApy).minus(getBigNumber(borrowApy))
        : getBigNumber(borrowApy).times(-1);

      // const supplyApyWithANN = getBigNumber(supplyApy);
      // const borrowApyWithANN = getBigNumber(borrowApy).times(-1);
      totalSum = totalSum.plus(
        supplyBalanceUSD
          .times(supplyApyWithANN.div(100))
          .plus(borrowBalanceUSD.times(borrowApyWithANN.div(100))),
      );
    });

    let apy;

    if (totalSum.isZero() || totalSum.isNaN()) {
      apy = new BigNumber(0);
    } else if (totalSum.isGreaterThan(0)) {
      apy = totalSupplied.isZero() ? 0 : totalSum.div(totalSupplied).times(100);
    } else {
      apy = totalBorrowed.isZero() ? 0 : totalSum.div(totalBorrowed).times(100);
    }
    addXAIApy(apy);
  }, [settings.assetList, withANN]);

  useEffect(() => {
    if (account && settings.assetList && settings.assetList.length > 0) {
      updateNetAPY();
    }
  }, [account, updateNetAPY]);

  useEffect(() => {
    setSetting({
      withANN,
    });
  }, [withANN]);
  // Markets
  const [suppliedAssets, setSuppliedAssets] = useState([]);
  const [nonSuppliedAssets, setNonSuppliedAssets] = useState([]);
  const [borrowedAssets, setBorrowedAssets] = useState([]);
  const [nonBorrowedAssets, setNonBorrowedAssets] = useState([]);

  const [isOpenCollateralConfirm, setIsCollateralConfirm] = useState(false);
  const [supplyRecord, setSupplyRecord] = useState({});
  const [isCollateralEnable, setIsCollateralEnable] = useState(true);
  const [collateralToken, setCollateralToken] = useState({});

  const [borrowRecord, setBorrowRecord] = useState({});

  // will be enabled after ANN added to market
  // const annBalance = React.useMemo(() => {
  //   if (settings.assetList?.length > 0) {
  //     const ann = settings.assetList?.find((item) => item.symbol?.toUpperCase() === 'ANN');
  //     return ann ? ann.walletBalance : new BigNumber(0);
  //   }
  // }, [settings.assetList]);

  const updateMarketTable = async () => {
    const tempArr = [];
    settings.assetList.forEach((item) => {
      const temp = {
        ...item,
        supplyApy: getBigNumber(item.supplyApy),
        borrowApy: getBigNumber(item.borrowApy),
        walletBalance: getBigNumber(item.walletBalance),
        supplyBalance: getBigNumber(item.supplyBalance),
        aTokenBalance: getBigNumber(item.aTokenBalance),
        borrowBalance: getBigNumber(item.borrowBalance),
        collateralFactor: getBigNumber(item.collateralFactor),
        tokenPrice: getBigNumber(item.tokenPrice),
        liquidity: getBigNumber(item.liquidity),
      };
      tempArr.push(temp);
    });

    const tempSuppliedData = [];
    const tempNonSuppliableData = [];
    const tempBorrowedData = [];
    const tempNonBorrowedData = [];
    tempArr.forEach((element) => {
      if (element.supplyBalance.isZero()) {
        tempNonSuppliableData.push(element);
      } else {
        tempSuppliedData.push(element);
      }

      if (element.borrowBalance.isZero()) {
        tempNonBorrowedData.push(element);
      } else {
        tempBorrowedData.push(element);
      }
    });
    setSuppliedAssets([...tempSuppliedData]);
    setNonSuppliedAssets([...tempNonSuppliableData]);
    setBorrowedAssets([...tempBorrowedData]);
    setNonBorrowedAssets([...tempNonBorrowedData]);
  };

  useEffect(() => {
    if (settings.assetList && settings.assetList.length > 0) {
      updateMarketTable();
    }
  }, [settings.assetList]);

  const handleToggleCollateral = (r) => {
    const appContract = getComptrollerContract(chainId);
    if (r && account && r.borrowBalance.isZero()) {
      if (!r.collateral) {
        setIsCollateralEnable(false);
        setIsCollateralConfirm(true);
        setCollateralToken(r);
        methods
          .send(appContract.methods.enterMarkets, [[r.atokenAddress]], account)
          .then(() => {
            setIsCollateralConfirm(false);
            setCollateralToken({});
          })
          .catch(() => {
            setIsCollateralConfirm(false);
            setCollateralToken({});
          });
      } else if (+r.hypotheticalLiquidity['1'] > 0 || +r.hypotheticalLiquidity['2'] === 0) {
        setIsCollateralEnable(true);
        setIsCollateralConfirm(true);
        setCollateralToken(r);
        methods
          .send(appContract.methods.exitMarket, [r.atokenAddress], account)
          .then(() => {
            setIsCollateralConfirm(false);
            setCollateralToken({});
          })
          .catch(() => {
            setIsCollateralConfirm(false);
            setCollateralToken({});
          });
      } else {
        toast.error({
          title: `Collateral Required`,
          description:
            'You need to set collateral at least one asset for your borrowed assets. Please repay all borrowed asset or set other asset as collateral.',
        });
      }
    } else {
      toast.error({
        title: `Collateral Required`,
        description:
          'You need to set collateral at least one asset for your borrowed assets. Please repay all borrowed asset or set other asset as collateral.',
      });
    }
  };

  const [displayWarning, setDisplayWarning] = useState(
    Boolean(!localStorage.getItem('betaWarning')),
  );
  const [supplyWithdrawOpen, setSupplyWithdrawOpen] = useState(false);
  const [borrowRepayOpen, setBorrowRepayOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [confirmTransactionOpen, setConfirmTransactionOpen] = useState(false);
  const [enableCollateralOpen, setEnableCollateralOpen] = useState(false);

  const baseColumns = [
    {
      Header: 'Name',
      columns: [
        {
          Header: 'Asset',
          accessor: 'Asset',
        },
        {
          Header: 'APY',
          accessor: 'Apy',
        },
        {
          Header: 'Wallet',
          accessor: 'Wallet',
        },
      ],
    },
  ];

  const supplyColumns = React.useMemo(
    () => [
      ...baseColumns,
      {
        Header: 'Collateral',
        accessor: 'Collateral',
      },
    ],
    [],
  );

  const borrowedColumns = React.useMemo(
    () => [
      ...baseColumns,
      {
        Header: '% Of Limit',
        accessor: 'percentOfLimit',
      },
    ],
    [],
  );
  const borrowColumns = React.useMemo(
    () => [
      ...baseColumns,
      {
        Header: 'Liquidity',
        accessor: 'Liquidity',
      },
    ],
    [],
  );

  const handleSupplyClickRow = (row) => {
    setSupplyRecord(row);
    setSupplyWithdrawOpen(true);
  };

  const loadingData = React.useMemo(
    () =>
      fillArray(
        {
          Asset: (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-20 bg-lightGray w-full flex items-center px-8 py-3" />
            </div>
          ),
          Apy: (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-14 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ),
          Wallet: (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-22 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ),
          Collateral: (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-18 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ),
          Liquidity: (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ),
        },
        8,
      ),
    [],
  );

  const supplyData = React.useMemo(() => {
    return suppliedAssets.map((asset) => {
      const apy = withANN ? asset.supplyApy.plus(asset.annSupplyApy) : asset.supplyApy;
      return {
        Asset: (
          <div
            className="h-20 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-4 py-3"
            onClick={() => handleSupplyClickRow(asset)}
          >
            <img className="w-6" src={asset.img} alt={asset.name} />
            <div className="">{asset.name}</div>
          </div>
        ),
        Apy: (
          <div
            className="h-20 font-bold cursor-pointer text-green w-full flex items-center px-4 py-3 justify-end"
            onClick={() => handleSupplyClickRow(asset)}
          >
            <img src={arrowUp} alt={'up'} className={'h-3 md:h-4'} />

            <div className="w-20 ml-2">
              {new BigNumber(apy).isGreaterThan(100000000)
                ? 'Infinity'
                : `${apy.dp(2, 1).toString(10)}%`}
            </div>
          </div>
        ),
        Wallet: (
          <div
            className="h-20 font-bold cursor-pointer text-green w-full
                  px-4 py-6 text-green flex flex-col items-end justify-center"
            onClick={() => handleSupplyClickRow(asset)}
          >
            ${format(asset.supplyBalance.times(asset.tokenPrice).dp(2, 1).toString(10))}
            <div className="text-white text-right font-normal">
              {format(asset.supplyBalance.dp(5, 1).toString(10))} {asset.symbol}
            </div>
          </div>
        ),
        Collateral: +asset.collateralFactor ? (
          <div className="h-20 font-bold cursor-pointer w-full flex items-center px-4 py-3 justify-end">
            <Switch
              wrapperClassName="pt-1 pb-0"
              value={asset.collateral}
              onChange={() => handleToggleCollateral(asset)}
            />
          </div>
        ) : null,
      };
    });
  }, [suppliedAssets, withANN]);

  const allMarketData = React.useMemo(() => {
    return nonSuppliedAssets.map((asset) => {
      const apy = withANN ? asset.supplyApy.plus(asset.annSupplyApy) : asset.supplyApy;
      return {
        Asset: (
          <div
            className="h-13 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-4 py-3"
            onClick={() => handleSupplyClickRow(asset)}
          >
            <img className="w-6" src={asset.img} alt={asset.name} />
            <div className="">{asset.name}</div>
          </div>
        ),
        Apy: (
          <div
            className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-4 py-3 justify-end"
            onClick={() => handleSupplyClickRow(asset)}
          >
            <img src={arrowUp} alt={'up'} className={'h-3 md:h-4'} />

            <div className="w-20 ml-2">
              {new BigNumber(apy).isGreaterThan(100000000)
                ? 'Infinity'
                : `${apy.dp(2, 1).toString(10)}%`}
            </div>
          </div>
        ),
        Wallet: (
          <div
            className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-4 py-3 justify-end"
            onClick={() => handleSupplyClickRow(asset)}
          >
            {format(asset.walletBalance.dp(2, 1).toString(10))} {asset.symbol}
          </div>
        ),
        Collateral: +asset.collateralFactor ? (
          <div className="h-13 font-bold cursor-pointer w-full flex items-center px-4 py-3 justify-end">
            <Switch
              wrapperClassName="pt-1 pb-0"
              value={asset.collateral}
              onChange={() => handleToggleCollateral(asset)}
            />
          </div>
        ) : null,
      };
    });
  }, [nonSuppliedAssets, withANN]);

  const handleBorrowClickRow = (row) => {
    setBorrowRecord(row);
    setBorrowRepayOpen(true);
  };

  const borrowData = React.useMemo(() => {
    return borrowedAssets.map((asset) => {
      const apy = withANN
        ? getBigNumber(asset.annBorrowApy).minus(asset.borrowApy)
        : asset.borrowApy;

      return {
        Asset: (
          <div
            className="h-20 font-medium flex items-center space-x-2 cursor-pointer w-full flex items-center px-4 py-3"
            onClick={() => handleBorrowClickRow(asset)}
          >
            <img className="w-6" src={asset.img} alt={asset.symbol} />
            <div className="">{asset.name}</div>
          </div>
        ),
        Apy: (
          <div
            className={`h-20 font-bold cursor-pointer justify-end w-full flex items-center px-4 py-3 text-${!withANN
                ? 'red'
                : getBigNumber(asset.annBorrowApy).minus(asset.borrowApy).isNegative()
                  ? 'red'
                  : 'green'
              }`}
            onClick={() => handleBorrowClickRow(asset)}
          >
            {!withANN ? (
              <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'} />
            ) : getBigNumber(asset.annBorrowApy).minus(asset.borrowApy).isNegative() ? (
              <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'} />
            ) : (
              <img src={arrowUp} alt={'up'} className={'h-3 md:h-4'} />
            )}
            <div className="w-20 ml-2">
              {new BigNumber(apy).isGreaterThan(100000000)
                ? 'Infinity'
                : `${apy.absoluteValue().dp(2, 1).toString(10)}%`}
            </div>
          </div>
        ),
        Wallet: (
          <div
            className="h-20 font-bold cursor-pointer w-full px-4 py-6 text-green flex flex-col items-end justify-center"
            onClick={() => handleBorrowClickRow(asset)}
          >
            ${format(asset.borrowBalance.times(asset.tokenPrice).dp(2, 1).toString(10))}
            <div className="text-white text-right font-normal">
              {format(asset.borrowBalance.dp(4, 1).toString(10))} {asset.symbol}
            </div>
          </div>
        ),
        percentOfLimit: (
          <div
            className="h-20 font-bold cursor-pointer justify-end w-full flex items-center px-4 py-3 text-primary"
            onClick={() => handleBorrowClickRow(asset)}
          >
            {asset.percentOfLimit}%
          </div>
        ),
      };
    });
  }, [borrowedAssets, withANN]);

  const allBorrowMarketData = React.useMemo(() => {
    return nonBorrowedAssets.map((asset) => {
      const apy = withANN
        ? getBigNumber(asset.annBorrowApy).minus(asset.borrowApy)
        : asset.borrowApy;

      return {
        Asset: (
          <div
            className="h-13 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-4 py-3"
            onClick={() => handleBorrowClickRow(asset)}
          >
            <img className="w-6" src={asset.img} alt={asset.symbol} />
            <div className="">{asset.name}</div>
          </div>
        ),
        Apy: (
          <div
            className={`h-13 font-bold cursor-pointer justify-end w-full flex items-center px-4 py-3 text-${!withANN
                ? 'red'
                : getBigNumber(asset.annBorrowApy).minus(asset.borrowApy).isNegative()
                  ? 'red'
                  : 'green'
              }`}
            onClick={() => handleBorrowClickRow(asset)}
          >
            {!withANN ? (
              <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'} />
            ) : getBigNumber(asset.annBorrowApy).minus(asset.borrowApy).isNegative() ? (
              <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'} />
            ) : (
              <img src={arrowUp} alt={'up'} className={'h-3 md:h-4'} />
            )}
            <div className="w-20 ml-2">
              {new BigNumber(apy.absoluteValue()).isGreaterThan(100000000)
                ? 'Infinity'
                : `${apy.absoluteValue().dp(2, 1).toString(10)}%`}
            </div>
          </div>
        ),
        Wallet: (
          <div
            className="h-13 font-bold cursor-pointer justify-end text-green w-full flex items-center px-4 py-3"
            onClick={() => handleBorrowClickRow(asset)}
          >
            {format(asset.walletBalance.dp(2, 1).toString(10))} {asset.symbol}
          </div>
        ),
        Liquidity: (
          <div
            className="h-13 font-bold cursor-pointer justify-end text-primaryLight w-full flex items-center px-4 py-3"
            onClick={() => handleBorrowClickRow(asset)}
          >
            ${format(asset.liquidity.dp(2, 1).toString(10))}
          </div>
        ),
      };
    });
  }, [nonBorrowedAssets, withANN]);

  // market Overview
  const [currentAsset, setCurrentAsset] = useState(null);
  const [data, setData] = useState([]);
  const [marketInfo, setMarketInfo] = useState({});
  const [currentAPY, setCurrentAPY] = useState(0);

  const getGraphData = async (asset, type, limit) => {
    let tempData = [];
    const res = await promisify(getMarketHistory, { asset, type, limit });
    tempData = res?.data?.result
      .map((m) => {
        return {
          blockNumber: m?.blockNumber,
          createdAt: m.createdAt,
          supplyApy: +new BigNumber(m.supplyApy || 0).dp(8, 1).toFixed(4),
          borrowApy: +new BigNumber(m.borrowApy || 0).dp(8, 1).toFixed(4),
          borrowAnnexApy: +new BigNumber(m.borrowAnnexApy || 0).dp(8, 1).toFixed(4),
          supplyAnnexApy: +new BigNumber(m.supplyAnnexApy || 0).dp(8, 1).toFixed(4),
          totalBorrow: +m.totalBorrow,
          totalSupply: +m.totalSupply,
        };
      })
      .reverse();
    setData([...tempData]);
  };

  const getGovernanceData = useCallback(async () => {
    if (!currentAsset) return;
    if (settings.markets && settings.markets.length > 0) {
      const info = settings.markets.find(
        (item) => item?.underlyingSymbol?.toLowerCase() === currentAsset,
      );
      setMarketInfo(info || {});
    }
  }, [settings.markets, currentAsset]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    getGovernanceData();
  }, [getGovernanceData]);

  useEffect(() => {
    if (currentAsset && constants.CONTRACT_ABEP_ADDRESS[chainId][currentAsset]) {
      getGraphData(
        constants.CONTRACT_ABEP_ADDRESS[chainId][currentAsset].address,
        process.env.REACT_APP_GRAPH_TICKER || null,
        60,
      );
    }
  }, [account, currentAsset]);

  useEffect(() => {
    setCurrentAsset('usdt');
  }, []);

  useEffect(() => {
    if (settings.assetList && settings.assetList.length > 0) {
      const currentMarketInfo =
        settings.assetList.filter((s) => s.id === currentAsset).length !== 0
          ? settings.assetList.filter((s) => s.id === currentAsset)[0]
          : {};
      const supplyApy = getBigNumber(currentMarketInfo.supplyApy);
      const borrowApy = getBigNumber(currentMarketInfo.borrowApy);
      const supplyApyWithANN = settings.withANN
        ? supplyApy.plus(currentMarketInfo.annSupplyApy)
        : supplyApy;
      const borrowApyWithANN = settings.withANN
        ? getBigNumber(currentMarketInfo.annBorrowApy).minus(borrowApy)
        : borrowApy;
      setCurrentAPY(
        (settings.marketType || 'supply') === 'supply'
          ? supplyApyWithANN.isGreaterThan(100000000)
            ? 'Infinity'
            : supplyApyWithANN.dp(2, 1).toString(10)
          : borrowApyWithANN.isGreaterThan(100000000)
          ? 'Infinity'
          : borrowApyWithANN.dp(2, 1).toString(10),
      );
    }
  }, [currentAsset, settings.marketType, settings.assetList, settings.withANN]);

  const handleChangeAsset = (value) => {
    setCurrentAsset(value.id);
  };

  const options = React.useMemo(() => {
    return Object.keys(constants.CONTRACT_ABEP_ADDRESS[chainId]).map((key, index) => ({
      id: constants.CONTRACT_TOKEN_ADDRESS[chainId][key].id,
      name: constants.CONTRACT_TOKEN_ADDRESS[chainId][key].symbol,
      logo: constants.CONTRACT_TOKEN_ADDRESS[chainId][key].asset,
    }));
  }, [chainId]);

  const wrongNetwork = React.useMemo(() => {
    return !AVAILABLE_NETWORKS.includes(chainId)
  }, [chainId]);

  return (
    <Layout>
      <SupplyWithdrawModal
        open={supplyWithdrawOpen}
        record={supplyRecord}
        onSetOpen={() => setSupplyWithdrawOpen(true)}
        onCloseModal={() => setSupplyWithdrawOpen(false)}
      />
      <BorrowRepayModal
        open={borrowRepayOpen}
        record={borrowRecord}
        onSetOpen={() => setBorrowRepayOpen(true)}
        onCloseModal={() => setBorrowRepayOpen(false)}
      />
      <BalanceModal
        open={balanceOpen}
        onSetOpen={() => setBalanceOpen(true)}
        onCloseModal={() => setBalanceOpen(false)}
      />
      <ConfirmTransactionModal
        open={isOpenCollateralConfirm}
        onSetOpen={() => setIsCollateralConfirm(true)}
        onCloseModal={() => setIsCollateralConfirm(false)}
        isCollateralEnable={isCollateralEnable}
        collateralToken={collateralToken}
      />
      <EnableCollateralModal
        open={enableCollateralOpen}
        onSetOpen={() => setEnableCollateralOpen(true)}
        onCloseModal={() => setEnableCollateralOpen(false)}
      />
      {(!account || (account && wrongNetwork)) && (
        <div
          className="bg-primary text-white rounded-lg py-4 px-6 mx-6 lg:mx-0 text-lg
                        flex justify-between items-center space-x-4 mt-5"
        >
          <p className="text-black flex-grow">
            {!account
              ? 'Please connect your wallet first.'
              : wrongNetwork
              ? 'Annex is only supported on Binance Smart Chain Network. Please confirm you installed Metamask and selected Binance Smart Chain Network'
              : ''}
          </p>
        </div>
      )}

      <AccountOverview
        available={available}
        borrowPercent={borrowPercent}
        balance={annBalance}
        dailyEarning={estDailyEarning}
        earnedBalance={earnedBalance}
        annualEarning={annualEarning}
        withANN={withANN}
        setWithANN={setWithANN}
        netAPY={netAPY}
        settings={settings}
      />
      <Styles>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 items-stretch mt-5">
          <div className="bg-fadeBlack w-full rounded-lg overflow-hidden self-stretch">
            {suppliedAssets.length === 0 && nonSuppliedAssets.length === 0 && (
              <DataTable
                title={<div className="animate-pulse bg-lightGray rounded-lg w-16 h-6" />}
                columns={supplyColumns}
                data={loadingData}
              />
            )}
            {suppliedAssets.length > 0 && (
              <DataTable title="Supply" columns={supplyColumns} data={supplyData} />
            )}

            {settings.pendingInfo &&
              settings.pendingInfo.status &&
              ['Supply', 'Withdraw'].includes(settings.pendingInfo.type) && <PendingTransaction />}
            {nonSuppliedAssets.length > 0 && (
              <DataTable title="All Supply Markets" columns={supplyColumns} data={allMarketData} />
            )}
          </div>
          <div className="bg-fadeBlack w-full rounded-lg overflow-hidden self-stretch">
            {borrowedAssets.length === 0 && nonBorrowedAssets.length === 0 && (
              <DataTable
                title={<div className="animate-pulse bg-lightGray rounded-lg w-24 h-6" />}
                columns={supplyColumns}
                data={loadingData}
              />
            )}

            {borrowedAssets.length > 0 && (
              <DataTable title="Borrow" columns={borrowedColumns} data={borrowData} />
            )}
            {settings.pendingInfo &&
              settings.pendingInfo.status &&
              ['Borrow', 'Repay Borrow'].includes(settings.pendingInfo.type) && (
                <PendingTransaction />
              )}
            {nonBorrowedAssets.length > 0 && (
              <DataTable
                title="All Borrow Markets"
                columns={borrowColumns}
                data={allBorrowMarketData}
              />
            )}
          </div>
        </div>
      </Styles>
      <MarketHistory
        options={options}
        handleChangeAsset={handleChangeAsset}
        marketInfo={marketInfo}
        settings={settings}
        withANN={withANN}
        currentAsset={currentAsset}
        currentAPY={currentAPY}
        data={data}
      />

      {displayWarning && (
        <div
          className="bg-primary text-white rounded-lg py-3 px-3 md:px-6 mx-3 md:mx-6 lg:mx-0 text-lg
                flex justify-between items-center space-x-4 mt-5"
        >
          <MiniLogo size="sm" />
          <p className="text-black flex-grow flex-1">
            This is Beta of <strong>aToken</strong> v1. It is provided "as is" and we don't make any
            warranties, including that Annex is error-free or secure. Use it at your own risk.
          </p>
          <div
            className="cursor-pointer"
            onClick={() => {
              localStorage.setItem('betaWarning', 'true');
              setDisplayWarning(false);
            }}
          >
            <img src={close} alt="close" />
          </div>
        </div>
      )}
    </Layout>
  );
}

Dashboard.defaultProps = {
  settings: {},
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting, getMarketHistory } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
      getMarketHistory,
    },
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Dashboard);
