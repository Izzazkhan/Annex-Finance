import React, { useContext, useEffect, useState } from 'react';
import AuctionItem from './item';
import subGraphContext from '../../../contexts/subgraph';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';
import BigNumber from 'bignumber.js';


function BatchAuction(props) {
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    let auctionTime
    if (props.auctionStatus === 'live') {
        auctionTime = 'auctionEndDate_gt'
    }
    else if (props.auctionStatus === 'past') {
        auctionTime = 'auctionEndDate_lt'
    }
    else {
        auctionTime = 'auctionStartDate_gt'
    }

    let query = `
  {
    auctions(where: { ${auctionTime}: "${currentTimeStamp}"}) {
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
      orderCancellationEndDate
      auctionEndDate
      auctionStartDate
      initialAuctionOrder
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
      clearingPrice
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

    const [auction, setAuction] = useState([]);
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        try {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "query": query
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            let subGraph
            if (process.env.REACT_APP_ENV === 'dev') {
                subGraph = process.env.REACT_APP_TEST_SUBGRAPH_DATASOURCE;
            } else {
                subGraph = process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
            }

            fetch(subGraph, requestOptions)
                .then(response => response.text())
                .then(result => {
                    setData(JSON.parse(result))
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false)
                    setError('Error while Loading. Please try again later.')
                });
        } catch (error) {
            console.log(error);
            setLoading(false)
            setError('Error while Loading. Please try again later.')
        }
    }, [])

    useEffect(() => {
        if (data && data.data.auctions.length > 0) {
            let arr = [];
            data.data.auctions.forEach((element) => {
                let auctionDecimal = element['auctioningToken']['decimals'];
                let biddingDecimal = element['biddingToken']['decimals'];
                let auctionEndDate = element['auctionEndDate'];
                let clearingPrice = element['clearingPrice'];
                let initialAuctionOrder = element['initialAuctionOrder'];
                let { orders, clearingPriceOrder } = calculateClearingPrice(
                    initialAuctionOrder,
                    element.orders,
                    auctionDecimal,
                    biddingDecimal,
                    auctionEndDate,
                );
                let minFundingThreshold = convertExponentToNum(
                    new BigNumber(element['minFundingThreshold_eth']).dividedBy(1000000).toNumber(),
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
                    status: props.auctionStatus === 'live' ? 'Live' : props.auctionStatus === 'past' ? 'Past' : 'Upcoming',
                    statusClass: props.auctionStatus === 'live' ? 'live' : props.auctionStatus === 'past' ? 'past' : 'upcoming',
                    dateLabel: 'Completion Date',
                    formatedAuctionDate,
                    minFundingThreshold,
                    title: element.type + ' Auction',
                });
            });
            setAuction(arr);
            setLoading(false)
        }
        else if (data && data.data.auctions.length === 0) {
            setLoading(false)
        }
    }, [data]);

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


    return (
        <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
            <h2 className="text-white ml-5 text-4xl font-normal">{props.auctionStatus === 'live' ? 'Live' :
                props.auctionStatus === 'past' ? 'Past' : 'Upcoming'} Auctions</h2>
            {loading ? (
                <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                    <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                </div>
            ) : error ? <div className="text-center mb-5 mt-5">{error}</div> : auction.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
                    {auction.map((item, index) => {
                        return <AuctionItem key={index} {...item} />;
                    })}
                </div>
            ) : (
                <div className="text-center mb-5 mt-5">No data found</div>
            )}
        </div>
    );
}

export default BatchAuction;
