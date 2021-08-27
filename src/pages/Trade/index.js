import React, { useContext, useEffect, useState } from 'react';
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

function Trade() {
  useEffect(() => {
    getSwap();
  }, []);

  const { subGraphInstance } = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [swapData, setSwapData] = useState([]);
  const [liquidity, setLiquidityData] = useState([]);

  const { pathname, search } = useLocation();
  const { path } = useRouteMatch();
  const history = useHistory();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const getSwap = async () => {
    try {
      const response = await request(
        ANNEX_SWAP_EXCHANGE,
        gql`
        {
          pairs(first: 5) {
            id
        name
            token0{
              symbol
        decimals
            }
            token1{
              symbol
              decimals
            }
            reserveUSD
        token0Price
        token1Price
          }
          pairDayDatas{
            id
          }
        pairHourDatas{
            id
        reserveUSD
          }
        }
        `,
      );
      setSwapData(response.pairs);

      let pairDayMapped = [];
      response.pairDayDatas.forEach((item) => {
        response.pairs.forEach((pairItem) => {
          if (item.id.includes(pairItem.id)) {
            pairDayMapped.push(pairItem);
          }
        });
      });

      let pairHourMapped = [];
      response.pairHourDatas.forEach((item) => {
        pairDayMapped.forEach((pairItem) => {
          if (item.id.includes(pairItem.id)) {
            pairHourMapped.push({
              ...pairItem,
              calcultedUSD: parseInt(item.reserveUSD) - parseInt(pairItem.reserveUSD)
            });
          }
        });
      });

      setLiquidityData(pairHourMapped);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // useEffect(() => {
  //   if (data && data.auctions) {
  //     let arr = [];
  //     data.auctions.forEach((element) => {
  //       let auctionDecimal = element['auctioningToken']['decimals'];
  //       let biddingDecimal = element['biddingToken']['decimals'];
  //       let { orders, clearingPriceOrder } = calculateClearingPrice(
  //         element.orders,
  //         auctionDecimal,
  //         biddingDecimal,
  //       );
  //       let formatedAuctionDate = moment
  //         .unix(element['auctionEndDate'])
  //         .format('MM/DD/YYYY HH:mm:ss');
  //       let graphData = [];
  //       orders &&
  //         orders.forEach((item) => {
  //           graphData.push({
  //             ...item,
  //             isSuccessfull: item.price >= clearingPriceOrder.price,
  //           });
  //         });
  //       arr.push({
  //         ...element,
  //         chartType: 'block',
  //         data: graphData,
  //         status: 'Live',
  //         statusClass: 'live',
  //         dateLabel: 'Completion Date',
  //         formatedAuctionDate,
  //         title: element.type + ' Auction',
  //       });
  //     });
  //     setTrade(arr);
  //   }
  // }, [data]);

  const buttons = [
    { key: 1, title: 'Swap', tab: 'swap', route: `${path}/swap` },
    { key: 2, title: 'Liquidity', tab: 'liquidity', route: `${path}/liquidity` },
  ];

  const onBoxHandler = (item) => {
    console.log('clicked', item)
  }

    return (
        <Layout mainClassName="pt-10" title={'LIQUIDITY'}>
            <SettingsModal open={settingsOpen} onCloseModal={() => setSettingsOpen(false)} />
            <HistoryModal open={historyOpen} onCloseModal={() => setHistoryOpen(false)} />
            <div className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl">
                <div className="flex space-x-3 mt-14">
                    {buttons?.map((b) => (
                        <button
                            key={b.key}
                            className={`focus:outline-none py-2 px-12 rounded-3xl text-xl ${
                                pathname.includes(b.route)
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
      </Layout>
  );
}

export default Trade;
