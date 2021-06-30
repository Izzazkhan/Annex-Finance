import React, { useState } from 'react';
import Countdown from 'react-countdown';
import Table from './Table';
import Progress from '../../../components/UI/Progress';
import AuctionStatus from './status';
import moment from 'moment';

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
    detail: {
      chartType: 'block',
      type: 'Batch',
      data: [
        {
          name: 'Page A',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Page B',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          name: 'Page D',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ],
      status: 'Live',
      statusClass: 'live',
      title: 'Non-Fungible Bible',
      id: '1DPRD',
      contract: 'OXICFO...IFBC74C57D',
      token: 'OXI032...CC1FFE315B',
      website: 'https://google.com',
      description: `Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in, iaculis eu lectus.
        Aenean a urna vitae risus ullamcorper feugiat sed non quam. Fusce in rhoncus nibh.`,
    },
  });
  return (
    <div>
      <div className="col-span-12 p-6 flex flex-col">
        <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        <div className="text-gray text-2xl ">
          {state.detail.title} - Auction id# {state.detail.id}
        </div>
      </div>
      <div className="grid grid-cols-12 xl:grid-cols-10
        text-white bg-black mt-8  py-10 border border-lightGray rounded-md flex flex-row  justify-between relative">
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col border-r border-lightGray ">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            850 WETH/Rip
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Current Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="flex items-center text-white mb-1 xl:text-2xl md:text-xl font-bold text-blue">
            <img
              className="mr-2"
              src={require('../../../assets/images/ripple.svg').default}
              alt=""
            />{' '}
            Ripple{' '}
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
            250 WETH{' '}
            <img className="ml-3" src={require('../../../assets/images/link.svg').default} alt="" />
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Total Auctions{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col ">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            600 WETH/<span className="text-blue">Ripple</span>
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
        percent={percentage || 0}
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
