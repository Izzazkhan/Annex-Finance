import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Switch, Route, useRouteMatch, Redirect, useHistory, useLocation } from 'react-router-dom';
import subGraphContext from '../../contexts/subgraph';
import { calculateClearingPrice } from '../../utilities/graphClearingPrice';
import { gql } from '@apollo/client';
import { request } from 'graphql-request';
import { useSubgraph } from 'thegraph-react';
import moment from 'moment';
import Layout from '../../layouts/MainLayout/MainLayout';
import SettingsModal from '../../components/common/SettingsModal';
import HistoryModal from '../../components/common/HistoryModal';
import Swap from './Swap';
import Liquidity from './Liquidity';
import AddLiquidity from './AddLiquidity';
import PoolFinder from './PoolFinder';
import { useActiveWeb3React } from '../../hooks';
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
} from './redirects/addLiquidity';
import RedirectOldRemoveLiquidityPathStructure from './redirects/removeLiquidity';
import RemoveLiquidity from './RemoveLiquidity';
import ANN from '../../assets/images/coins/ann-new.png';
import BTC from '../../assets/images/coins/btc-new.png';
import BTCB from '../../assets/images/coins/btcb-new.png';
import UpArrow from '../../assets/images/up-arrow.png';
import DownArrow from '../../assets/images/down-arrow.png';
import coins from '../../assets/icons/coins.svg';
import styled from 'styled-components';
import { ANNEX_SWAP_EXCHANGE } from './EndPoints';
import Loader from 'components/UI/Loader';
import { currencyFormatter } from 'utilities/common';
import { restService } from 'utilities';
import BigNumber from 'bignumber.js';

const Styles = styled.div`
  .sidebar {
    .scroll {
      height: 750px;
      overflow: hidden;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 10px;
      }
      &::-webkit-scrollbar-track {
        background: #000;
        border: 0.5px solid #282525;
        box-shadow: none;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #282525;
        border-radius: 20px;
        border: 0.5px solid #ff9800;
      }
    }
    &.right {
      .scroll {
        direction: rtl;
        > div {
          direction: ltr;
        }
      }
    }
  }
`;
const EmptyDataStyles = styled.div`
  width: 100%;
  overflow: auto;
  border: double 2px transparent;
  border-radius: 30px;
  background-image: transparent;
  display: flex;
  justify-content: center;
`;

function Trade() {
  useEffect(() => {
    getSwap();
  }, []);

  const { chainId } = useActiveWeb3React();
  const { subGraphInstance } = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [swapData, setSwapData] = useState([]);
  const [liquidity, setLiquidityData] = useState([]);

  const { pathname, search } = useLocation();
  const { path } = useRouteMatch();
  const history = useHistory();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false)


  const getSwap = async () => {
    setLoading(true)
    const apiRequest = await restService({
      third_party: true,
      api: ANNEX_SWAP_EXCHANGE[chainId],
      method: 'GET',
      params: {}
    });
    if (apiRequest.status !== 200) {
      setLoading(false)
      return
    }
    let liquidityPairs = _.cloneDeep(apiRequest.data.pairs)
    let hrChangePairs = _.cloneDeep(apiRequest.data.pairs)

    liquidityPairs.sort((a, b) => b.liquidity - a.liquidity)
    setSwapData(liquidityPairs);
    
    hrChangePairs.sort((a, b) => b.change24h - a.change24h)
    setLiquidityData(hrChangePairs);
    
    setLoading(false)
  }

  const buttons = [
    { key: 1, title: 'Swap', tab: 'swap', route: `${path}/swap` },
    { key: 2, title: 'Liquidity', tab: 'liquidity', route: `${path}/liquidity` },
  ];

  const onBoxHandler = (item) => {
    console.log('clicked', item)
  }

  return (
    <Styles>
      <Layout mainClassName="pt-10" title={'LIQUIDITY'}>
        <SettingsModal open={settingsOpen} onCloseModal={() => setSettingsOpen(false)} />
        <HistoryModal open={historyOpen} onCloseModal={() => setHistoryOpen(false)} />
        <div
          className="bg-fadeBlack w-full flex justify-between items-center rounded-3xl lg:flex-row flex-col p-10"
        >
          {/* <div
          className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl 
            grid grid-cols-1 gap-y-6 lg:grid-cols-8 lg:gap-x-6 mt-8 p-5"
        > */}
          <div className="col-span-2 py-8 px-5 bg-black rounded-3xl sidebar">
            <div className="text-white text-xl font-bold p-5 pt-6">Liquidity By </div>
            <div className=" scroll pr-2">
              {
                loading && (
                  <div className='flex w-full justify-center'>
                    <Loader size="160px" className="m-20 self-center" stroke="#ff9800" />
                  </div>
                )
              }
              {
                !loading && swapData.length === 0 && (
                  <EmptyDataStyles>
                    <div className="text-base p-20 flex justify-center text-white">
                      <span className="text-center text-2xl md:text-3xl 
                          text-border title-text">There are no pairs</span>
                    </div>
                  </EmptyDataStyles>
                )
              }
              {!loading && swapData.map((item, index) => {
                return (
                  <div className="rounded-3xl border border-white mb-4" key={index} onClick={() => onBoxHandler(item)}>
                    <div className="flex items-center justify-center py-3 px-3">
                      <img width="14px" src={BTC} alt="" />
                      <div className="text-white font-bold text-sm mx-5">{item.token0Symbol} - {item.token1Symbol}</div>
                      <img width="14px" src={ANN} alt="" />
                    </div>
                    <div
                      className={`flex items-center justify-between py-3 px-2 border-t ${index % 2 == 0 ?
                        `border-b border-white` : 'bgPrimaryGradient'
                        }
                            text-white text-xs`}
                      style={{ borderColor: '#2E2E2E' }}
                    >
                      <div className="flex items-center">
                        <img className="mr-1" width="14px" src={BTC} alt="" />1 {item.token0Symbol}{' '}
                        =
                        {`${new BigNumber(item.token0Price).div(item.token1Price).toFixed(5)}`}{' '}
                        {item.token1Symbol}
                      </div>
                      <div className="flex items-center">
                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1{' '}
                        {item.token1Symbol} =
                        {`${new BigNumber(item.token1Price).div(item.token0Price).toFixed(5)}`}{' '}
                        {item.token0Symbol}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                      <div className="flex flex-col  font-bold">
                        <div className="flex ">
                          <div className="mr-2" style={{ width: '14px' }}></div>Liquity
                        </div>
                        <div className="flex items-center my-2">
                          <div className="mr-2" style={{ width: '14px' }}>
                            <img className="" src={coins} alt="" />
                          </div>
                          {currencyFormatter(item.liquidity)}
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2" style={{ width: '14px' }}>
                            <img className="" src={Math.sign(item?.change24h) === -1 ? DownArrow : UpArrow} alt="" />
                          </div>
                          {new BigNumber(item?.change24h || 0)
                            .dp(6, 1)
                            .toString(10)}%
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className=" font-bold">LP Reward APR</div>
                        <div className="flex text-white font-bold my-2">{item?.apr || 0}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-span-4">
            <div className="flex space-x-3 mt-14 justify-center">
              {buttons?.map((b) => (
                <button
                  key={b.key}
                  className={`focus:outline-none py-2 px-12 rounded-3xl text-xl ${pathname.includes(b.route)
                    ? 'text-black font-bold bgPrimaryGradient'
                    : 'text-white bg-black border border-solid border-gray'
                    }`}
                  onClick={() => {
                    history.push(b.route);
                  }}
                >
                  {b.title}
                </button>
              ))}
            </div>
            <Switch>
              <Switch>
                <Route exact strict path={`${path}/swap`}>
                  <Swap
                    onSettingsOpen={() => setSettingsOpen(true)}
                    onHistoryOpen={() => setHistoryOpen(true)}
                  />
                </Route>
                <Route exact strict path={`${path}/liquidity`}>
                  <Liquidity
                    onSettingsOpen={() => setSettingsOpen(true)}
                    onHistoryOpen={() => setHistoryOpen(true)}
                  />
                </Route>
                <Route exact strict path={`${path}/liquidity/remove/:currencyIdA/:currencyIdB`} component={RemoveLiquidity} />
                <Route
                  exact
                  strict
                  path={`${path}/liquidity/remove/:tokens`}
                  component={RedirectOldRemoveLiquidityPathStructure}
                />
                <Route exact path={`${path}/liquidity/add`} component={AddLiquidity} />
                <Route exact path={`${path}/liquidity/find`} component={PoolFinder} />
                <Route
                  exact
                  path={`${path}/liquidity/add/:currencyIdA`}
                  component={RedirectOldAddLiquidityPathStructure}
                />
                <Route
                  exact
                  path={`${path}/liquidity/add/:currencyIdA/:currencyIdB`}
                  component={RedirectDuplicateTokenIds}
                />
                <Redirect to={`${path}/swap`} />
              </Switch>
            </Switch>
          </div>

          <div className="col-span-2 py-8 px-5 bg-black rounded-3xl sidebar right">
            <div className="text-white text-xl font-bold p-5 pt-6">24hrs Change</div>
            <div className=" scroll pl-2">
              {
                loading && (
                  <div className='flex w-full justify-center'>
                    <Loader size="160px" className="m-20 self-center" stroke="#ff9800" />
                  </div>
                )
              }
              {
                !loading && liquidity.length === 0 && (
                  <EmptyDataStyles>
                    <div className="text-base p-20 flex justify-center items-center text-white">
                      <span className="text-center text-2xl md:text-3xl 
                          text-border title-text">There are no pairs</span>
                    </div>
                  </EmptyDataStyles>
                )
              }
              {!loading && liquidity.map((item, index) => {
                return (
                  <div className="rounded-3xl border border-white mb-4" key={index} >
                    <div className="flex items-center justify-center py-3 px-3">
                      <img width="14px" src={BTC} alt="" />
                      <div className="text-white font-bold text-sm mx-5">{item.token0Symbol} - {item.token1Symbol}</div>
                      <img width="14px" src={ANN} alt="" />
                    </div>
                    <div
                      className={`flex items-center justify-between py-3 px-2 border-t ${index % 2 == 0 ?
                        `border-b border-white` : 'bgPrimaryGradient'
                        }
                            text-white text-xs`}
                      style={{ borderColor: '#2E2E2E' }}
                    >
                      <div className="flex items-center">
                        <img className="mr-1" width="14px" src={BTC} alt="" />1 {item.token0Symbol}{' '}
                        =
                        {`${new BigNumber(item.token0Price).div(item.token1Price).toFixed(5)}`}{' '}
                        {item.token1Symbol}
                      </div>
                      <div className="flex items-center">
                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1{' '}
                        {item.token1Symbol} =
                        {`${new BigNumber(item.token1Price).div(item.token0Price).toFixed(5)}`}{' '}
                        {item.token0Symbol}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                      <div className="flex flex-col  font-bold">
                        <div className="flex ">
                          <div className="mr-2" style={{ width: '14px' }}></div>Liquity
                        </div>
                        <div className="flex items-center my-2">
                          <div className="mr-2" style={{ width: '14px' }}>
                            <img className="" src={coins} alt="" />
                          </div>
                          {currencyFormatter(item.liquidity)}
                        </div>
                        <div className="flex items-center">
                          <div className="mr-2" style={{ width: '14px' }}>
                            <img className="" src={Math.sign(item?.change24h) === -1 ? DownArrow : UpArrow} alt="" />
                          </div>
                          {new BigNumber(item?.change24h || 0)
                            .dp(4, 1)
                            .toString(10)}%
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className=" font-bold">LP Reward APR</div>
                        <div className="flex text-white font-bold my-2">{item?.apr || 0}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </Layout>
    </Styles>
  );
}

export default Trade;