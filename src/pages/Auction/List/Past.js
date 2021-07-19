import React, { useContext, useEffect, useState } from 'react';
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';

function Past(props) {
  const currentTimeStamp = Math.floor(Date.now() / 1000);
  const subGraphInstance = useContext(subGraphContext);
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
        orderCancellationEndDate
        auctionEndDate
        orders {
          id
          buyAmount
          sellAmount
          claimableLP
          status
          userId {
            id
          }
          auctionId {
            id
          }
          bidder {
            id
            status
          }
        }
      }
    }
  `);
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
        let graphData = [];
        orders &&
          orders.forEach((item) => {
            graphData.push({
              ...item,
              isSuccessfull: item.price >= clearingPriceOrder.price,
            });
          });
        // console.log('clearingPrice', clearingPriceOrder);
        // console.log('orders', orders);
        arr.push({
          ...element,
          chartType: 'block',
          data: graphData,
          status: 'Finished',
          statusClass: 'past',
          title: element.type + ' Auction',
        });
      });
      setAuction(arr);
    }
  }, [data]);

  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Past Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : auction.length > 0 ? (
          auction.map((item, index) => {
            return <AuctionItem key={index} {...item} />;
          })
        ) : (
          <div>No data found</div>
        )}
      </div>
    </div>
  );
}
export default Past;
