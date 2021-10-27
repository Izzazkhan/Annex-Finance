import React, { useContext, useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import AuctionItem from './item';
import dutchAuctionContext from '../../../contexts/dutchAuction';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';
import {
    dutchAuctionContract,
    methods,
} from '../../../utilities/ContractService';


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
        startingPrice
      }
    }
  `;

    const dutchContract = dutchAuctionContract();

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
                let biddingSymbol = await methods.call(biddingToken.methods.symbol, []);
                // let startingPrice = element['amountMin1'] / Math.pow(10, biddingDecimal);
                let startingPrice = element['startingPrice'] / Math.pow(10, biddingDecimal);
                let currentBalance =
                    (await methods.call(dutchContract.methods.currentPrice, [element['id']]));

                let currentPrice = currentBalance / Math.pow(10, biddingDecimal)
                currentPrice = Number(convertExponentToNum(currentPrice));
                // let reservedPrice = element['amountMax1'] / Math.pow(10, biddingDecimal);
                let graphData = [
                    {
                        value: startingPrice,
                    },
                    {
                        value: currentPrice,
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
                    biddingSymbol: biddingSymbol
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
