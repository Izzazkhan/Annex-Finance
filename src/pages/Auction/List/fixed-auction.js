import React, { useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import AuctionItem from './item';
import fixedAuctionContext from '../../../contexts/fixedAuction';
import { methods } from '../../../utilities/ContractService';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import Loading from '../../../components/UI/Loading';
import moment from 'moment';
import { useActiveWeb3React } from '../../../hooks';


function FixedAuction(props) {

    const { account, chainId } = useActiveWeb3React();
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

    let query = `
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

    const [fixedAuction, setFixedAuction] = useState([]);
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('')

    // const { fixedAuctionInstance } = useContext(fixedAuctionContext);
    // const { useQuery: useQueryFixed } = useSubgraph(fixedAuctionInstance);
    // const { error: fixedError, data: fixedData } = useQueryFixed(dutchQuery);

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
            subGraph = constants.FIXED_AUCTION_DATASOURCE[chainId]

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
                    status: props.auctionStatus === 'live' ? 'Live' : props.auctionStatus === 'past' ? 'Past' : 'Upcoming',
                    statusClass: props.auctionStatus === 'live' ? 'live' : props.auctionStatus === 'past' ? 'past' : 'upcoming',
                    title: element.type + ' Auction',
                    biddingDecimal: biddingDecimal,
                    yMaximum: yMaximum,
                    orders: orders,
                };
            });
            const resolvedArray = await Promise.all(arr);
            setFixedAuction(resolvedArray);
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
            ) : fixedAuction.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
                    {fixedAuction.map((item, index) => {
                        return <AuctionItem key={index} {...item} />;
                    })}
                </div>
            ) : (
                <div className="text-center mb-5 mt-5">No data found</div>
            )}
        </div>
    );
}

export default FixedAuction;
