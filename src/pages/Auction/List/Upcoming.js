import React, { useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import dutchAuctionContext from '../../../contexts/dutchAuction';
import fixedAuctionContext from '../../../contexts/fixedAuction';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { dutchAuctionContract, methods } from '../../../utilities/ContractService';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';

function Upcoming(props) {
  const currentTimeStamp = Math.floor(Date.now() / 1000);
  const { subGraphInstance } = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [auction, setAuction] = useState([]);
  const { error, loading, data } = useQuery(gql`
    {
      auctions(where: { auctionStartDate_gt: "${currentTimeStamp}"}) {
        id
        type
        userId {
          id
          address
        }
        auctioningToken {
          id
          decimals
        }
        biddingToken {
          id
          decimals
        }
        orderCancellationEndDate
        auctionEndDate
        auctionStartDate
        auctionedSellAmount_eth
        minBuyAmount_eth
        liquidity_eth
        soldAuctioningTokens_eth
        minimumBiddingAmountPerOrder_eth
        estimatedTokenSold_eth
        minFundingThreshold_eth
        maxAvailable_eth
        minimumPrice_eth
        currentPrice_eth
        orders {
          id
          buyAmount
          sellAmount
          claimableLP
          status
          buyAmount_eth
          sellAmount_eth
          claimableLP_eth
          price_eth
          userId {
            id
          }
          auctionId {
            id
          }
          bidder {
            id
            status
            lpTokens_eth
            biddingToken_eth
          }
        }
      }
    }
  `);

  let dutchQuery = gql`
    {
      auctions(first: 15) {
        id
        type
        auctioner_address
        auctioningToken
        biddingToken
        auctionStartDate
        auctionEndDate
        auctionedSellAmount
        amountMax1
        amountMin1
        about {
          id
        }
        orders {
          id
          auctioner_address
          auctionId {
            id
          }

          buyAmount
          sellAmount
          txHash
          blockNumber
          timestamp
        }
        timestamp
      }
    }
  `;

  const { dutchAuctionInstance } = useContext(dutchAuctionContext);
  const { useQuery: useQueryDutch } = useSubgraph(dutchAuctionInstance);
  const { error: dutchError, loading: dutchLoading, data: dutchData } = useQueryDutch(dutchQuery);
  const [dutchAuction, setDutchAuction] = useState([]);
  const [fixedAuction, setFixedAuction] = useState([]);

  const { fixedAuctionInstance } = useContext(fixedAuctionContext);
  const { useQuery: useQueryFixed } = useSubgraph(fixedAuctionInstance);
  const { error: fixedError, loading: fixedLoading, data: fixedData } = useQueryFixed(dutchQuery);
  const [allAuctions, setAllAuctions] = useState([]);

  useEffect(() => {
    if (data && data.auctions) {
      let arr = [];
      data.auctions.forEach((element) => {
        let auctionDecimal = element['auctioningToken']['decimals'];
        let biddingDecimal = element['biddingToken']['decimals'];
        let { orders, clearingPriceOrder } = calculateClearingPrice(
          element.orders,
          auctionDecimal,
          biddingDecimal,
        );
        let formatedAuctionDate = moment
          .unix(element['auctionStartDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        let graphData = [];
        orders &&
          orders.forEach((item) => {
            graphData.push({
              ...item,
              isSuccessfull: item.price >= clearingPriceOrder.price,
            });
          });
        arr.push({
          ...element,
          chartType: 'block',
          data: graphData,
          status: 'Upcoming',
          statusClass: 'upcoming',
          formatedAuctionDate,
          dateLabel: 'Starting Date',
          title: element.type + ' Auction',
        });
      });
      setAuction(arr);
    }
  }, [data]);

  useEffect(async () => {
    if (dutchData && dutchData !== undefined && dutchData.auctions && dutchData.auctions.length) {
      let arr = dutchData.auctions.map(async (element) => {
        let formatedAuctionDate = moment
          .unix(element['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        const biddingToken = new instance.eth.Contract(
          JSON.parse(constants.CONTRACT_ABEP_ABI),
          element.biddingToken,
        );
        let biddingDecimal = await methods.call(biddingToken.methods.decimals, []);
        let startingPrice = element['amountMin1'] / Math.pow(10, biddingDecimal);
        let reservedPrice = element['amountMax1'] / Math.pow(10, biddingDecimal);
        let graphData = [
          {
            value: startingPrice,
          },
          {
            value: reservedPrice,
          },
        ];
        return {
          ...element,
          data: graphData,
          formatedAuctionDate,
          title: element.type + ' Auction',
          biddingDecimal: biddingDecimal,
        };
      });
      const resolvedArray = await Promise.all(arr);
      setDutchAuction(resolvedArray);
    }
    return () => {
      console.log('‘cleanup on change of player props’');
    };
  }, [dutchData]);

  useEffect(async () => {
    if (fixedData && fixedData !== undefined && fixedData.auctions && fixedData.auctions.length) {
      let arr = fixedData.auctions.map(async (element) => {
        let formatedAuctionDate = moment
          .unix(element['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        const biddingToken = new instance.eth.Contract(
          JSON.parse(constants.CONTRACT_ABEP_ABI),
          element.biddingToken,
        );
        let biddingDecimal = await methods.call(biddingToken.methods.decimals, []);
        const auctioningToken = new instance.eth.Contract(
          JSON.parse(constants.CONTRACT_ABEP_ABI),
          element.auctioningToken,
        );
        let auctionDecimal = await methods.call(auctioningToken.methods.decimals, []);
        let yMaximum = element['amountMin1'] / Math.pow(10, biddingDecimal);
        let orders = [];
        element['orders'].forEach((order, index) => {
          let price = order['buyAmount'] / Math.pow(10, auctionDecimal);
          price = convertExponentToNum(price);
          let auctionDivBuyAmount = order['sellAmount'] / Math.pow(10, biddingDecimal);
          auctionDivBuyAmount = convertExponentToNum(auctionDivBuyAmount);

          orders.push({
            ...order,
            price,
            auctionDivBuyAmount,
          });
        });
        return {
          ...element,
          data: [],
          formatedAuctionDate,
          title: element.type + ' Auction',
          biddingDecimal: biddingDecimal,
          yMaximum: yMaximum,
          orders: orders,
        };
      });
      const resolvedArray = await Promise.all(arr);
      setFixedAuction(resolvedArray);
    }
    return () => {
      console.log('clean up');
    };
  }, [fixedData]);

  const convertExponentToNum = (x) => {
    if (Math.abs(x) < 1.0) {
      let e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + new Array(e).join('0') + x.toString().substring(2);
      }
    } else {
      let e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    return x;
  };

  useEffect(() => {
    let all = [];
    let batchAuction = [...auction];
    let dutch = [...dutchAuction];
    let fixed = [...fixedAuction];
    all = batchAuction.concat(fixed);
    setAllAuctions(all);
    return () => {
      console.log('clean up');
    };
  }, [auction, dutchAuction, fixedAuction]);

  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Upcoming Auctions</h2>
      {loading || dutchLoading || fixedLoading ? (
        <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
          <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : fixedError ? (
        <div>{fixedError}</div>
      ) : dutchError ? (
        <div>{dutchError}</div>
      ) : allAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
          {allAuctions.map((item, index) => {
            return <AuctionItem key={index} {...item} />;
          })}
        </div>
      ) : (
        <div className="text-center mb-5 mt-5">No data found</div>
      )}
    </div>
  );
}

export default Upcoming;
