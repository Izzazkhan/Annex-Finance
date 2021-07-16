import React, { useContext, useEffect, useState } from 'react';
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import { BigNumber } from '@ethersproject/bignumber';

function Live(props) {
  const subGraphInstance = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const [auction, setAuction] = useState([]);
  const { error, loading, data } = useQuery(gql`
    {
      auctions(first: 1000) {
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
      let graphData = [
        {
          name: 'page 1',
          uv: 4000,
          pv: 2400,
          amt: 2400,
          isSuccessfull: false,
        },
        {
          name: 'page 2.1',
          uv: 3000,
          pv: 1398,
          amt: 2210,
          isSuccessfull: false,
        },
        {
          name: 'page 3.1',
          uv: 2000,
          pv: 9800,
          amt: 2290,
          isSuccessfull: false,
        },
        {
          name: 'page 4.1',
          uv: 4000,
          pv: 2400,
          amt: 2400,
          isSuccessfull: true,
        },
        {
          name: 'page 5.1',
          uv: 3000,
          pv: 1398,
          amt: 2210,
          isSuccessfull: true,
        },
        {
          name: 'page 6.1',
          uv: 2000,
          pv: 9800,
          amt: 2290,
          isSuccessfull: true,
        },
      ];
      data.auctions.forEach((element) => {
        let auctionDecimal = element['auctioningToken']['decimals'];
        let biddingDecimal = element['biddingToken']['decimals'];
        let { orders, clearingPriceOrder } = calculateClearingPrice(
          element.orders,
          auctionDecimal,
          biddingDecimal,
        );
        let updatedGraphData = [];
        orders &&
          orders.forEach((item) => {
            updatedGraphData.push({
              ...item,
              isSuccessfull: item.price >= clearingPriceOrder.price,
            });
          });
        console.log('clearingPrice', clearingPriceOrder);
        console.log('orders', orders);
        arr.push({
          ...element,
          chartType: 'block',
          data: updatedGraphData,
          status: 'Live',
          statusClass: 'live',
          title: element.type + ' Auction',
        });
      });
      setAuction(arr);
    }
  }, [data]);

  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Live Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          auction.map((item, index) => {
            return <AuctionItem key={index} {...item} />;
          })
        )}
      </div>
    </div>
  );
}

export default Live;
