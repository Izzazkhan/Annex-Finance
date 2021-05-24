/*eslint-disable*/
import React, {useCallback, useEffect, useState} from 'react';
import Layout from '../layouts/MainLayout/MainLayout';
import SummaryCard from '../components/common/SummaryCard';
import DataTable from '../components/common/DataTable';
import CandleChart from '../components/common/CandleChart';
import MiniLogo from '../components/UI/MiniLogo';
import Progress from '../components/UI/Progress';
import Switch from '../components/UI/Switch';
import Select from '../components/UI/Select';
import { fillArray } from '../utils';
import close from '../assets/icons/close.svg';
import ANNBalance from '../assets/icons/ANN-Balance.svg';
import DailyEarning from '../assets/icons/Daily-Earning.svg';
import ANNRewards from '../assets/icons/ANN-Rewards.svg';
import AnnualEarning from '../assets/icons/Annual-Earning.svg';
import plusButtonIcon from '../assets/icons/plusButonIcon.svg';
import fire from '../assets/icons/fire.svg';
import SupplyWithdrawModal from '../components/common/SupplyWithdrawModal';
import BorrowRepayModal from '../components/common/BorrowRepayModal';
import BalanceModal from '../components/common/BalanceModal';
import ConfirmTransactionModal from '../components/common/ConfirmTransactionModal';
import EnableCollateralModal from '../components/common/EnableCollateralModal';
import { connectAccount, accountActionCreators } from '../core';
import {bindActionCreators} from "redux";
import BigNumber from "bignumber.js";
import {
  getComptrollerContract,
  getXaiControllerContract,
  getXaiTokenContract, getXaiVaultContract,
  methods
} from "../utilities/ContractService";
import * as constants from "../utilities/constants";
import {useActiveWeb3React} from "../hooks";
import commaNumber from "comma-number";
import {addToken, getBigNumber} from "../utilities/common";
import {promisify} from "../utilities";
import sxp from "../assets/images/coins/sxp.png";
import arrowUp from '../assets/icons/arrowUp.png';
import arrowDown from '../assets/icons/arrowDown.png';
import SVG from "react-inlinesvg";

const format = commaNumber.bindWith(',', '.');

function Dashboard({settings, setSetting, getMarketHistory}) {
  // Dashboard Logics
  const { account, chainId } = useActiveWeb3React();
  const updateMarketInfo = async () => {
    const accountAddress = account;
    if (!accountAddress || !settings.decimals || !settings.markets) {
      return;
    }
    const appContract = getComptrollerContract();
    const xaiControllerContract = getXaiControllerContract();
    const xaiContract = getXaiTokenContract();
    // xai amount in wallet
    let xaiBalance = await methods.call(xaiContract.methods.balanceOf, [
      accountAddress
    ]);
    xaiBalance = new BigNumber(xaiBalance).div(new BigNumber(10).pow(18));

    // minted xai amount
    let xaiMinted = await methods.call(appContract.methods.mintedXAIs, [
      accountAddress
    ]);
    xaiMinted = new BigNumber(xaiMinted).div(new BigNumber(10).pow(18));

    // mintable xai amount
    let { 1: mintableXai } = await methods.call(
        xaiControllerContract.methods.getMintableVAI,
        [accountAddress]
    );
    mintableXai = new BigNumber(mintableXai).div(new BigNumber(10).pow(18));

    // allowable amount
    let allowBalance = await methods.call(xaiContract.methods.allowance, [
      accountAddress,
      constants.CONTRACT_XAI_UNITROLLER_ADDRESS
    ]);
    allowBalance = new BigNumber(allowBalance).div(new BigNumber(10).pow(18));
    const xaiEnabled = allowBalance.isGreaterThanOrEqualTo(xaiMinted);

    setSetting({
      xaiBalance,
      xaiEnabled,
      xaiMinted,
      mintableXai
    });
  };

  const handleAccountChange = async () => {
    await updateMarketInfo();
    setSetting({
      accountLoading: false
    });
  };

  useEffect(() => {
    updateMarketInfo();
  }, [settings.markets, account]);

  useEffect(() => {
    handleAccountChange();
  }, [account])

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
              : totalBorrowBalance
                  .div(total)
                  .times(100)
                  .dp(0, 1)
                  .toString(10)
      );
    }
  }, [settings.totalBorrowBalance, settings.totalBorrowLimit, account]);


  // Wallet balance
  const [netAPY, setNetAPY] = useState('0');
  const [withANN, setWithANN] = useState(true);

  const addXAIApy = useCallback(
      async apy => {
        if(!account) {
          return;
        }
        const vaultContract = getXaiVaultContract();
        const { 0: staked } = await methods.call(vaultContract.methods.userInfo, [
          account
        ]);
        const amount = new BigNumber(staked).div(1e18);
        if (amount.isNaN() || amount.isZero()) {
          setNetAPY(apy.dp(2, 1).toString(10));
        } else {
          setNetAPY(
              apy
                  .plus(settings.xaiAPY)
                  .dp(2, 1)
                  .toString(10)
          );
        }
      },
      [settings, account]
  );


  const updateNetAPY = useCallback(async () => {
    let totalSum = new BigNumber(0);
    let totalSupplied = new BigNumber(0);
    let totalBorrowed = new BigNumber(0);
    const { assetList } = settings;
    assetList.forEach(asset => {
      const {
        supplyBalance,
        borrowBalance,
        tokenPrice,
        supplyApy,
        borrowApy,
        annSupplyApy,
        annBorrowApy
      } = asset;
      const supplyBalanceUSD = getBigNumber(supplyBalance).times(
          getBigNumber(tokenPrice)
      );
      const borrowBalanceUSD = getBigNumber(borrowBalance).times(
          getBigNumber(tokenPrice)
      );
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
              .plus(borrowBalanceUSD.times(borrowApyWithANN.div(100)))
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
    if (
        account &&
        settings.assetList &&
        settings.assetList.length > 0
    ) {
      updateNetAPY();
    }
  }, [account, updateNetAPY]);

  useEffect(() => {
    setSetting({
      withANN
    });
  }, [withANN]);

  const formatValue = value => {
    return `$${format(
        getBigNumber(value)
            .dp(2, 1)
            .toString(10)
    )}`;
  };

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


  const annBalance = React.useMemo(() => {
    if(settings.assetList?.length > 0) {
      const ann =  settings.assetList?.find(item => item.symbol?.toUpperCase() === "ANN")
      return ann ? ann.walletBalance : new BigNumber(0);
    }
  }, [settings.assetList])

  const updateMarketTable = async () => {
    const tempArr = [];
    settings.assetList.forEach(item => {
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
        liquidity: getBigNumber(item.liquidity)
      };
      tempArr.push(temp);
    });

    const tempSuppliedData = [];
    const tempNonSuppliableData = [];
    const tempBorrowedData = [];
    const tempNonBorrowedData = [];
    tempArr.forEach(element => {
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


  const handleToggleCollateral = r => {
    const appContract = getComptrollerContract();
    if (r && account && r.borrowBalance.isZero()) {
      if (!r.collateral) {
        setIsCollateralEnable(false);
        setIsCollateralConfirm(true);
        setCollateralToken(r);
        methods
            .send(
                appContract.methods.enterMarkets,
                [[r.atokenAddress]],
                account
            )
            .then(() => {
              setIsCollateralConfirm(false);
              setCollateralToken({})
            })
            .catch(() => {
              setIsCollateralConfirm(false);
              setCollateralToken({})
            });
      } else if (
          +r.hypotheticalLiquidity['1'] > 0 ||
          +r.hypotheticalLiquidity['2'] === 0
      ) {
        setIsCollateralEnable(true);
        setIsCollateralConfirm(true);
        setCollateralToken(r);
        methods
            .send(
                appContract.methods.exitMarket,
                [r.atokenAddress],
                account
            )
            .then(() => {
              setIsCollateralConfirm(false);
              setCollateralToken({})
            })
            .catch(() => {
              setIsCollateralConfirm(false);
              setCollateralToken({})
            });
      } else {
        // toast.error({
        //   title: `Collateral Required`,
        //   description:
        //       'You need to set collateral at least one asset for your borrowed assets. Please repay all borrowed asset or set other asset as collateral.'
        // });
      }
    } else {
      // toast.error({
      //   title: `Collateral Required`,
      //   description:
      //       'You need to set collateral at least one asset for your borrowed assets. Please repay all borrowed asset or set other asset as collateral.'
      // });
    }
  };




  const [displayWarning, setDisplayWarning] = useState(Boolean(!localStorage.getItem("betaWarning")));
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

  const handleSupplyClickRow = row => {
    console.log(row);
    setSupplyRecord(row);
    setSupplyWithdrawOpen(true);
  };


  const loadingData = React.useMemo(() => fillArray({
    Asset: (
        <div className="animate-pulse rounded-lg w-20 bg-lightGray w-full h-full flex items-center px-8 py-3"/>
    ),
    Apy: (
        <div className="animate-pulse rounded-lg w-14 bg-lightGray w-full flex items-center px-8 py-3 justify-end"/>
    ),
    Wallet: (
        <div className="animate-pulse rounded-lg w-22 bg-lightGray w-full flex items-center px-8 py-3 justify-end"/>
    ),
    Collateral: (
        <div className="animate-pulse rounded-lg w-18 bg-lightGray w-full flex items-center px-8 py-3 justify-end"/>
    ),
    Liquidity: (
        <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end"/>
    )
  }, 15), []);

  const supplyData = React.useMemo(() => {
    return suppliedAssets.map(asset => {
      const apy = withANN
          ? asset.supplyApy.plus(asset.annSupplyApy)
          : asset.supplyApy
      return {
        Asset: (
            <div
                className="h-13 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-8 py-3"
                onClick={() => handleSupplyClickRow(asset)}
            >
              <img className="w-6" src={asset.img} alt={asset.name} />
              <div className="">
                {asset.name}
              </div>
            </div>
        ),
        Apy: (
            <div className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-8 py-3 justify-end"
                 onClick={() => handleSupplyClickRow(asset)}
            >
              <img src={arrowUp} style={{ marginLeft: 40 }} alt={'up'} className={'h-3 md:h-4'}/>

              <div className="w-20 ml-2 md:ml-3">
                {new BigNumber(apy).isGreaterThan(100000000)
                        ? 'Infinity'
                        : `${(apy).dp(2, 1).toString(10)}%`}
              </div>
            </div>
        ),
        Wallet: (
            <div className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-8 py-3 justify-end"
                 onClick={() => handleSupplyClickRow(asset)}
            >
              ${format(
                  asset.supplyBalance
                      .times(asset.tokenPrice)
                      .dp(2, 1)
                      .toString(10)
              )}
            </div>
        ),
        Collateral: +asset.collateralFactor ? (
            <div className="h-13 font-bold cursor-pointer w-full flex items-center px-8 py-3 justify-end">
              <Switch
                  wrapperClassName="pt-1 pb-0"
                  value={asset.collateral}
                  onChange={() => handleToggleCollateral(asset)}
              />
            </div>
        ) : null

      }
    })
  }, [suppliedAssets, withANN]);

  const allMarketData = React.useMemo(() => {
    return nonSuppliedAssets.map(asset => {
      const apy = withANN
          ? asset.supplyApy.plus(asset.annSupplyApy)
          : asset.supplyApy
      return {
        Asset: (
            <div
                className="h-13 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-8 py-3"
                onClick={() => handleSupplyClickRow(asset)}
            >
              <img className="w-6" src={asset.img} alt={asset.name} />
              <div className="">
                {asset.name}
              </div>
            </div>
        ),
        Apy: (
            <div className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-8 py-3 justify-end"
                 onClick={() => handleSupplyClickRow(asset)}
            >
              <img src={arrowUp} style={{ marginLeft: 40 }} alt={'up'} className={'h-3 md:h-4'}/>

              <div className="w-20 ml-2 md:ml-3">
                {new BigNumber(apy).isGreaterThan(100000000)
                    ? 'Infinity'
                    : `${(apy).dp(2, 1).toString(10)}%`}
              </div>
            </div>
        ),
        Wallet: (
            <div className="h-13 font-bold cursor-pointer text-green w-full flex items-center px-8 py-3 justify-end"
                 onClick={() => handleSupplyClickRow(asset)}
            >
              {format(
                asset.walletBalance
                    .dp(2, 1)
                    .toString(10)
            )} {asset.symbol}
            </div>
        ),
        Collateral: +asset.collateralFactor ? (
            <div className="h-13 font-bold cursor-pointer w-full flex items-center px-8 py-3 justify-end">
              <Switch
                  wrapperClassName="pt-1 pb-0"
                  value={asset.collateral}
                  onChange={() => handleToggleCollateral(asset)}
              />
            </div>
        ) : null

      }
    })
  }, [nonSuppliedAssets, withANN]);


  const handleBorrowClickRow = row => {
    setBorrowRecord(row);
    setBorrowRepayOpen(true);
  };


  const borrowData = React.useMemo(() => {
    return borrowedAssets.map(asset => {
      let apy;
      if (withANN) {
        apy = getBigNumber(asset.annBorrowApy)
            .minus(asset.borrowApy)
            .isNegative()
            ? new BigNumber(0)
            : getBigNumber(asset.annBorrowApy).minus(asset.borrowApy);
      } else {
        apy = asset.borrowApy;
      }

      return {
        Asset: (
            <div
                className="h-20 font-medium flex items-center space-x-2 cursor-pointer w-full flex items-center px-8 py-3"
                onClick={() => handleBorrowClickRow(asset)}
            >
              <img className="w-6" src={asset.img} alt={asset.symbol} />
              <div className="">{asset.name}</div>
            </div>
        ),
        Apy: (
            <div className={`h-20 font-bold cursor-pointer justify-end w-full flex items-center px-8 py-3 text-${withANN ? 'green' : 'red'}`} onClick={() => handleBorrowClickRow(asset)}>
              {withANN ? (
                  <img src={arrowUp} style={{ marginLeft: 40 }} alt={'up'} className={'h-3 md:h-4'}/>
              ) : (
                  <img src={arrowDown} style={{ marginLeft: 40 }} alt={'down'} className={'h-3 md:h-4'}/>
              )}
              <div className="w-20 ml-2 md:ml-3">
                {new BigNumber(apy).isGreaterThan(100000000)
                    ? 'Infinity'
                    : `${apy.dp(2, 1).toString(10)}%`}
              </div>
            </div>
        ),
        Wallet: (
            <div className="h-20 font-bold cursor-pointer w-full px-8 py-6 text-green flex flex-col items-end justify-center" onClick={() => handleBorrowClickRow(asset)}>

              ${format(
                  asset.borrowBalance
                      .times(asset.tokenPrice)
                      .dp(2, 1)
                      .toString(10)
              )}
              <div className="text-white text-right font-normal">
                {format(asset.borrowBalance.dp(4, 1).toString(10))} {asset.asymbol}
              </div>
            </div>
        ),
        percentOfLimit: (
            <div className="h-20 font-bold cursor-pointer justify-end w-full flex items-center px-8 py-3 text-primary" onClick={() => handleBorrowClickRow(asset)}>
              {asset.percentOfLimit}%
            </div>
        ),
      }
    })
  }, [borrowedAssets, withANN]);

  const allBorrowMarketData = React.useMemo(() => {
    return nonBorrowedAssets.map(asset => {
      const apy = withANN
          ? getBigNumber(asset.annBorrowApy).minus(asset.borrowApy)
          : asset.borrowApy;

      return {
        Asset: (
            <div
                className="h-13 font-bold flex items-center space-x-2 cursor-pointer w-full flex items-center px-8 py-3"
                onClick={() => handleBorrowClickRow(asset)}
            >
              <img className="w-6" src={asset.img} alt={asset.symbol} />
              <div className="">{asset.name}</div>
            </div>
        ),
        Apy: (
            <div
                className={`h-13 font-bold cursor-pointer justify-end w-full flex items-center px-8 py-3 text-${
                    !withANN
                        ? 'red'
                        : getBigNumber(asset.annBorrowApy)
                            .minus(asset.borrowApy)
                            .isNegative()
                        ? 'red'
                        : 'green'
                }`}
                onClick={() => handleBorrowClickRow(asset)}>
              {
                !withANN
                    ? (
                        <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'}/>
                    )
                    : getBigNumber(asset.annBorrowApy)
                        .minus(asset.borrowApy)
                        .isNegative()
                    ? (
                        <img src={arrowDown} alt={'down'} className={'h-3 md:h-4'}/>
                    )
                    : (
                        <img src={arrowUp} alt={'up'} className={'h-3 md:h-4'}/>
                    )
              }
              <div className="w-20 ml-2 md:ml-3">
                {new BigNumber(apy.absoluteValue()).isGreaterThan(100000000)
                    ? 'Infinity'
                    : `${apy
                        .absoluteValue()
                        .dp(2, 1)
                        .toString(10)}%`}
              </div>
            </div>
        ),
        Wallet: (
            <div className="h-13 font-bold cursor-pointer justify-end text-green w-full flex items-center px-8 py-3" onClick={() => handleBorrowClickRow(asset)}>
              {format(asset.walletBalance.dp(2, 1).toString(10))} {asset.symbol}
            </div>
        ),
        Liquidity: (
            <div className="h-13 font-bold cursor-pointer justify-end text-primaryLight w-full flex items-center px-8 py-3" onClick={() => handleBorrowClickRow(asset)}>
              ${format(asset.liquidity.dp(2, 1).toString(10))}
            </div>
        ),
      }
    })
  }, [nonBorrowedAssets, withANN]);


  // market Overview
  const [currentAsset, setCurrentAsset] = useState(null);
  const [data, setData] = useState([]);
  const [marketInfo, setMarketInfo] = useState({});
  const [currentAPY, setCurrentAPY] = useState(0);

  const getGraphData = async (asset, type) => {
    let tempData = [];
    const res = await promisify(getMarketHistory, { asset, type });
    tempData = res?.data?.result
        .map(m => {
          return {
            createdAt: m.createdAt,
            supplyApy: +new BigNumber(m.supplyApy || 0).dp(8, 1).toString(10),
            borrowApy: +new BigNumber(m.borrowApy || 0).dp(8, 1).toString(10)
          };
        })
        .reverse();
    setData([...tempData]);
  };


  const getGovernanceData = useCallback(async () => {
    if (!currentAsset) return;
    if (settings.markets && settings.markets.length > 0) {
      const info = settings.markets.find(
          item => item?.underlyingSymbol?.toLowerCase() === currentAsset
      );
      console.log(info);
      setMarketInfo(info || {});
    }
  }, [settings.markets, currentAsset]);


  useEffect(() => {
    getGovernanceData();
  }, [getGovernanceData]);

  useEffect(() => {
    if (currentAsset) {
      getGraphData(
          constants.CONTRACT_ABEP_ADDRESS[currentAsset].address,
          process.env.REACT_APP_GRAPH_TICKER || null
      );
    }
  }, [account, currentAsset]);

  useEffect(() => {
    setCurrentAsset('usdc');
  }, []);

  useEffect(() => {
    if (settings.assetList && settings.assetList.length > 0) {
      const currentMarketInfo =
          settings.assetList.filter(s => s.id === currentAsset).length !== 0
              ? settings.assetList.filter(s => s.id === currentAsset)[0]
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
              ? supplyApyWithANN.dp(2, 1).toString(10)
              : borrowApyWithANN.dp(2, 1).toString(10)
      );
    }
  }, [currentAsset, settings.marketType, settings.assetList, settings.withANN]);

  const handleChangeAsset = value => {
    setCurrentAsset(value.id);
  };

  const options = React.useMemo(() => {
    return Object.keys(constants.CONTRACT_ABEP_ADDRESS).map(
        (key, index) => ({
          id: constants.CONTRACT_TOKEN_ADDRESS[key].id,
          name: constants.CONTRACT_TOKEN_ADDRESS[key].symbol,
          logo: <img alt={constants.CONTRACT_TOKEN_ADDRESS[key].symbol} src={constants.CONTRACT_TOKEN_ADDRESS[key].asset} style={{ width: 32, height: 32}} />
        })
    )
  }, [])

  const wrongNetwork = React.useMemo(() => {
    return (process.env.REACT_APP_ENV === 'prod' && chainId !== 56)
        || (process.env.REACT_APP_ENV === 'dev' && chainId !== 97)
  }, [chainId])


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
                  ? "Please connect your wallet first."
                  : wrongNetwork
                      ? ("Annex is only supported on Binance Smart Chain Network. Please confirm you installed Metamask and selected Binance Smart Chain Network")
                      : ("")
              }
            </p>
          </div>
      )}
      {displayWarning && (
        <div
          className="bg-primary text-white rounded-lg py-3 px-6 mx-6 lg:mx-0 text-lg
                        flex justify-between items-center space-x-4 mt-5"
        >
          <MiniLogo size="sm" />
          <p className="text-black flex-grow">
            This is Beta of <strong>aToken</strong> v1. It is provided "as is" and we don't make any
            warranties, including that Akropolis is error-free or secure. Use it at your own risk.
          </p>
          <div className="cursor-pointer" onClick={() => {
            localStorage.setItem("betaWarning", "true");
            setDisplayWarning(false)
          }}>
            <img src={close} alt="close" />
          </div>
        </div>
      )}
      <div className="text-white mt-10">
        <div className="px-6 lg:px-0 mb-17">
          <div className="text-primary text-5xl font-normal">${format(available)}</div>
          <div className="mt-1 text-lg">Available Credit</div>
          <div className="flex items-center w-full mt-4">
            <div className="opacity-70 whitespace-nowrap mr-2 text-lg">Borrow Limit</div>
            <div className="mr-4 text-lg">{borrowPercent}%</div>
            <Progress wrapperClassName="w-full" percent={Number(borrowPercent)} />
          </div>
        </div>
        <div className="bg-fadeBlack flex flex-col lg:flex-row justify-between lg:space-x-4 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-9 w-full mb-6 md:mb-0">
            <SummaryCard
              name="ANN Balance"
              title={`${format(getBigNumber(annBalance).dp(2, 1).toString(10))} ANN`}
              icon={ANNBalance}
              noData={!account || wrongNetwork}
              status="green"
            />
            <SummaryCard
                name="Daily Earning"
                title="$0"
                icon={DailyEarning}
                noData={!account || wrongNetwork}
                status="green" />
            <SummaryCard
                name="ANN Rewards"
                title="$0"
                icon={ANNRewards}
                noData={!account || wrongNetwork}
                status="red" />
            <SummaryCard
                name="Annual Earning"
                title="$0"
                icon={AnnualEarning}
                noData={!account || wrongNetwork}
                status="red" />
          </div>
          <div className="bg-black flex justify-between w-full p-6 mt-0 rounded-lg">
            <div className="">
              <div className="">
                <div className="text-lg font-bold">Supply Balance</div>
                <div className="text-lg font-bold">{!account || wrongNetwork ? '-' : formatValue(getBigNumber(settings.totalSupplyBalance)
                    .dp(2, 1)
                    .toString(10))}</div>
              </div>
              <div className="mt-12">
                <div className="text-lg">ANN Earned</div>
                <div className="text-lg">{!account || wrongNetwork ? '-' : '$0'}</div>
              </div>
            </div>
            <div className="flex flex-col justify-between items-center py-4">
              <div className="relative mb-5">
                <Progress
                  wrapperClassName="hidden md:block"
                  type="circle"
                  width={210}
                  percent={100}
                  strokeWidth={4}
                />
                <Progress
                  wrapperClassName="block md:hidden"
                  type="circle"
                  width={120}
                  percent={100}
                  strokeWidth={4}
                />
                <div className="flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center">
                  <div className="text-primary text-2xl">{!account || wrongNetwork ? '-' : '$0'}</div>
                  <div className="text-lg md:text-base whitespace-nowrap text-center mt-4 md:mt-6">
                    Estimated Daily <br /> Earnings
                  </div>
                </div>
              </div>
              <Switch value={withANN} onChange={() => setWithANN(oldVal => !oldVal)} />
              <div className="flex">
                <img src={fire} alt="" />
                <div className="ml-2 text-lg">APY with ANN</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-right">
                <div className="text-lg font-bold">Borrow Balance</div>
                <div className="text-lg font-bold">{!account || wrongNetwork ? '-' : formatValue(getBigNumber(settings.totalBorrowBalance)
                    .dp(2, 1)
                    .toString(10))}</div>
              </div>
              <div className="mt-12 text-right">
                <div className="text-lg">Net APY</div>
                <div className="text-lg">{!account || wrongNetwork ? '-' : '$0'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch mt-5">
        <div className="bg-fadeBlack w-full rounded-lg overflow-hidden self-stretch">
          {(suppliedAssets.length === 0 && nonSuppliedAssets.length === 0) && (
              <DataTable title={<div className="animate-pulse bg-lightGray rounded-lg w-16 h-6"/>} columns={supplyColumns} data={loadingData}/>
          )}
          {suppliedAssets.length > 0 && (
              <DataTable title="Supply" columns={supplyColumns} data={supplyData} />
          )}
          {nonSuppliedAssets.length > 0 && (
              <DataTable title="All Supply Markets" columns={supplyColumns} data={allMarketData} />
          )}
        </div>
        <div className="bg-fadeBlack w-full rounded-lg overflow-hidden self-stretch">
          {(borrowedAssets.length === 0 && nonBorrowedAssets.length === 0) && (
              <DataTable title={<div className="animate-pulse bg-lightGray rounded-lg w-24 h-6"/>} columns={supplyColumns} data={loadingData}/>
          )}

          {borrowedAssets.length > 0 && (
              <DataTable title="Borrow" columns={borrowedColumns} data={borrowData} />
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
      <div className="bg-fadeBlack py-4 px-6 mt-5 rounded-lg">
        <div className="text-white text-2xl ml-2">APY History</div>
        <div className="bg-black py-6 md:p-6 mt-4 rounded-xl">
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row items-center justify-between">
            <Select
                options={options}
                onChange={handleChangeAsset}
            />
            <div className="flex space-x-4text-2xl text-white">
              <div className="ml-4 font-medium">Overview</div>
              {currentAsset !== 'bnb' && (
                  <div className="ml-4">
                    {currentAsset?.toUpperCase()}
                    <img
                        src={plusButtonIcon}
                        alt="plusButtonIcon"
                        className="ml-2 inline cursor-pointer"
                        onClick={() =>
                            addToken(
                                currentAsset,
                                settings.decimals[currentAsset || 'sxp']?.token,
                                'token'
                            )
                        }
                    />
                  </div>
              )}
              <div className="ml-4 font-medium">
                {`a${
                    currentAsset === 'btcb' ? 'BTC' : currentAsset?.toUpperCase()
                }`}
                <img
                    src={plusButtonIcon}
                    alt="plusButtonIcon"
                    className="ml-2 inline cursor-pointer"
                    onClick={() =>
                        addToken(
                            currentAsset,
                            settings.decimals[currentAsset || 'sxp']?.atoken,
                            'atoken'
                        )
                    }
                />
              </div>
              <div className="ml-4 font-medium">To MetaMask</div>
            </div>
          </div>
          <div className="flex justify-between text-white mt-4">
            <div className="ml-4 font-medium md:ml-8">Historical rates</div>
            <div className="text-right">
              <div className="text-primary text-md sm:text-lg font-bold">{!account || wrongNetwork
                  ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                  : `${currentAPY}%`}</div>
              <div className="text-sm sm:text-md">Supply APY & Borrow APY</div>
              <div className="text-sm sm:text-md">APY</div>
            </div>
          </div>
          <CandleChart rawData={data} />
          <div className="flex flex-col space-y-8 lg:space-y-0 lg:flex-row lg:space-x-10 md:px-8 mt-4">
            <div className="flex flex-col text-white w-full">
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Price</div>
                <div className="font-medium text-lg">
                  {!account || wrongNetwork
                      ? (<div className="animate-pulse w-16 h-6 bg-lightGray rounded-lg inline-block"/>)
                      : marketInfo?.underlyingPrice ? `$${new BigNumber(marketInfo?.underlyingPrice || 0)
                    .div(
                        new BigNumber(10).pow(
                            18 + 18 - parseInt(settings.decimals[currentAsset || 'sxp']?.token, 10)
                        )
                    )
                    .dp(8, 1)
                    .toString(10)}` : "-"}
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Market Liquidity</div>
                <div className="font-medium text-lg">
                  {!account || wrongNetwork
                      ? (<div className="animate-pulse w-24 h-6 bg-lightGray rounded-lg inline-block"/>)
                      : marketInfo?.cash ? `${format(
                      new BigNumber(marketInfo?.cash || 0)
                          .div(
                              new BigNumber(10).pow(settings.decimals[currentAsset || 'sxp']?.token)
                          )
                          .dp(8, 1)
                          .toString(10)
                  )}` : "-"} <span className="text-red">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-10 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : marketInfo?.underlyingSymbol || ''}</span>
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className=""># of Suppliers</div>
                <div className="font-medium text-lg">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                    :  Number(marketInfo?.supplierCount) >= 0 ? format(marketInfo?.supplierCount) : "-"}</div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className=""># of Borrowers</div>
                <div className="font-medium text-lg">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-12 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : Number(marketInfo?.borrowerCount) >= 0 ? format(marketInfo?.borrowerCount) : "-"}</div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Reserves</div>
                <div className="font-medium text-lg">
                  {!account || wrongNetwork
                      ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                      : marketInfo?.totalReserves ? `${new BigNumber(marketInfo?.totalReserves || 0)
                      .div(new BigNumber(10).pow(settings.decimals[currentAsset || 'sxp']?.token))
                      .dp(8, 1)
                      .toString(10)} ` : "-"} <span className="text-red">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-10 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : marketInfo?.underlyingSymbol || ''}</span>
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Reserve Factor</div>
                <div className="font-medium text-lg">
                  {!account || wrongNetwork
                      ? (<div className="animate-pulse w-18 h-6 bg-lightGray rounded-lg inline-block"/>)
                      : marketInfo.reserveFactor ? `${new BigNumber(marketInfo.reserveFactor || 0)
                      .div(new BigNumber(10).pow(18))
                      .multipliedBy(100)
                      .dp(8, 1)
                      .toString(10)}%` : "-"}
                </div>
              </div>
            </div>
            <div className="flex flex-col text-white w-full">
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Collateral Factor</div>
                <div className="font-medium text-lg">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-32 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : marketInfo.collateralFactor ? `${new BigNumber(marketInfo.collateralFactor || 0)
                    .div(new BigNumber(10).pow(18))
                    .times(100)
                    .dp(2, 1)
                    .toString(10)}%`: '-'}
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Total Supply</div>
                <div className="font-medium text-lg">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-24 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : marketInfo.totalSupplyUsd ? `$${format(
                    new BigNumber(marketInfo.totalSupplyUsd || 0)
                        .dp(2, 1)
                        .toString(10)
                )}` : "-"}
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Total Borrow</div>
                <div className="font-medium text-lg">{!account || wrongNetwork
                    ? (<div className="animate-pulse w-16 h-6 bg-lightGray rounded-lg inline-block"/>)
                    : marketInfo.totalBorrowsUsd ? `$${format(
                    new BigNumber(marketInfo.totalBorrowsUsd || 0)
                        .dp(2, 1)
                        .toString(10)
                )}`: "-"}
                </div>
              </div>
              <div className="flex justify-between px-4 rounded-md py-2 items-center transition-all hover:bg-fadeBlack">
                <div className="">Exchange Rate</div>
                <div className="font-medium text-lg">
                  {!account || wrongNetwork
                      ? (<div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>)
                      : marketInfo.exchangeRate ? (
                          <>
                            1 <span className="text-red">{marketInfo.underlyingSymbol || '-'}</span> =  {!account || wrongNetwork
                              ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                              : new BigNumber(1)
                                .div(
                                    new BigNumber(marketInfo.exchangeRate).div(
                                        new BigNumber(10).pow(
                                            18 +
                                            +parseInt(
                                                settings.decimals[currentAsset || 'sxp']?.token,
                                                10
                                            ) -
                                            +parseInt(
                                                settings.decimals[currentAsset || 'sxp']?.atoken,
                                                10
                                            )
                                        )
                                    )
                                )
                                .toFixed(6) || "-"} <span className="text-green">{marketInfo.symbol || ''}</span>
                          </>
                      ) : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


Dashboard.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

const mapDispatchToProps = dispatch => {
  const { setSetting, getMarketHistory } = accountActionCreators;

  return bindActionCreators(
      {
        setSetting,
        getMarketHistory
      },
      dispatch
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Dashboard);
