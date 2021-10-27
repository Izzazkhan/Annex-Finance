import React, { useContext, useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import AuctionItem from './item';
import dutchAuctionContext from '../../../contexts/dutchAuction';
import { methods } from '../../../utilities/ContractService';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';


function DutchAuction(props) {
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    let auctionTime1, auctionTime2
    if (props.auctionStatus === 'live') {
        auctionTime1 = 'auctionEndDate_gt'
        auctionTime2 = 'auctionStartDate_lt'
    }
    else if (props.auctionStatus === 'past') {
        auctionTime1 = 'auctionEndDate_lt'
        auctionTime2 = 'auctionStartDate_lt'
    }
    else {
        auctionTime1 = 'auctionEndDate_gt'
        auctionTime2 = 'auctionStartDate_gt'
    }
    let dutchQuery = `
    {
      auctions(where: { ${auctionTime1}: "${currentTimeStamp}", ${auctionTime2}: "${currentTimeStamp}" }) {
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

    const [dutchAuction, setDutchAuction] = useState([]);
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('')

    useEffect(() => {
        try {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "query": dutchQuery
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            let subGraph
            if (process.env.REACT_APP_ENV === 'dev') {
                subGraph = process.env.REACT_APP_TEST_DUTCH_AUCTION_DATASOURCE;
            } else {
                subGraph = process.env.REACT_APP_MAIN_DUTCH_AUCTION_DATASOURCE;
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

    useEffect(async () => {
        if (data && data.data.auctions.length > 0) {
            let arr = data.data.auctions.map(async (element) => {
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
                    status: props.auctionStatus === 'live' ? 'Live' : props.auctionStatus === 'past' ? 'Past' : 'Upcoming',
                    statusClass: props.auctionStatus === 'live' ? 'live' : props.auctionStatus === 'past' ? 'past' : 'upcoming',
                    formatedAuctionDate,
                    title: element.type + ' Auction',
                    biddingDecimal: biddingDecimal,
                };
            });
            const resolvedArray = await Promise.all(arr);
            setDutchAuction(resolvedArray);
            setLoading(false)
        }
        else if (data && data.data.auctions.length === 0) {
            setLoading(false)
        }
    }, [data]);

    return (
        <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
            <h2 className="text-white ml-5 text-4xl font-normal">{props.auctionStatus === 'live' ? 'Live' :
                props.auctionStatus === 'past' ? 'Past' : 'Upcoming'} Auctions</h2>
            {loading ? (
                <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                    <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                </div>
            ) : error ? (
                <div className="text-center mb-5 mt-5">{error}</div>
            ) : dutchAuction.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
                    {dutchAuction.map((item, index) => {
                        return <AuctionItem key={index} {...item} />;
                    })}
                </div>
            ) : (
                <div className="text-center mb-5 mt-5">No data found</div>
            )}
        </div>
    );
}

export default DutchAuction;
