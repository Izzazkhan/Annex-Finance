import React, {useMemo, useState} from 'react';
import styled from "styled-components";
import Select from "../UI/Select";
import plusButtonIcon from "../../assets/icons/plusButonIcon.svg";
import {addToken, getBigNumber} from "../../utilities/common";
import CandleChart from "../common/CandleChart";
import BigNumber from "bignumber.js";
import {useActiveWeb3React} from "../../hooks";
import commaNumber from "comma-number";
import Annex from '../../assets/icons/logoMini.svg';
import {nFormatter} from "../../utils/data";
import MarketHistoryChart from "./MarketHistoryChart";

const format = commaNumber.bindWith(',', '.');

const TypeButton = styled.button`
  position: relative;
  padding: 16px 24px;
  color: #ffab2d;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  border: none;
  &::before {
    content: "";
    width: 100%;
    height: 3px;
    position: absolute;
    background-color: #FFAB2D;
    bottom: 0;
    left: 0;
    right: 0;
    transform: ${({ active }) => active ? "scaleX(1)" : "scaleX(0)"};
    transform-origin: ${({ active, reverse }) => reverse ? "left center" : "right center"};
    transition: transform ease 0.3s;
  }
  &:hover {
    background-color: rgba(255, 171, 45, 0.05);
  }
  &:hover,
  &:focus,
  &:active {
    outline: none;
    box-shadow: none;
  }
  @media (max-width: 767px) {
    flex-grow: 1;
  }
`

const TYPES = {
    Supply: "SUPPLY",
    Borrow: "BORROW"
}

const MarketHistory = ({
    handleChangeAsset,
    currentAsset,
    settings,
    currentAPY,
    withANN,
    marketInfo,
    options,
    data
}) => {
    const [activeType, setActiveType] = useState(TYPES.Supply)
    const { account, chainId } = useActiveWeb3React();
    const [selectedToken, setSelectedToken] = useState(options[0]);

    const selectedAsset = useMemo(() => {
        return settings.assetList?.find(item => {
            return item?.name?.toLowerCase() === selectedToken?.name?.toLowerCase();
        })
    }, [selectedToken])

    const apy = useMemo(() => {
        if(!selectedAsset?.supplyApy || !(selectedAsset?.supplyApy instanceof BigNumber) || !selectedAsset?.annSupplyApy) return new BigNumber(0);
        return withANN
            ? selectedAsset?.supplyApy?.plus(selectedAsset?.annSupplyApy)
            : selectedAsset?.supplyApy
    }, [selectedAsset, withANN])

    const wrongNetwork = useMemo(() => {
        return (process.env.REACT_APP_ENV === 'prod' && chainId !== 56)
            || (process.env.REACT_APP_ENV === 'dev' && chainId !== 97)
    }, [chainId])

    const changeCurrentSymbol = (value) => {
        setSelectedToken(value);
        handleChangeAsset(value);
    }

    return (
        <div className="bg-fadeBlack py-4 px-6 mt-5 rounded-lg">
            <div className="flex flex-row items-center space-x-4">
                <div className="text-white text-2xl ml-2">Market Details</div>
                <Select
                    options={options}
                    onChange={changeCurrentSymbol}
                />
            </div>
            <div className="bg-black p-6 mt-4 rounded-xl">
                <div className="flex flex-col space-y-8 lg:space-y-0 lg:flex-row items-stretch lg:items-center justify-between">
                    <div className="flex space-x-6 text-white">
                        {currentAsset !== 'bnb' && (
                            <div className="flex items-center cursor-pointer"
                                 onClick={() =>
                                     addToken(
                                         currentAsset,
                                         settings.decimals[currentAsset || 'usdc']?.token,
                                         'token'
                                     )
                                 }>
                                <span>
                                    {currentAsset?.toUpperCase()}
                                </span>
                                <img
                                    src={plusButtonIcon}
                                    alt="plusButtonIcon"
                                    className="ml-2 inline cursor-pointer"
                                />
                            </div>
                        )}
                        <div className="flex items-center font-medium cursor-pointer"
                             onClick={() =>
                                 addToken(
                                     currentAsset,
                                     settings.decimals[currentAsset || 'usdc']?.atoken,
                                     'atoken'
                                 )
                             }>
                            <span>
                                {`a${
                                    currentAsset === 'btcb' ? 'BTC' : currentAsset?.toUpperCase()
                                }`}
                            </span>
                            <img
                                src={plusButtonIcon}
                                alt="plusButtonIcon"
                                className="ml-2 inline cursor-pointer"
                            />
                        </div>
                        <div className="font-medium">To MetaMask</div>
                    </div>

                    <div
                        className="text-white flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-12"
                    >
                        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:space-y-1">
                            <div className="text-base lg:text-center">Net APY</div>
                            <div className="font-bold text-lg text-right lg:text-center">
                                {getBigNumber(
                                    activeType === TYPES.Supply
                                        ? (selectedAsset ? ((selectedAsset.annSupplyApy && selectedAsset.supplyApy)?
                                            (new BigNumber(selectedAsset.annSupplyApy).plus(selectedAsset.supplyApy)):0):0)
                                        : (selectedAsset ? ((selectedAsset.annBorrowApy && selectedAsset.borrowApy)?
                                            (new BigNumber(selectedAsset.annBorrowApy).minus(selectedAsset.borrowApy)):0):0)
                                )
                                    .dp(2, 1)
                                    .isGreaterThan(100000000)
                                    ? "Infinity"
                                    : getBigNumber(
                                    activeType === TYPES.Supply
                                        ? (selectedAsset ? ((selectedAsset.annSupplyApy && selectedAsset.supplyApy)?
                                            (new BigNumber(selectedAsset.annSupplyApy).plus(selectedAsset.supplyApy)):0):0)
                                        : (selectedAsset ? ((selectedAsset.annBorrowApy && selectedAsset.borrowApy)?
                                            (new BigNumber(selectedAsset.annBorrowApy).minus(selectedAsset.borrowApy)):0):0)
                                    )
                                    .dp(2, 1)
                                    .toString(10) + "%"}
                            </div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:space-y-1 relative pl-8 lg:pl-5">
                            <div className="flex flex-row items-center space-x-2">
                                {selectedToken?.logo && (
                                    <div className="absolute left-0">
                                        <img
                                            alt={selectedToken?.name}
                                            src={selectedToken?.logo}
                                            style={{ width: 20, height: 20}}
                                        />
                                    </div>
                                )}
                                <div className="text-base lg:text-center">
                                    {activeType === TYPES.Supply ? "Supply" : "Borrow"} APY
                                </div>
                            </div>
                            <div className="font-bold text-lg text-right lg:text-center">
                                {`${new BigNumber(
                                    activeType === TYPES.Supply
                                    ? selectedAsset?.supplyApy
                                    : selectedAsset?.borrowApy
                                )?.dp(2, 1)?.toString(10)}%`}
                            </div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:space-y-1 relative pl-8 lg:pl-5">
                            <div className="flex flex-row items-center space-x-2">
                                    <div className="absolute left-0">
                                        <img
                                            alt={"Annex"}
                                            src={Annex}
                                            style={{ width: 20, height: 20}}
                                        />
                                    </div>
                                <div className="text-base lg:text-center">Distribution APY</div>
                            </div>
                            <div className="font-bold text-lg text-right lg:text-center">
                                {getBigNumber(
                                    activeType === TYPES.Supply
                                        ? selectedAsset?.annSupplyApy
                                        : selectedAsset?.annBorrowApy
                                )
                                    .dp(2, 1)
                                    .isGreaterThan(100000000)
                                    ? "Infinity"
                                    : getBigNumber(
                                    activeType === TYPES.Supply
                                        ? selectedAsset?.annSupplyApy
                                        : selectedAsset?.annBorrowApy
                                    )
                                    .dp(2, 1)
                                    .toString(10) + "%"}
                            </div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:space-y-1">
                            <div className="text-base lg:text-center">Total {
                                activeType === TYPES.Supply
                                    ? "Supply"
                                    : "Borrow"
                            }</div>
                            <div className="font-bold text-primaryLight text-lg text-right lg:text-center">
                                {`$${nFormatter(
                                    new BigNumber(
                                        activeType === TYPES.Supply
                                            ? marketInfo?.totalSupplyUsd
                                            : marketInfo?.totalBorrowsUsd
                                    ).dp(2, 1).toString(10),
                                    2
                                )}`}
                                {/* {`$${activeType === TYPES.Supply
                                      ? Number(marketInfo.totalSupplyUsd) < 1000000
                                        ? Number(marketInfo.totalSupplyUsd).toFixed(2)
                                        : `${Number(marketInfo.totalSupplyUsd) / 10000000}M`
                                      : Number(marketInfo.totalBorrowsUsd) < 1000000
                                      ? Number(marketInfo.totalBorrowsUsd).toFixed(2)
                                      : `${Number(marketInfo.totalBorrowsUsd) / 10000000}M`
                                  }`} */}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="flex flex-row items-center justify-between md:justify-start mt-6">
                    <TypeButton
                        active={activeType === TYPES.Supply}
                        onClick={() => setActiveType(TYPES.Supply)}
                    >
                        Supply
                    </TypeButton>
                    <TypeButton
                        reverse
                        active={activeType === TYPES.Borrow}
                        onClick={() => setActiveType(TYPES.Borrow)}
                    >
                        Borrow
                    </TypeButton>
                </div>
                <MarketHistoryChart
                    data={data}
                    withANN={withANN}
                    type={activeType}
                />
                <div className="flex flex-col lg:flex-row lg:space-x-10 lg:px-8 mt-4">
                    <div className="flex flex-col text-white w-full">
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Price</div>
                            <div className="font-medium text-right">
                                {!account || wrongNetwork
                                    ? (<div className="animate-pulse w-16 h-6 bg-lightGray rounded-lg inline-block"/>)
                                    : marketInfo?.underlyingPrice ? `$${new BigNumber(marketInfo?.underlyingPrice || 0)
                                        .div(
                                            new BigNumber(10).pow(
                                                18 + 18 - parseInt(settings.decimals[currentAsset || 'usdc']?.token, 10)
                                            )
                                        )
                                        .dp(8, 1)
                                        .toString(10)}` : "-"}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Market Liquidity</div>
                            <div className="font-medium text-right">
                                {!account || wrongNetwork
                                    ? (<div className="animate-pulse w-24 h-6 bg-lightGray rounded-lg inline-block"/>)
                                    : marketInfo?.cash ? `${format(
                                        new BigNumber(marketInfo?.cash || 0)
                                            .div(
                                                new BigNumber(10).pow(settings.decimals[currentAsset || 'usdc']?.token)
                                            )
                                            .dp(8, 1)
                                            .toString(10)
                                    )}` : "-"} {!account || wrongNetwork
                                ? (<div className="animate-pulse w-10 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : marketInfo?.underlyingSymbol || ''}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium"># of Suppliers</div>
                            <div className="font-medium text-right">{!account || wrongNetwork
                                ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                                :  Number(marketInfo?.supplierCount) >= 0 ? format(marketInfo?.supplierCount) : "-"}</div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium"># of Borrowers</div>
                            <div className="font-medium text-right">{!account || wrongNetwork
                                ? (<div className="animate-pulse w-12 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : Number(marketInfo?.borrowerCount) >= 0 ? format(marketInfo?.borrowerCount) : "-"}</div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Reserves</div>
                            <div className="font-medium text-right">
                                {!account || wrongNetwork
                                    ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                                    : marketInfo?.totalReserves ? `${new BigNumber(marketInfo?.totalReserves || 0)
                                        .div(new BigNumber(10).pow(settings.decimals[currentAsset || 'usdc']?.token))
                                        .dp(8, 1)
                                        .toString(10)} ` : "-"} {!account || wrongNetwork
                                ? (<div className="animate-pulse w-10 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : marketInfo?.underlyingSymbol || ''}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Reserve Factor</div>
                            <div className="font-medium text-right">
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
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Collateral Factor</div>
                            <div className="font-medium text-right">{!account || wrongNetwork
                                ? (<div className="animate-pulse w-32 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : marketInfo.collateralFactor ? `${new BigNumber(marketInfo.collateralFactor || 0)
                                    .div(new BigNumber(10).pow(18))
                                    .times(100)
                                    .dp(2, 1)
                                    .toString(10)}%`: '-'}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Total Supply</div>
                            <div className="font-medium text-right">{!account || wrongNetwork
                                ? (<div className="animate-pulse w-24 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : marketInfo.totalSupplyUsd ? `$${format(
                                    new BigNumber(marketInfo.totalSupplyUsd || 0)
                                        .dp(2, 1)
                                        .toString(10)
                                )}` : "-"}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Total Borrow</div>
                            <div className="font-medium text-right">{!account || wrongNetwork
                                ? (<div className="animate-pulse w-16 h-6 bg-lightGray rounded-lg inline-block"/>)
                                : marketInfo.totalBorrowsUsd ? `$${format(
                                    new BigNumber(marketInfo.totalBorrowsUsd || 0)
                                        .dp(2, 1)
                                        .toString(10)
                                )}`: "-"}
                            </div>
                        </div>
                        <div className="flex justify-between px-4 rounded-md py-1 items-center transition-all hover:bg-fadeBlack">
                            <div className="font-medium">Exchange Rate</div>
                            <div className="font-medium text-right">
                                {!account || wrongNetwork
                                    ? (<div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>)
                                    : marketInfo.exchangeRate ? (
                                        <>
                                            1 {marketInfo.underlyingSymbol || '-'} = {!account || wrongNetwork
                                            ? (<div className="animate-pulse w-20 h-6 bg-lightGray rounded-lg inline-block"/>)
                                            : new BigNumber(1)
                                            .div(
                                                new BigNumber(marketInfo.exchangeRate).div(
                                                    new BigNumber(10).pow(
                                                        18 +
                                                        +parseInt(
                                                            settings.decimals[currentAsset || 'usdc']?.token,
                                                            10
                                                        ) -
                                                        +parseInt(
                                                            settings.decimals[currentAsset || 'usdc']?.atoken,
                                                            10
                                                        )
                                                    )
                                                )
                                            )
                                            .toFixed(6) || "-"} <span className="text-primaryLight">{marketInfo.symbol || ''}</span>
                                        </>
                                    ) : "-"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const History = React.memo(MarketHistory)

export default History;