import React, { useEffect, useState, useContext } from 'react';
import Countdown from 'react-countdown';
import Table from './Table';
import Progress from '../../../components/UI/Progress';
import AuctionStatus from './status';
import moment from 'moment';
import subGraphContext from '../../../contexts/subgraph';
import { gql } from '@apollo/client';
import { CONTRACT_ANNEX_AUCTION } from '../../../utilities/constants';
import { getAuctionContract, methods } from '../../../utilities/ContractService';
import BigNumber from 'bignumber.js';
import { useActiveWeb3React } from '../../../hooks';
import { calculateClearingPrice } from '../../../utilities/graphClearingPrice';

const emptyAddr = '0x0000000000000000000000000000000000000000000000000000000000000000';
function Detail(props) {
  const [state, setState] = useState({
    auctionEndDate: moment().toDate().getTime(),
    auctionStartDate: moment().toDate().getTime(),
    detail: {},
    orders: [],
    auctionStatus: '',
    type: 'batch',
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
      minimumPrice 
      maxAvailable 
      currentPrice 
      minimumBiddingAmountPerOrder
      orderCancellationEndDate
      auctionStartDate
      auctionEndDate
      auctionedSellAmount
      minBuyAmount
      liquidity
      soldAuctioningTokens
      clearingPriceOrder
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
      buyAmount
      sellAmount
      status
      claimableLP
      txHash
      blockNumber
      timestamp
      bidder{
        status
      }
      }
  }
`;
  const { account } = useActiveWeb3React();
  const { apolloClient } = useContext(subGraphContext);
  const auctionContract = getAuctionContract(state.type);

  useEffect(async () => {
    getData();
  }, []);
  useEffect(async () => {
    if (data && data.auctions) {
      let elem = data.auctions[0];
      let type = elem['type'];
      let auctionStatus = '';
      let auctionDecimal = Number('1e' + elem['auctioningToken']['decimals']);
      let biddingDecimal = Number('1e' + elem['biddingToken']['decimals']);
      let currentPriceDecimal = getCurrentPriceDecimal(
        elem['auctioningToken']['decimals'],
        elem['biddingToken']['decimals'],
      );
      let totalAuction = elem['auctionedSellAmount']
        ? new BigNumber(elem['auctionedSellAmount']).dividedBy(auctionDecimal).toString()
        : 0;
      let minimumPrice = new BigNumber(elem['minimumPrice'])
        .dividedBy(currentPriceDecimal)
        .toNumber();
      let maxAvailable = new BigNumber(elem['maxAvailable']).dividedBy(auctionDecimal).toNumber();
      let currentPrice = new BigNumber(elem['currentPrice'])
        .dividedBy(currentPriceDecimal)
        .toNumber();
      let minBuyAmount = new BigNumber(elem['minimumBiddingAmountPerOrder'])
        .dividedBy(biddingDecimal)
        .toNumber();
      minimumPrice = convertExponentToNum(minimumPrice);
      maxAvailable = convertExponentToNum(maxAvailable);
      currentPrice = convertExponentToNum(currentPrice);
      minBuyAmount = convertExponentToNum(minBuyAmount);
      let auctionSymbol = `${elem['auctioningToken']['symbol']}`;
      let auctionTokenName = elem['auctioningToken']['name'];
      let biddingSymbol = `${elem['biddingToken']['symbol']}`;
      let biddingTokenName = elem['biddingToken']['name'];
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
      data.orders.forEach((order) => {
        lpTokenPromises.push(calculateLPTokens(order));
      });
      let lpTokenData = [];
      if (isAlreadySettle) {
        lpTokenData = await Promise.all(lpTokenPromises);
        console.log('lpTokenData', lpTokenData);
      }
      data.orders.forEach((order, index) => {
        let auctionDivBuyAmount = new BigNumber(order['buyAmount'])
          .dividedBy(auctionDecimal)
          .toString();
        let auctionDivSellAmount = new BigNumber(order['sellAmount'])
          .dividedBy(biddingDecimal)
          .toString();
        if (orderLength - 1 === index) {
          placeHolderMinBuyAmount = Number(auctionDivBuyAmount) + 1;
          placeholderSellAmount = Number(auctionDivSellAmount) + 1;
          if (placeHolderMinBuyAmount > maxAvailable || placeholderSellAmount > maxAvailable) {
            placeHolderMinBuyAmount = maxAvailable;
            placeholderSellAmount = maxAvailable;
          }
        }
        orders.push({
          ...order,
          auctionDivBuyAmount,
          auctionDivSellAmount,
          auctionSymbol,
          biddingSymbol,
          lpToken: lpTokenData[index] ? lpTokenData[index] : 0,
        });
      });

      if (orderLength === 0) {
        placeHolderMinBuyAmount = minBuyAmount;
        placeholderSellAmount = minBuyAmount;
      }
      let detail = {
        minimumPrice,
        maxAvailable,
        currentPrice,
        type,
        id: elem.id,
        totalAuction,
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
  }, [data]);
  const getDateDiff = (endDate) => {
    endDate = moment.unix(endDate);
    let currentDate = moment();
    return endDate.diff(currentDate, 'seconds');
  };
  const getGraphData = ({ ordersList, auctionDecimal, biddingDecimal }) => {
    let graphData = [];
    let { orders, clearingPriceOrder } = calculateClearingPrice(
      ordersList,
      auctionDecimal,
      biddingDecimal,
    );
    orders &&
      orders.forEach((item) => {
        graphData.push({
          ...item,
          isSuccessfull: item.price >= clearingPriceOrder.price,
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
    try {
      setLoading(true);
      setData([]);
      apolloClient
        .query({
          query: query,
          variables: {},
        })
        .then((response) => {
          let { data } = response;
          setData(data);
        })
        .catch((err) => {
          setData([]);
          setLoading(false);
        });
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
  const calculateLPTokens = async (auction) => {
    return new Promise((resolve, reject) => {
      methods
        .call(auctionContract.methods.calculateLPTokens, [auction.auctionId.id, auction.sellAmount])
        .then((res) => {
          let lpToken = new BigNumber(res).dividedBy(Number('1e' + 18)).toString();
          lpToken = convertExponentToNum(lpToken);
          resolve(lpToken);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  return (
    <div>
      <div className="col-span-12 p-6 flex flex-col">
        <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        <div className="text-gray text-2xl ">
          {state.detail.title} - Auction id# {state.detail.id}
        </div>
      </div>
      <div
        className="grid grid-cols-12 xl:grid-cols-10
        text-white bg-black mt-8  py-10 border border-lightGray rounded-md flex flex-row  justify-between relative"
      >
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col border-r border-lightGray ">
          {loading ? (
            <div className="h-13 flex items-center justify-center px-4 py-2">
              <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
            </div>
          ) : (
            <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
              {state.detail.currentPrice} {state.detail.auctionSymbol}/{state.detail.biddingSymbol}
            </h2>
          )}
          <div className="flex items-center text-white text-xl md:text-lg ">
            Current Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="flex items-center text-white mb-1 xl:text-2xl md:text-xl font-bold text-blue">
            {loading ? (
              <div className="h-13 flex items-center justify-center px-4 py-2">
                <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
              </div>
            ) : state.detail.biddingSymbol ? (
              <img
                width="40"
                className="mr-2"
                src={require(`../../../assets/images/coins/${state.detail.biddingSymbol.toLowerCase()}.png`).default}
                alt=""
              />
            ) : (
              ''
            )}{' '}
            {state.detail.biddingSymbol}
            <img className="ml-3" src={require('../../../assets/images/link.svg').default} alt="" />
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Bidding With{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="hidden xl:block col-span-6 xl:col-span-2 lg:col-span-4 md:col-span-6 my-6 px-8 flex flex-col "></div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col border-r border-lightGray">
          <h2 className="flex items-center text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            {state.detail.auctionSymbol ? (
              <img
                width="40"
                className="mr-2"
                src={require(`../../../assets/images/coins/${state.detail.auctionSymbol.toLowerCase()}.png`).default}
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
              `${state.detail.totalAuction} ${state.detail.auctionSymbol}`
            )}
            <img className="ml-3" src={require('../../../assets/images/link.svg').default} alt="" />
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Total Auctioned{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            {loading ? (
              <div className="h-13 flex items-center justify-center px-4 py-2">
                <div className="animate-pulse rounded-lg w-24 bg-lightGray w-full flex items-center px-8 py-3 justify-end" />
              </div>
            ) : (
              `${state.detail.minimumPrice} ${state.detail.auctionSymbol}/`
            )}

            <span className="text-blue">{state.detail.biddingSymbol}</span>
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            {' '}
            Min Bid Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
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
      </div>
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
              <div className="text-sm">{state.detail.status}</div>
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
                  state.detail.contract
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
                  state.detail.token
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
                  state.detail.website
                )}
              </div>
            </div>
            <div className="flex flex-col  mb-7">
              <div className="text-lg font-medium mb-3">About</div>
              <div className="flex flex-wrap justify-between space-x-2 ">
                <MediaIcon name="Telegram" src="telegram" url={state.detail.telegramLink} />
                <MediaIcon name="Discord" src="discord" url={state.detail.discordLink} />
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
            auctionContract={auctionContract}
            auctionAddr={CONTRACT_ANNEX_AUCTION[state.type]['address']}
            getData={getData}
          />
        </div>
      </div>
      <Table
        data={state.orders}
        loading={loading}
        isAlreadySettle={state.detail['isAlreadySettle']}
        isAllowCancellation={state.detail['isAllowCancellation']}
        auctionContract={auctionContract}
        account={account}
        auctionStatus={state.auctionStatus}
        getData={getData}
      />
    </div>
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
        width={250}
        percent={completed ? 100 : percentage || 0}
        strokeWidth={4}
        color="#FFAB2D"
        trailColor="#101016"
      />
      <div
        className={`flex flex-col items-center absolute top-1/2 left-1/2 
                    w-full h-full pt-18 md:pt-14 pb-14 md:pb-10 px-4
                    transform -translate-x-1/2 -translate-y-1/2 justify-center`}
      >
        <div
          className={`flex flex-col items-center absolute top-1/2 left-1/2 
                            w-full h-full pt-18 md:pt-14 pb-14 md:pb-10 px-4
                            transform -translate-x-1/2 -translate-y-1/2 justify-center`}
        >
          <div className="flex flex-col items-center flex-grow text-center justify-center">
            <div className="text-primary font-bold text-3xl ">
              {' '}
              {days}:{hours}:{minutes}:{seconds}
            </div>
            <div className="text-white font-bold text-3xl">{completed ? 'Completed' : label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaIcon = ({ name, src, url }) => {
  return (
    <div className="flex items-center text-xl font-medium underline mb-3">
      <img className="mr-3" src={require(`../../../assets/images/${src}.svg`).default} alt="" /> <a href={url}>{name}</a>
    </div>
  );
};
export default Detail;
