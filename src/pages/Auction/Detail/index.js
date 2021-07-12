import React, { useEffect, useState, useContext } from 'react';
import Countdown from 'react-countdown';
import Table from './Table';
import Progress from '../../../components/UI/Progress';
import AuctionStatus from './status';
import moment from 'moment';
import subGraphContext from '../../../contexts/subgraph';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';
import { CONTRACT_ANNEX_AUCTION } from '../../../utilities/constants';
import BigNumber from 'bignumber.js';

function Detail(props) {
  const [state, setState] = useState({
    auctionEndDate: moment().add(1, 'minutes').toDate().getTime(),
    auctionStartDate: moment().toDate().getTime(),
    // detail: {
    //   chartType: 'line',
    //   type: 'Batch',
    //   data: [
    //     {
    //       name: '',
    //       uv: 4000,
    //       pv: 2400,
    //       amt: 2400,
    //     },
    //     {
    //       name: '',
    //       uv: 3000,
    //       pv: 398,
    //       amt: 2210,
    //     },
    //   ],
    //   status: 'Live',
    //   statusClass: 'live',
    //   title: 'Non-Fungible Bible',
    //   id: '1DPRD',
    //   contract: 'OXICFO...IFBC74C57D',
    //   token: 'OXI032...CC1FFE315B',
    //   website: 'https://google.com',
    //   description: `Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in, iaculis eu lectus.
    //     Aenean a urna vitae risus ullamcorper feugiat sed non quam. Fusce in rhoncus nibh.`,
    // },
    detail: {},
  });
  const subGraphInstance = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const { error, loading, data } = useQuery(gql`
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
        minimumPrice 
        maxAvailable 
        currentPrice 
        minimumBiddingAmountPerOrder
        orderCancellationEndDate
        auctionEndDate
        auctionedSellAmount
        minBuyAmount
        liquidity
        soldAuctioningTokens
        clearingPriceOrder
        finished
      }
    }
  `);
  useEffect(() => {
    if (data && data.auctions) {
      let elem = data.auctions[0];
      let type = elem['type'];
      let auctionDecimal = Number('1e' + elem['auctioningToken']['decimals']);
      let totalAuction = new BigNumber(elem['soldAuctioningTokens'])
        .dividedBy(auctionDecimal)
        .toString();
      let minimumPrice = new BigNumber(elem['minimumPrice']).dividedBy(auctionDecimal).toString();
      let maxAvailable = new BigNumber(elem['maxAvailable']).dividedBy(auctionDecimal).toString();
      let currentPrice = new BigNumber(elem['currentPrice']).dividedBy(auctionDecimal).toString();
      let minBuyAmount = new BigNumber(elem['minBuyAmount']).dividedBy(auctionDecimal).toString();
      let auctionSymbol = `${elem['auctioningToken']['symbol']}`;
      let auctionTokenName = elem['auctioningToken']['name'];
      let biddingSymbol = `${elem['biddingToken']['symbol']}`;
      let biddingTokenName = elem['biddingToken']['name'];
      let auctionEndDate = moment.unix(elem['auctionEndDate']).toDate().getTime();
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
        biddingSymbol,
        biddingTokenName,
        chartType: 'block',
        data: [
          {
            name: '1',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: false,
          },
          {
            name: '2',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: false,
          },
          {
            name: '3',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: false,
          },
          {
            name: '4',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: true,
          },
          {
            name: '5',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: true,
          },
          {
            name: '6',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: true,
          },
        ],
        status: 'Live',
        statusClass: 'live',
        title: type + ' Auction',
        contract: CONTRACT_ANNEX_AUCTION[type.toLowerCase()]['address'],
        token: elem['auctioningToken']['id'],
        website: 'https://google.com',
        description: `Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in, iaculis eu lectus.
          Aenean a urna vitae risus ullamcorper feugiat sed non quam. Fusce in rhoncus nibh.`,
      };
      setState({
        ...state,
        detail,
        auctionEndDate: auctionEndDate,
      });
    }
  }, [data]);
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
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            {state.detail.currentPrice} {state.detail.auctionSymbol}/{state.detail.biddingSymbol}
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Current Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="flex items-center text-white mb-1 xl:text-2xl md:text-xl font-bold text-blue">
            {state.detail.biddingSymbol ? (
              <img
                width="40"
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
            {`${state.detail.totalAuction} ${state.detail.auctionSymbol}`}
            <img className="ml-3" src={require('../../../assets/images/link.svg').default} alt="" />
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Total Auctions{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            {state.detail.minimumPrice} {state.detail.auctionSymbol}/
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
            <Countdown
              date={state.auctionEndDate}
              renderer={(props) => (
                <ProgressBar
                  {...props}
                  auctionEndDate={state.auctionEndDate}
                  auctionStartDate={state.auctionStartDate}
                />
              )}
            />
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
              <div className="text-xl font-medium">{state.detail.contract}</div>
            </div>
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Token</div>
              <div className="text-xl font-medium">{state.detail.token}</div>
            </div>
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Website</div>
              <div className="text-xl font-medium">{state.detail.website}</div>
            </div>
            <div className="flex flex-col  mb-7">
              <div className="text-lg font-medium mb-3">About</div>
              <div className="flex flex-wrap justify-between space-x-2 ">
                <MediaIcon name="Telegram" src="telegram" />
                <MediaIcon name="Discord" src="discord" />
                <MediaIcon name="Medium" src="medium" />
                <MediaIcon name="Twitter" src="telegram" />
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
            detail={state.detail}
            label="Auction Progress"
            minBuyAmount={state.detail.minBuyAmount}
            maxAvailable={state.detail.maxAvailable}
          />
        </div>
      </div>
      <Table />
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
}) => {
  let currentTimeStamp = Date.now();
  let percentage =
    ((currentTimeStamp - auctionStartDate) / (auctionEndDate - auctionStartDate)) * 100;
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
            <div className="text-white font-bold text-3xl">
              {completed ? 'Completed' : 'ENDS IN'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaIcon = ({ name, src }) => {
  return (
    <div className="flex items-center text-xl font-medium underline mb-3">
      <img className="mr-3" src={require(`../../../assets/images/${src}.svg`).default} alt="" />{' '}
      {name}
    </div>
  );
};
export default Detail;
