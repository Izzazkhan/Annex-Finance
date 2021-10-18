import React, { useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import dutchAuctionContext from '../../../contexts/dutchAuction';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { dutchAuctionContract, methods } from '../../../utilities/ContractService';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';
import BigNumber from 'bignumber.js';

function Past(props) {
  const currentTimeStamp = Math.floor(Date.now() / 1000);
  const { subGraphInstance } = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [auction, setAuction] = useState([]);
  const { error, loading, data } = useQuery(gql`
    {
      auctions(where: { auctionEndDate_lt: "${currentTimeStamp}"}) {
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
        minFundingThresholdNotReached
        auctionedSellAmount_eth
        minBuyAmount_eth
        liquidity_eth
        initialAuctionOrder
        soldAuctioningTokens_eth
        minimumBiddingAmountPerOrder_eth
        estimatedTokenSold_eth
        minFundingThreshold_eth
        maxAvailable_eth
        minimumPrice_eth
        currentPrice_eth
        clearingPriceOrder
        clearingPrice
        orderCancellationEndDate
        auctionEndDate
        auctionStartDate
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
          price
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
      auctions(where: { auctionEndDate_lt: "${currentTimeStamp}"}) {
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
        timestamp
      }
    }
  `;

  const { dutchAuctionInstance } = useContext(dutchAuctionContext);
  const { useQuery: useQueryDutch } = useSubgraph(dutchAuctionInstance);
  const { error: dutchError, loading: dutchLoading, data: dutchData } = useQueryDutch(dutchQuery);
  const [dutchAuction, setDutchAuction] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);

  useEffect(() => {
    if (data && data.auctions) {
      let arr = [];
      data.auctions.forEach((element) => {
        let auctionDecimal = element['auctioningToken']['decimals'];
        let biddingDecimal = element['biddingToken']['decimals'];
        let auctionEndDate = element['auctionEndDate'];
        let initialAuctionOrder = element['initialAuctionOrder'];
        let clearingPrice = element['clearingPrice'];
        let { orders, clearingPriceOrder } = calculateClearingPrice(
          initialAuctionOrder,
          element.orders,
          auctionDecimal,
          biddingDecimal,
          auctionEndDate,
        );
        let formatedAuctionDate = moment
          .unix(element['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        let graphData = [];
        orders &&
          orders.forEach((item) => {
            graphData.push({
              ...item,
              isSuccessfull: item.price >= new BigNumber(clearingPrice),
              auctionEndDate: auctionEndDate,
            });
          });
        arr.push({
          ...element,
          chartType: 'block',
          data: graphData,
          status: 'Finished',
          statusClass: 'past',
          formatedAuctionDate,
          dateLabel: 'End Date',
          title: element.type + ' Auction',
        });
      });
      setAuction(arr);
    }
  }, [data]);

  useEffect(() => {
    if (dutchData && dutchData !== undefined && dutchData.auctions && dutchData.auctions.length) {
      let arr = [];
      dutchData.auctions.forEach(async (element) => {
        let formatedAuctionDate = moment
          .unix(element['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        // const biddingToken = new instance.eth.Contract(
        //   JSON.parse(constants.CONTRACT_ABEP_ABI),
        //   element.biddingToken,
        // );
        // let biddingDecimal = await methods.call(biddingToken.methods.decimals, []);
        let biddingDecimal = 6;
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
        arr.push({
          ...element,
          data: graphData,
          formatedAuctionDate,
          title: element.type + ' Auction',
        });
      });
      setDutchAuction(arr);
    }
  }, [dutchData]);

  useEffect(() => {
    let all = [];
    let batchAuction = [...auction];
    let dutch = [...dutchAuction];
    all = batchAuction.concat(dutch);
    setAllAuctions(all);
  }, [auction, dutchAuction]);

  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Past Auctions</h2>
      {loading || dutchLoading ? (
        <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
          <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : dutchError ? (
        <div>{error}</div>
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
export default Past;
