import commaNumber from 'comma-number';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { connectAccount } from '../core';
import { useEffect, useMemo, useState } from 'react';
import { methods } from '../utilities/ContractService';
import BigNumber from 'bignumber.js';
import * as constants from '../utilities/constants';
import Layout from '../layouts/MainLayout/MainLayout';
import MarketSummaryCard from '../components/Market/MarketSummaryCard';
import APYSparkline from '../components/Annex/APYSparkline';
import { currencyFormatter } from '../utilities/common';
import MarketTable from '../components/Market/MarketTable';

const format = commaNumber.bindWith(',', '.');

const Market = ({ history, settings }) => {
  const [totalSupply, setTotalSupply] = useState('0');
  const [totalBorrow, setTotalBorrow] = useState('0');
  const [totalSupplier, setTotalSupplier] = useState('0');
  const [totalBorrower, setTotalBorrower] = useState('0');
  const [availableLiquidity, setAvailableLiquidity] = useState('0');
  const [totalReserves, setTotalReserves] = useState(0);

  const markets = settings.markets.map(market => {
    const decimals = market.underlyingSymbol ? settings.decimals[market.underlyingSymbol.toLowerCase()]?.token : 18;
    market.reserveUSD = new BigNumber(market.totalReserves).div(new BigNumber(10).pow(decimals));
    market.utilization = new BigNumber(market.totalBorrowsUsd).div(market.totalSupplyUsd).times(100).dp(2, 1).toString(10);
    return market;
  });

  const getTotalInfo = async () => {
    // const xaiContract = getXaiTokenContract();

    const tempTS = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.totalSupplyUsd));
    }, 0);
    const tempTB = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.totalBorrowsUsd));
    }, 0);
    const tempAL = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.liquidity));
    }, 0);
    const tempTSR = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.supplierCount));
    }, 0);
    const tempTBR = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.borrowerCount));
    }, 0);
    const tempRSV = (settings.markets || []).reduce((accumulator, market) => {
      return new BigNumber(accumulator).plus(new BigNumber(market.reserveUSD).times(market.tokenPrice));
    }, 0);

    // let xaiBalance = await methods.call(xaiContract.methods.balanceOf, [
    //     constants.CONTRACT_XAI_VAULT_ADDRESS
    // ]);
    // xaiBalance = new BigNumber(xaiBalance).div(1e18);

    setTotalSupply(
      tempTS !== 0
        ? tempTS
          // .plus(xaiBalance)
          .dp(2, 1)
          .toString(10)
        : tempTS,
    );
    setTotalBorrow(tempTB !== 0 ? tempTB.dp(2, 1).toString(10) : tempTB);
    setAvailableLiquidity(
      tempAL !== 0
        ? tempAL
          // .plus(xaiBalance)
          .dp(2, 1)
          .toString(10)
        : tempAL,
    );
    setTotalSupplier(
      tempAL !== 0
        ? tempTSR
          .dp(2, 1)
          .toString(10)
        : tempTSR,
    );
    setTotalBorrower(
      tempAL !== 0
        ? tempTBR
          .dp(2, 1)
          .toString(10)
        : tempTBR,
    );
    setTotalReserves(
      tempRSV !== 0
        ? tempRSV
          .dp(2, 1)
          .toString(10)
        : tempRSV,
    );
  };

  useEffect(() => {
    if (settings.markets && settings.dailyAnnex) {
      getTotalInfo();
    }
  }, [settings.markets]);

  const columns = useMemo(() => {
    return [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'Coin',
            accessor: 'underlyingSymbol',
            // eslint-disable-next-line react/display-name
            Cell: ({ value }) => {
              return (
                <div className="flex justify-start items-center space-x-2 ml-6 sm:ml-0">
                  <img
                    className={'w-10 h-10'}
                    src={constants.CONTRACT_TOKEN_ADDRESS[value.toLowerCase()].asset}
                    alt={value}
                  />
                  <div className="font-semibold text-white">{value}</div>
                </div>
              );
            },
          },
          {
            Header: 'Total Supply',
            accessor: 'totalSupplyUsd',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {

              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className="font-bold">{currencyFormatter(value, '')}</div>
                    <div className="text-sm">
                      {format(
                        new BigNumber(value)
                          .div(new BigNumber(row?.original?.tokenPrice))
                          .dp(0, 1)
                          .toString(10),
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Supply APY',
            accessor: 'supplyApy',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              const apyValue = new BigNumber(value)
                .plus(new BigNumber(row?.original?.supplyAnnexApy))
              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className={`font-bold text-${
                        apyValue.isNegative()
                          ? 'red'
                          : 'green'
                      }`}>
                      {apyValue
                        .dp(2, 1)
                        .toString(10)}
                      %
                    </div>
                    <div className="text-sm">
                      {new BigNumber(row?.original?.supplyAnnexApy).dp(2, 1).toString(10)}%
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Total Borrow',
            accessor: 'totalBorrowsUsd',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className="font-bold">{currencyFormatter(value, '')}</div>
                    <div className="text-sm">
                      {format(
                        new BigNumber(value)
                          .div(new BigNumber(row?.original?.tokenPrice))
                          .dp(0, 1)
                          .toString(10),
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Borrow APY',
            accessor: 'borrowAnnexApy',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              const apyValue = new BigNumber(value)
                .minus(new BigNumber(row?.original?.borrowApy))
              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className={`font-bold text-${
                      apyValue.isNegative()
                        ? 'red'
                        : 'green'
                    }`}>
                      {apyValue
                        .dp(2, 1)
                        .toString(10)}
                      %
                    </div>
                    <div className="text-sm">
                      {new BigNumber(row?.original?.borrowAnnexApy).dp(2, 1).toString(10)}%
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Total Reserves',
            accessor: 'reserveUSD',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              const reserveUSD = new BigNumber(value).times(row.values.tokenPrice).dp(2, 1).toString(10);

              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className="font-bold">{currencyFormatter(reserveUSD, '')}</div>
                    <div className="text-sm">
                      {value.dp(2, 1).toString(10)}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Liquidity',
            accessor: 'liquidity',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              const liquidityTokens = new BigNumber(value).div(row.values.tokenPrice).dp(2, 1).toString(10);
              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className="font-bold">{currencyFormatter(value, '')}</div>
                    <div className="text-sm">
                      {liquidityTokens}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Utiliz.',
            accessor: 'utilization',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value, row }) => {
              return (
                <div className="flex justify-end">
                  <div className="flex flex-col justify-center items-end space-x-2">
                    <div className="font-bold">
                      {new BigNumber(value)
                        .isLessThan(0.01)
                        ? '0.01'
                        : new BigNumber(value)
                          .dp(2, 1)
                          .toString(10)}
                      %
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: 'Price',
            accessor: 'tokenPrice',
            disableFilters: true,
            // eslint-disable-next-line react/display-name
            Cell: ({ value }) => {
              return (
                <div className="font-bold ml-6 text-right">{currencyFormatter(value, 'price')}</div>
              );
            },
          },
        ],
      },
    ];
  }, []);

  return (
    <Layout mainClassName="py-8" title={'Market'}>
      <div>
        <div className="grid grid-cols-1 gap-y-6 lg:gap-y-6 md:gap-y-6 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 md:gap-x-6 px-10 md:px-0">
          <MarketSummaryCard title={'Total Supply'}>${format(totalSupply)}</MarketSummaryCard>

          <MarketSummaryCard title={'Total Borrow'}>${format(totalBorrow)}</MarketSummaryCard>

          <MarketSummaryCard title={'Available Liquidity'}>
            ${format(availableLiquidity)}
          </MarketSummaryCard>
          <MarketSummaryCard title={'Total Reserves'}>
            ${format(totalReserves)}
          </MarketSummaryCard>
          <MarketSummaryCard title={'Total Suppliers'}>
            {totalSupplier}
          </MarketSummaryCard>
          <MarketSummaryCard title={'Total Borrowers'}>
            {totalBorrower}
          </MarketSummaryCard>
        </div>
      </div>

      <div className="relative w-full">
        <div className="bg-fadeBlack w-full p-7 mt-16 rounded-2xl">
          <MarketTable
            data={markets}
            columns={columns}
            onRowClick={(row) => history.push(`/market/${row?.original?.underlyingSymbol}`)}
          />
        </div>
      </div>
    </Layout>
  );
};

Market.defaultProps = {
  history: {},
  settings: {},
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

export default compose(withRouter, connectAccount(mapStateToProps, undefined))(Market);
