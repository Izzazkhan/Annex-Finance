import React, { useEffect, useState, useContext, useMemo } from 'react';
import Web3 from 'web3';
import * as constants from '../../../utilities/constants';
const instance = new Web3(window.ethereum);
import Countdown from 'react-countdown';
import Table from './Table';
import DutchTable from './dutch-fixed-table';
import Progress from '../../../components/UI/Progress';
import AuctionStatus from './status';
import moment from 'moment';
import subGraphContext from '../../../contexts/subgraph';
import dutchAuctionContext from '../../../contexts/dutchAuction';
import fixedAuctionContext from '../../../contexts/fixedAuction';
import { gql } from '@apollo/client';
import { CONTRACT_ANNEX_AUCTION } from '../../../utilities/constants';
import {
  getAuctionContract,
  dutchAuctionContract,
  fixedAuctionContract,
  methods,
  getTokenContractWithDynamicAbi,
} from '../../../utilities/ContractService';
import BigNumber from 'bignumber.js';
import { useActiveWeb3React } from '../../../hooks';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';
import styled from 'styled-components';
import ArrowIcon from '../../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { maxHeight } from 'styled-system';

const ArrowDown = styled.button`
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #000000;
  border: 1px solid #2b2b2b;
  transition: 0.3s ease all;
  will-change: background-color, border, transform;
  width: 22px;
  height: 22px;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }

  &:hover {
    background-color: #101016;
  }
`;

const Wrapper = styled.div`
  .show-icon {
    right: calc(50% - 56px);
    bottom: 15%;
    z-index: 9;
  }
`;

const ArrowContainer = styled.div`
  transform: ${({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: 0.3s ease all;
  will-change: transform;
`;

const emptyAddr = '0x0000000000000000000000000000000000000000000000000000000000000000';
function Detail(props) {
  const [state, setState] = useState({
    auctionEndDate: moment().toDate().getTime(),
    auctionStartDate: moment().toDate().getTime(),
    detail: {},
    orders: [],
    auctionStatus: '',
    type: props.location.pathname.includes('batch') ? 'batch' : props.location.pathname.includes('dutch') ? 'dutch' : 'fixed',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  let query = gql`
  {
    auctions(where: { id : ${props.match.params.id} }) {
      id
      type
      userId {
        id
        address
      }
      auctioningToken {
        id
        name
        symbol
        decimals
      }
      biddingToken {
        id
        name
        symbol
        decimals
      }
      about {
        id
        telegram
        discord
        medium
        twitter
        description
        website
      }
      minFundingThresholdNotReached
      minimumPrice 
      maxAvailable 
      currentPrice 
      initialAuctionOrder
      minimumBiddingAmountPerOrder
      orderCancellationEndDate
      auctionStartDate
      auctionEndDate
      auctionedSellAmount
      minBuyAmount
      liquidity
      soldAuctioningTokens
      clearingPriceOrder
      minFundingThreshold
      isAtomicClosureAllowed
      estimatedTokenSold
      minimumBiddingAmountPerOrder
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
    }
    
    orders(where: { auctionId : "${props.match.params.id}" }){
      id
      userId {
        id,
        address
      }
      auctionId {
        id
      }
      price
      buyAmount
      sellAmount
      status
      claimableLP
      txHash
      blockNumber
      timestamp
      buyAmount_eth
      sellAmount_eth
      claimableLP_eth
      price_eth
      bidder{
        status
        lpTokens_eth
        biddingToken_eth
      }
      }
  }
`;

  let dutchQuery = gql`
  {
    auction(id: ${props.match.params.id}){
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
    website
  description
  telegram
  discord
  medium
  twitter
  }
  timestamp
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
    }
  }
`;
  // startingPrice
  // currentPriceOnOrder
  const { account } = useActiveWeb3React();
  const { apolloClient } = useContext(subGraphContext);
  const { apolloClient: dutchApollo } = useContext(dutchAuctionContext);
  const { apolloClient: fixedApollo } = useContext(fixedAuctionContext);

  const auctionContract = getAuctionContract(state.type);
  const dutchContract = dutchAuctionContract();
  const fixedContract = fixedAuctionContract();

  const [showDetails, setShowDetails] = useState(false);

  useEffect(async () => {
    getData();
  }, []);
  useEffect(async () => {
    try {
      if (
        data &&
        data.auctions &&
        data.auctions.length > 0 &&
        props.location.pathname.includes('batch')
      ) {
        let elem = data.auctions[0];
        let type = elem['type'];
        let auctionStatus = '';
        let auctionTokenId = elem['auctioningToken']['id'];
        let biddingTokenId = elem['biddingToken']['id'];
        let auctionSymbol = `${elem['auctioningToken']['symbol']}`;
        let auctionTokenName = elem['auctioningToken']['name'];
        let biddingSymbol = `${elem['biddingToken']['symbol']}`;
        let biddingTokenName = elem['biddingToken']['name'];
        let auctionDecimal = Number('1e' + elem['auctioningToken']['decimals']);
        let biddingDecimal = Number('1e' + elem['biddingToken']['decimals']);
        let auctionBalance = await getTokenBalance(auctionTokenId, auctionDecimal);
        let biddingBalance = await getTokenBalance(biddingTokenId, biddingDecimal);
        let totalAuction = elem['auctionedSellAmount_eth']
          ? new BigNumber(elem['auctionedSellAmount_eth']).dividedBy(auctionDecimal).toString()
          : 0;
        let totalAuctionedValue = elem['auctionedSellAmount'];
        let minimumPrice = new BigNumber(elem['minimumPrice_eth'])
          .dividedBy(biddingDecimal)
          .toNumber();
        let maxAvailable = new BigNumber(elem['maxAvailable_eth'])
          .dividedBy(auctionDecimal)
          .toNumber();
        let currentPrice = new BigNumber(elem['currentPrice_eth'])
          .dividedBy(biddingDecimal)
          .toNumber();
        let minBuyAmount = new BigNumber(elem['minimumBiddingAmountPerOrder_eth'])
          .dividedBy(biddingDecimal)
          .toNumber();
        minimumPrice = convertExponentToNum(minimumPrice);
        maxAvailable = convertExponentToNum(maxAvailable);
        currentPrice = Number(convertExponentToNum(currentPrice));
        minBuyAmount = convertExponentToNum(minBuyAmount);
        let minFundingThreshold = convertExponentToNum(
          new BigNumber(elem['minFundingThreshold_eth']).dividedBy(1000000).toNumber(),
        );
        let minFundingThresholdValue = elem['minFundingThreshold'];

        let minimumBiddingAmountPerOrder = new BigNumber(elem['minimumBiddingAmountPerOrder_eth'])
          .dividedBy(1000000)
          .toNumber();
        let minimumBiddingAmountPerOrderValue = elem['minimumBiddingAmountPerOrder'];

        let minFundingThresholdNotReached = elem['minFundingThresholdNotReached'];
        let estimatedTokenSold = convertExponentToNum(
          new BigNumber(elem['estimatedTokenSold_eth'])
            .dividedBy(auctionDecimal)
            .toNumber()
            .toFixed(2),
        );
        let estimatedTokenSoldValue = estimatedTokenSold + ' ' + auctionSymbol;
        let isAtomicClosureAllowed = elem['isAtomicClosureAllowed'];

        let orderCancellationEndDate = moment
          .unix(elem['orderCancellationEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        let auctionEndDateFormatted = moment
          .unix(elem['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');

        let auctionEndDate = elem['auctionEndDate'];
        let auctionStartDate = elem['auctionStartDate'];
        let endDateDiff = getDateDiff(auctionEndDate);
        let startDateDiff = getDateDiff(auctionStartDate);
        let isAllowCancellation = false;
        if (startDateDiff > 0) {
          auctionStatus = 'upcoming';
        } else if (endDateDiff < 0) {
          auctionStatus = 'completed';
        } else {
          auctionStatus = 'inprogress';
        }

        let cancelDateDiff = getDateDiff(elem['orderCancellationEndDate']);
        if (cancelDateDiff > 0) {
          isAllowCancellation = true;
        }
        let graphData = getGraphData({
          clearingPrice: elem['clearingPrice'],
          initialAuctionOrder: elem['initialAuctionOrder'],
          ordersList: data.orders,
          auctionDecimal: elem['auctioningToken']['decimals'],
          biddingDecimal: elem['biddingToken']['decimals'],
        });

        let orders = [];
        let placeHolderMinBuyAmount = 0;
        let placeholderSellAmount = 0;
        let orderLength = data.orders.length;
        let isAlreadySettle = elem['clearingPriceOrder'] !== emptyAddr;
        let lpTokenPromises = [];
        // if (auctionStatus == 'completed') {
        //   data.orders.forEach((order) => {
        //     lpTokenPromises.push(calculateLPTokens(order));
        //   });
        // }
        let lpTokenData = [];
        if (isAlreadySettle && auctionStatus == 'completed') {
          lpTokenData = await Promise.all(lpTokenPromises);
        }
        let userOrders = [];
        let otherUserOrders = [];
        let accountId = account ? account.toLowerCase() : '0x';
        data.orders.forEach((order, index) => {
          let userId = order.userId.address.toLowerCase();
          let auctionDivBuyAmount = new BigNumber(order['buyAmount_eth'])
            .dividedBy(auctionDecimal)
            .toString();
          let auctionDivSellAmount = new BigNumber(order['sellAmount_eth'])
            .dividedBy(biddingDecimal)
            .toString();
          let claimableLP = order['claimableLP'].split(' ')
          claimableLP = Number(claimableLP[0]).toFixed(18);
          let price = order['price'] ? order['price'] : 0;
          let priceSeparate = price.split(' ');
          price = Number(priceSeparate[0]).toFixed(8);
          let priceUnit = priceSeparate[1];
          if (orderLength - 1 === index) {
            placeHolderMinBuyAmount = Number(price);
            placeholderSellAmount = Number(auctionDivSellAmount) + 1;
            if (placeHolderMinBuyAmount > maxAvailable || placeholderSellAmount > maxAvailable) {
              placeHolderMinBuyAmount = maxAvailable;
              placeholderSellAmount = maxAvailable;
            }
          }

          if (userId === accountId) {
            userOrders.push({
              ...order,
              auctionDivBuyAmount,
              auctionDivSellAmount,
              auctionSymbol,
              biddingSymbol,
              lpToken: lpTokenData[index] ? lpTokenData[index] : 0,
              price: price,
              priceUnit: priceUnit,
              claimableLP: claimableLP
            });
          } else {
            otherUserOrders.push({
              ...order,
              auctionDivBuyAmount,
              auctionDivSellAmount,
              auctionSymbol,
              biddingSymbol,
              lpToken: lpTokenData[index] ? lpTokenData[index] : 0,
              price: price,
              priceUnit: priceUnit,
              claimableLP: claimableLP
            });
          }
        });
        orders = userOrders.concat(otherUserOrders);
        if (orderLength === 0) {
          placeHolderMinBuyAmount = minBuyAmount;
          placeholderSellAmount = minBuyAmount;
        }
        let detail = {
          auctionTokenId,
          biddingTokenId,
          auctionBalance,
          biddingBalance,
          minimumPrice,
          maxAvailable,
          currentPrice,
          type,
          id: elem.id,
          totalAuction,
          totalAuctionedValue,
          minBuyAmount,
          auctionTokenName,
          auctionSymbol,
          auctionDecimal,
          biddingSymbol,
          biddingTokenName,
          biddingDecimal,
          chartType: 'block',
          data: graphData,
          telegramLink: elem['about']['telegram'],
          discordLink: elem['about']['discord'],
          mediumLink: elem['about']['medium'],
          twitterLink: elem['about']['twitter'],
          status: auctionStatus,
          statusClass: auctionStatus,
          title: type + ' Auction',
          contract: CONTRACT_ANNEX_AUCTION[type.toLowerCase()]['address'],
          token: elem['auctioningToken']['id'],
          website: elem['about']['website'],
          description: elem['about']['description'],
          isAlreadySettle,
          isAllowCancellation,
          placeHolderMinBuyAmount,
          placeholderSellAmount,
          minFundingThreshold,
          minFundingThresholdValue,
          minimumBiddingAmountPerOrder,
          minimumBiddingAmountPerOrderValue,
          minFundingThresholdNotReached,
          estimatedTokenSold,
          estimatedTokenSoldValue,
          isAtomicClosureAllowed,
          orderCancellationEndDate,
          auctionEndDateFormatted,
        };
        setState({
          ...state,
          detail,
          auctionStartDate,
          auctionEndDate,
          orders,
          auctionStatus,
        });
        setLoading(false);
      } else {
        let elem = data;
        const auctioningToken =
          new instance.eth.Contract(
            JSON.parse(constants.CONTRACT_ABEP_ABI),
            elem.auctioningToken,
          );
        const biddingToken =
          new instance.eth.Contract(
            JSON.parse(constants.CONTRACT_ABEP_ABI),
            elem.biddingToken,
          );
        let type = elem['type'];
        let auctionStatus = '';
        let auctionTokenId = elem['auctioningToken'];
        let biddingTokenId = elem['biddingToken'];
        let auctionSymbol = await methods.call(auctioningToken.methods.symbol, []);
        let auctionTokenName = await methods.call(auctioningToken.methods.name, []);
        let biddingSymbol = await methods.call(biddingToken.methods.symbol, []);
        let auctionDecimal = await methods.call(auctioningToken.methods.decimals, []);
        let totalAuctionedValue = elem['auctionedSellAmount'] / Math.pow(10, auctionDecimal);
        totalAuctionedValue = convertExponentToNum(totalAuctionedValue);
        let biddingDecimal = await methods.call(biddingToken.methods.decimals, []);
        let minimumPrice = elem['amountMin1'] / Math.pow(10, biddingDecimal);
        let currentBalance =
          type === 'DUTCH' &&
          (await methods.call(dutchContract.methods.currentPrice, [props.match.params.id]));

        let currentPrice =
          type === 'DUTCH'
            ? currentBalance / Math.pow(10, biddingDecimal)
            : ((elem['amountMin1'] / elem['amountMax1']) * Math.pow(10, auctionDecimal)) /
            Math.pow(10, biddingDecimal);
        currentPrice = Number(convertExponentToNum(currentPrice));
        let amountMax1 = elem['amountMax1'];
        let amountMin1 = elem['amountMin1'];
        let auctionEndDateFormatted = moment
          .unix(elem['auctionEndDate'])
          .format('MM/DD/YYYY HH:mm:ss');
        let auctionEndDate = elem['auctionEndDate'];
        let auctionStartDate = elem['auctionStartDate'];
        let endDateDiff = getDateDiff(auctionEndDate);
        let startDateDiff = getDateDiff(auctionStartDate);
        if (startDateDiff > 0) {
          auctionStatus = 'upcoming';
        } else if (endDateDiff < 0) {
          auctionStatus = 'completed';
        } else {
          auctionStatus = 'inprogress';
        }
        let startingPrice = elem['startingPrice'] / Math.pow(10, auctionDecimal);
        Number(convertExponentToNum(startingPrice));
        let graphData = type === 'DUTCH' && [
          {
            value: startingPrice,
          },
          {
            value: currentPrice,
          },
        ];
        let orders = [];
        let placeHolderMinBuyAmount = 0;
        let placeholderSellAmount = 0;

        let userOrders = [];
        data.orders.forEach((order, index) => {
          let auctionDivBuyAmount = order['buyAmount'] / Math.pow(10, auctionDecimal);
          auctionDivBuyAmount = convertExponentToNum(auctionDivBuyAmount);
          let auctionDivSellAmount = order['sellAmount'] / Math.pow(10, biddingDecimal);
          auctionDivSellAmount = convertExponentToNum(auctionDivSellAmount);
          let price = order['buyAmount'] / Math.pow(10, auctionDecimal);
          price = convertExponentToNum(price);
          userOrders.push({
            ...order,
            price,
            auctionDivBuyAmount,
            auctionDivSellAmount,
            auctionSymbol,
            biddingSymbol,
          });
        });
        orders = userOrders;
        let detail = {
          auctionTokenId,
          biddingTokenId,
          minimumPrice,
          amountMax1,
          amountMin1,
          currentPrice,
          type,
          id: elem.about.id,
          totalAuctionedValue,
          auctionTokenName,
          auctionSymbol,
          auctionDecimal,
          biddingSymbol,
          biddingDecimal,
          chartType: 'line',
          data: type === 'DUTCH' ? graphData : [],
          telegramLink: elem['about']['telegram'],
          discordLink: elem['about']['discord'],
          mediumLink: elem['about']['medium'],
          twitterLink: elem['about']['twitter'],
          title: type + ' Auction',
          contract: CONTRACT_ANNEX_AUCTION[type.toLowerCase()]['address'],
          token: elem['auctioningToken'],
          website: elem['about']['website'],
          description: elem['about']['description'],
          placeHolderMinBuyAmount,
          placeholderSellAmount,
          auctionEndDateFormatted,
        };
        setState({
          ...state,
          detail,
          auctionStartDate,
          auctionEndDate,
          orders,
          auctionStatus,
        });
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
    }
  }, [data]);
  const getDateDiff = (endDate) => {
    endDate = moment.unix(endDate);
    let currentDate = moment();
    return endDate.diff(currentDate, 'seconds');
  };
  const getGraphData = ({
    clearingPrice,
    initialAuctionOrder,
    ordersList,
    auctionDecimal,
    biddingDecimal,
  }) => {
    let graphData = [];
    let { orders, clearingPriceOrder } = calculateClearingPrice(
      initialAuctionOrder,
      ordersList,
      auctionDecimal,
      biddingDecimal,
    );
    orders &&
      orders.forEach((item) => {
        graphData.push({
          ...item,
          isSuccessfull: item.price >= new BigNumber(clearingPrice),
        });
      });

    return graphData;
  };

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

  const getCurrentPriceDecimal = (auctionDecimal, biddingDecimal) => {
    // let decimal = 0;
    // if (auctionDecimal !== biddingDecimal) {
    //   decimal = auctionDecimal - biddingDecimal;
    // } else {
    //   decimal = biddingDecimal;
    // }
    // return Number('1e' + biddingDecimal);
    return 1;
  };
  const getData = () => {
    let apollo;
    if (props.location.pathname.includes('dutch')) {
      apollo = dutchApollo;
    } else if (props.location.pathname.includes('fixed')) {
      apollo = fixedApollo;
    } else {
      apollo = apolloClient;
    }
    try {
      setLoading(true);
      setData([]);
      setTimeout(() => {
        apollo
          .query({
            query: props.location.pathname.includes('batch') ? query : dutchQuery,
            variables: {},
          })
          .then((response) => {
            let { data } = response;
            console.log('response', data);
            if (props.location.pathname.includes('batch')) {
              setData(data);
            } else {
              setData(data.auction);
            }
          })
          .catch((err) => {
            setData([]);
            setLoading(false);
          });
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };
  const updateAuctionStatus = (auctionStatus) => {
    // setState({
    //   ...state,
    //   detail: { ...state.detail, status: auctionStatus, statusClass: auctionStatus },
    //   auctionStatus,
    // });
    getData();
  };
  const convertToHex = (data) => {
    let msg = '';
    for (var i = 0; i < data.length; i++) {
      var s = data.charCodeAt(i).toString(16);
      while (s.length < 2) {
        s = '0' + s;
      }
      msg += s;
    }
    return msg;
  };

  const encodeOrder = (userId, sellAmount, buyAmount) => {
    return (
      '0x' +
      new BigNumber(userId).toString(16).padStart(16, '0') +
      // buyAmount.padStart(24, '0') +
      new BigNumber(buyAmount).toString(16).padStart(24, '0') +
      // sellAmount.padStart(24, '0')
      new BigNumber(sellAmount).toString(16).padStart(24, '0')
    );
  };

  const calculateLPTokens = async (auction) => {
    return new Promise((resolve, reject) => {
      // console.log('auction: ', auction, {
      //   userId: auction.userId.id,
      //   buyAmount: auction.buyAmount,
      //   sellAmount: auction.sellAmount,
      // });
      // let encodedOrder = encodeOrder({userId: auction.userId.id, buyAmount: auction.buyAmount, sellAmount: auction.sellAmount});
      // auction.userId.id = 17;
      let encodedOrder = encodeOrder(
        auction.userId.id,
        auction.buyAmount_eth,
        auction.sellAmount_eth,
      );
      // let encodedOrder = encodeOrder(auction.userId.id, 0, 0);
      // console.log('encode order: ', [auction.auctionId.id, auction.userId.id, encodedOrder]);
      methods
        .call(auctionContract.methods.calculateLPTokens, [
          auction.auctionId.id,
          auction.userId.id,
          encodedOrder,
        ])
        .then((res) => {
          let lpToken = new BigNumber(res).dividedBy(Number('1e' + 18)).toString();
          lpToken = convertExponentToNum(lpToken);
          resolve(lpToken);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };
  const getTokenBalance = async (token, decimal) => {
    const tokenContract = getTokenContractWithDynamicAbi(token);
    let balanceOf = await methods.call(tokenContract.methods.balanceOf, [account]);
    balanceOf = new BigNumber(balanceOf).dividedBy(decimal).toNumber();
    return balanceOf;
  };

  const totalSellAmount =
    state.detail.data &&
    state.detail.data.reduce(function (acc, obj) {
      return acc + Number(obj.sellAmount);
    }, 0);

  return (
    <Wrapper>
      <div className="col-span-12 p-6 flex items-center">
        <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        <div className="text-gray text-xl ml-2">
          {state.detail.title} - Auction id# {state.detail.id}
        </div>
      </div>
      <div
        className="grid grid-cols-12 xl:grid-cols-10
        text-white bg-black mt-8  py-8 border border-lightGray rounded-md flex flex-row  justify-between relative"
      >
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col border-r border-lightGray ">
          {loading ? (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ) : (
            <h2 className="text-white mb-1 xl:text-xl md:text-lg font-bold text-primary">
              {state.detail.currentPrice ? Number(state.detail.currentPrice.toFixed(8)) : 0}{' '}
              {state.detail.auctionSymbol}-{state.detail.biddingSymbol}
            </h2>
          )}
          <div className="flex items-center text-white text-lg md:text-md ">
            Current Price{' '}
            <div className="tooltip relative">
              <img
                className="ml-3"
                src={require('../../../assets/images/info.svg').default}
                alt=""
              />
              <span className="label">Current Auctioned Token Price</span>
            </div>
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col ">
          <h2 className="flex items-center text-white mb-1 xl:text-xl md:text-lg font-bold text-blue">
            {loading ? (
              <div className="h-13 flex items-center justify-center px-4 py-2">
                <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
              </div>
            ) : state.detail.biddingSymbol ? (
              <img
                width="30"
                className="mr-2"
                src={
                  require(`../../../assets/images/coins/${state.detail.biddingSymbol.toLowerCase()}.png`)
                    .default
                }
                alt=""
              />
            ) : (
              ''
            )}{' '}
            {state.detail.biddingSymbol}
            <a
              href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${state.detail && state.detail.biddingTokenId
                }`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="ml-3"
                src={require('../../../assets/images/link.svg').default}
                alt=""
              />
            </a>
          </h2>
          <div className="flex items-center text-white text-lg md:text-md ">
            Bidding With{' '}
            <div className="tooltip relative">
              <img
                className="ml-3"
                src={require('../../../assets/images/info.svg').default}
                alt=""
              />
              <span className="label">Bidding Token</span>
            </div>
          </div>
        </div>
        <div className="hidden xl:block col-span-6 xl:col-span-2 lg:col-span-4 md:col-span-6 my-5 px-8 flex flex-col "></div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col border-r border-lightGray">
          <h2 className="flex items-center text-white mb-1 xl:text-xl md:text-lg font-bold text-primary">
            {state.detail.auctionSymbol ? (
              <img
                width="30"
                className="mr-2"
                src={
                  require(`../../../assets/images/coins/${state.detail.auctionSymbol.toLowerCase()}.png`)
                    .default
                }
                alt=""
              />
            ) : (
              ''
            )}{' '}
            {loading ? (
              <div className="h-13 flex items-center justify-center px-4 py-2">
                <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
              </div>
            ) : (
              `${state.detail.totalAuctionedValue}`
            )}
            <a
              href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${state.detail && state.detail.auctionTokenId
                }`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="ml-3"
                src={require('../../../assets/images/link.svg').default}
                alt=""
              />
            </a>
          </h2>
          <div className="flex items-center text-white text-lg md:text-md ">
            Total Auctioned{' '}
            <div className="tooltip relative">
              <img
                className="ml-3"
                src={require('../../../assets/images/info.svg').default}
                alt=""
              />
              <span className="label">Total Auctioned Token</span>
            </div>
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col ">
          <h2 className="text-white mb-1 xl:text-xl md:text-lg font-bold text-primary">
            {loading ? (
              <div className="h-13 flex items-center justify-center px-4 py-2">
                <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
              </div>
            ) : (
              `${new BigNumber(state.detail.minimumPrice).dp(11)} ${state.detail.auctionSymbol}-`
            )}

            <span className="text-blue">{state.detail.biddingSymbol}</span>
          </h2>
          <div className="flex items-center text-white text-lg md:text-md ">
            {' '}
            Min Bid Price{' '}
            <div className="tooltip relative">
              <img
                className="ml-3"
                src={require('../../../assets/images/info.svg').default}
                alt=""
              />
              <span className="label">Minimum Bid Price</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 text-center">
          <div className="relative xl:absolute timer flex flex-col justify-between items-center">
            {!loading ? (
              <Countdown
                date={
                  state.auctionStatus === 'upcoming'
                    ? state.auctionStartDate * 1000
                    : state.auctionEndDate * 1000
                }
                onComplete={() => updateAuctionStatus()}
                renderer={(props) => (
                  <ProgressBar
                    {...props}
                    label={state.auctionStatus === 'upcoming' ? 'STARTS IN' : 'ENDS IN'}
                    auctionEndDate={state.auctionEndDate * 1000}
                    auctionStartDate={state.auctionStartDate * 1000}
                  />
                )}
              />
            ) : (
              ''
            )}
          </div>
        </div>

        <div className="show-icon flex items-center justify-end text-right text-white absolute">
          <span className="mr-2 text-sm">{showDetails ? 'Less' : 'More Details'} </span>
          <ArrowDown onClick={() => setShowDetails((s) => !s)} className={'order-4 flex'}>
            <ArrowContainer active={showDetails}>
              <SVG src={ArrowIcon} />
            </ArrowContainer>
          </ArrowDown>
        </div>
      </div>

      {showDetails && props.location.pathname.includes('batch') ? (
        <div
          className="grid grid-cols-3
        text-white bg-black py-8 border-lightGray border-l border-r border-b rounded-md flex flex-row  justify-between relative"
        >
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex flex-col mb-5">
              <div className="text-white text-lg md:text-md font-bold">
                {state.detail.orderCancellationEndDate}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Last order cancelation date{' '}
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Last order cancelation date</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-white text-lg md:text-md font-bold">
                {state.detail.auctionEndDateFormatted}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Auction End Date
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Auction End Date</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex items-center mb-5">
              <div className="mr-2" style={{ width: 35, height: 35 }}>
                <CircularProgressbar
                  value={
                    totalSellAmount > 0
                      ? (totalSellAmount / Number(state.detail.minFundingThreshold)) * 100
                      : 0
                  }
                  text={`${totalSellAmount > 0
                    ? (
                      (totalSellAmount / Number(state.detail.minFundingThreshold)) *
                      100
                    ).toFixed(0)
                    : 0
                    }%`}
                  styles={{
                    root: {},
                    path: {
                      stroke: `rgb(35,110,97)`,
                      strokeLinecap: 'butt',
                      transition: 'stroke-dashoffset 0.5s ease 0s',
                      transform: 'rotate(0.25turn)',
                      transformOrigin: 'center center',
                    },
                    trail: {
                      stroke: '#d6d6d6',
                      strokeLinecap: 'butt',
                      transform: 'rotate(0.25turn)',
                      transformOrigin: 'center center',
                    },
                    text: {
                      fill: '#fff',
                      fontSize: '28px',
                    },
                    background: {
                      fill: '#3e98c7',
                    },
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="text-white text-lg md:text-md font-bold">
                  {state.detail.minFundingThresholdValue}
                </div>
                <div className="flex items-center text-white text-md md:text-sm">
                  Minimum funding
                  <div className="tooltip relative">
                    <img
                      className="ml-3"
                      src={require('../../../assets/images/info.svg').default}
                      alt=""
                    />
                    <span className="label">Minimum funding</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center mb-5">
              <div className="mr-2" style={{ width: 35, height: 35 }}>
                <CircularProgressbar
                  value={
                    (state.detail.estimatedTokenSold / Number(state.detail.totalAuction)) * 100
                  }
                  text={`${(
                    (state.detail.estimatedTokenSold / Number(state.detail.totalAuction)) *
                    100
                  ).toFixed(0)}%`}
                  styles={{
                    root: {},
                    path: {
                      stroke: `rgb(35,110,97)`,
                      strokeLinecap: 'butt',
                      transition: 'stroke-dashoffset 0.5s ease 0s',
                      transform: 'rotate(0.25turn)',
                      transformOrigin: 'center center',
                    },
                    trail: {
                      stroke: '#d6d6d6',
                      strokeLinecap: 'butt',
                      transform: 'rotate(0.25turn)',
                      transformOrigin: 'center center',
                    },
                    text: {
                      fill: '#fff',
                      fontSize: '28px',
                    },
                    background: {
                      fill: '#3e98c7',
                    },
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="text-white text-lg md:text-md font-bold">
                  {state.detail.estimatedTokenSoldValue}
                </div>
                <div className="flex items-center text-white text-md md:text-sm">
                  Estimated tokens sold{' '}
                  <div className="tooltip relative">
                    <img
                      className="ml-3"
                      src={require('../../../assets/images/info.svg').default}
                      alt=""
                    />
                    <span className="label">Estimated tokens sold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex flex-col mb-5">
              <div className="text-white text-lg md:text-md font-bold">
                {state.detail.isAtomicClosureAllowed === true ? 'Enabled' : 'Disabled'}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Atomic closure{' '}
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Atomic closure</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-white text-lg md:text-md font-bold">
                {state.detail.minimumBiddingAmountPerOrderValue}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Min bidding amount per order{' '}
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Min bidding amount per order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : showDetails ? (
        <div
          className="grid grid-cols-3
    text-white bg-black py-8 border-lightGray border-l border-r border-b rounded-md flex flex-row  justify-between relative"
        >
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex flex-col">
              <div className="text-white text-lg md:text-md font-bold">
                {state.detail.totalAuctionedValue} {state.detail.auctionSymbol}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Amount For Sale
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Amount For Sale</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex flex-col">
              <div className="text-white text-lg md:text-md font-bold">
                {state.orders &&
                  state.orders.reduce(function (acc, obj) {
                    return acc + Number(obj.auctionDivSellAmount);
                  }, 0)}{' '}
                {state.detail.biddingSymbol}
              </div>
              <div className="flex items-center text-white text-md md:text-sm">
                Amount Raised
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Amount Raised</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1 my-5 px-8 flex flex-col ">
            <div className="flex flex-col">
              <div className="text-white text-lg md:text-md font-bold">{state.orders.length}</div>
              <div className="flex items-center text-white text-md md:text-sm">
                Participants
                <div className="tooltip relative">
                  <img
                    className="ml-3"
                    src={require('../../../assets/images/info.svg').default}
                    alt=""
                  />
                  <span className="label">Participants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : undefined}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-15">
        <div className="col-span-4 bg-fadeBlack rounded-2xl flex flex-col justify-between">
          <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
            <div className="flex flex-col items-start justify-start ">
              <div className="text-white text-2xl ">{state.detail.title}</div>
              <div className="text-base font-normal">Auction id#{state.detail.id}</div>
            </div>
            <div className="flex flex-col items-center ">
              <div className="">
                <span className={`${state.detail.statusClass}-icon`}></span>
              </div>
              <div className="text-sm">
                {state.detail.status &&
                  (state.detail.status == 'inprogress'
                    ? 'In Progress'
                    : state.detail.status.charAt(0).toUpperCase() + state.detail.status.slice(1))}
              </div>
            </div>
          </div>
          <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Contract</div>
              <div className="text-xl font-medium">
                {loading ? (
                  <div className="h-13 flex items-center justify-center px-4 py-2">
                    <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
                  </div>
                ) : (
                  <div className='flex items-center'>
                    <a
                      href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${state.detail.contract}#code`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ wordBreak: 'break-all', marginRight: '5px' }}
                    >
                      <img
                        className=""
                        src={require('../../../assets/images/link.svg').default}
                        alt=""
                      />
                    </a>
                    {state.detail.contract}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Token</div>
              <div className="text-xl font-medium">
                {loading ? (
                  <div className="h-13 flex items-center justify-center px-4 py-2">
                    <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
                  </div>
                ) : (
                  <div className='flex items-center'>
                    <a
                      href={`${process.env.REACT_APP_BSC_EXPLORER}/token/${state.detail.token}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ wordBreak: 'break-all', marginRight: '5px' }}
                    >
                      <img
                        className=""
                        src={require('../../../assets/images/link.svg').default}
                        alt=""
                      />
                    </a>
                    {state.detail.token}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Website</div>
              <div className="text-xl font-medium">
                {loading ? (
                  <div className="h-13 flex items-center justify-center px-4 py-2">
                    <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
                  </div>
                ) : (
                  <a href={state.detail.website} target="_blank" rel="noreferrer">
                    {state.detail.website}
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col  mb-7">
              <div className="text-lg font-medium mb-3">About</div>
              <div className="flex flex-wrap justify-between space-x-2 ">
                <MediaIcon name="Telegram" src="telegram" url={state.detail.telegramLink} />
                <MediaIcon name="Github" src="discord" url={state.detail.discordLink} />
                <MediaIcon name="Medium" src="medium" url={state.detail.mediumLink} />
                <MediaIcon name="Twitter" src="telegram" url={state.detail.twitterLink} />
              </div>
            </div>
          </div>
          <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
            <div className="flex flex-col mb-7">
              <div className="text-lg font-medium mb-2">Description</div>
              <div className="text-lg font-normal">{state.detail.description}</div>
            </div>
          </div>
          <div className="text-white flex flex-row items-stretch justify-between items-center p-6 ">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">{state.detail.type} auction</div>
            </div>
          </div>
        </div>
        <div className="col-span-4 bg-fadeBlack rounded-2xl flex flex-col justify-between">
          <AuctionStatus
            auctionEndDate={state.auctionEndDate}
            auctionStartDate={state.auctionStartDate}
            detail={state.detail}
            minBuyAmount={state.detail.minBuyAmount}
            maxAvailable={state.detail.maxAvailable}
            biddingSymbol={state.detail.biddingSymbol}
            account={account}
            auctionId={state.detail.id}
            biddingDecimal={state.detail.biddingDecimal}
            auctionDecimal={state.detail.auctionDecimal}
            auctionStatus={state.auctionStatus}
            auctionContract={
              state.detail.type === 'DUTCH'
                ? dutchContract
                : state.detail.type === 'FIXED'
                  ? fixedContract
                  : auctionContract
            }
            auctionAddr={CONTRACT_ANNEX_AUCTION[state.type]['address']}
            getData={getData}
            orders={state.orders}
            auctionType={state.detail.type}
          />
        </div>
      </div>
      {props.location.pathname.includes('batch') ? (
        <Table
          data={state.orders}
          loading={loading}
          isAlreadySettle={state.detail['isAlreadySettle']}
          isAllowCancellation={state.detail['isAllowCancellation']}
          // auctionContract={state.detail.type === 'DUTCH' ? dutchContract : auctionContract}
          auctionContract={auctionContract}
          account={account}
          auctionStatus={state.auctionStatus}
          getData={getData}
          auctionId={state.detail.id}
        />
      ) : (
        <DutchTable
          data={state.orders}
          loading={loading}
          isAllowCancellation={false}
          // auctionContract={auctionContract}
          auctionContract={state.detail.type === 'DUTCH' ? dutchContract : fixedContract}
          account={account}
          auctionStatus={state.auctionStatus}
          getData={getData}
          auctionId={state.detail.id}
        />
      )}
    </Wrapper>
  );
}

const ProgressBar = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
  auctionEndDate,
  auctionStartDate,
  label,
}) => {
  // let percentage =
  //   ((currentTimeStamp - auctionStartDate) / (auctionEndDate - auctionStartDate)) * 100;

  const calculatePercentage = (auctionStartDate, auctionEndDate) => {
    let currentTimeStamp = Date.now();
    var total = auctionEndDate - auctionStartDate;
    var current = currentTimeStamp - auctionStartDate;
    // console.log('start', auctionStartDate);
    // console.log('end', auctionEndDate);
    // console.log('today', currentTimeStamp);
    // console.log('current', current);
    // console.log('total', total);
    return Math.round((current / total) * 100);
  };
  let percentage = calculatePercentage(auctionStartDate, auctionEndDate);
  return (
    <div className="relative ">
      <Progress
        wrapperClassName=""
        type="circle"
        width={200}
        percent={completed ? 100 : percentage || 0}
        strokeWidth={4}
        color="#FFAB2D"
        trailColor="#101016"
      />
      <div
        className={`flex flex-col items-center absolute top-1/2 left-1/2 
                    w-full h-full pt-14 md:pt-12 pb-12 md:pb-8 px-4
                    transform -translate-x-1/2 -translate-y-1/2 justify-center`}
      >
        <div
          className={`flex flex-col items-center absolute top-1/2 left-1/2 
                            w-full h-full pt-14 md:pt-12 pb-12 md:pb-8 px-4
                            transform -translate-x-1/2 -translate-y-1/2 justify-center`}
        >
          <div className="flex flex-col items-center flex-grow text-center justify-center">
            <div className="text-primary font-bold text-2xl ">
              {' '}
              {days}:{hours}:{minutes}:{seconds}
            </div>
            <div className="text-white font-bold text-2xl">{completed ? 'Completed' : label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaIcon = ({ name, src, url }) => {
  return (
    <div className="flex items-center text-xl font-medium underline mb-3">
      <img className="mr-3" src={require(`../../../assets/images/${src}.svg`).default} alt="" />{' '}
      <a href={url} target="_blank" rel="noreferrer">
        {name}
      </a>
    </div>
  );
};
export default Detail;
