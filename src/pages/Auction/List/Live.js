import React, { useContext, useEffect, useState } from 'react';
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import { request } from 'graphql-request';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';

function Live(props) {
  const currentTimeStamp = Math.floor(Date.now() / 1000);
  let query = gql`
  {
    auctions(where: { auctionEndDate_gt: "${currentTimeStamp}"}) {
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
`;

  const { subGraphInstance } = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [auction, setAuction] = useState([]);
  const { error, loading, data } = useQuery(query);

  useEffect(() => {
    if (data && data.auctions) {
      console.log('auction Data', data);
      let arr = [];
      data.auctions.forEach((element) => {
        let auctionDecimal = element['auctioningToken']['decimals'];
        let biddingDecimal = element['biddingToken']['decimals'];
        let auctionEndDate = element['auctionEndDate'];
        let { orders, clearingPriceOrder } = calculateClearingPrice(
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
              isSuccessfull: item.price >= clearingPriceOrder.price,
              auctionEndDate: auctionEndDate,
            });
          });
        arr.push({
          ...element,
          chartType: 'block',
          data: graphData,
          status: 'Live',
          statusClass: 'live',
          dateLabel: 'Completion Date',
          formatedAuctionDate,
          title: element.type + ' Auction',
        });
      });
      setAuction(arr);
    }
  }, [data]);

  // console.log('auction', auction);

  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Live Auctions</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
          <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : auction.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
          {auction.map((item, index) => {
            // console.log('item', item);
            return <AuctionItem key={index} {...item} />;
          })}
        </div>
      ) : (
        <div className="text-center mb-5 mt-5">No data found</div>
      )}
    </div>
  );
}

export default Live;
