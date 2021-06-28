import React from 'react';
import Countdown from 'react-countdown';
import Table from './Table';
import Progress from '../../../components/UI/Progress';
import AuctionStatus from './status';
import moment from 'moment';

const auctionEndDate = moment().add(1, 'minutes').toDate().getTime();
const auctionStartDate = moment().toDate().getTime();

function Detail(props) {
  return (
    <div>
      <div className="col-span-12 p-6 flex flex-col">
        <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        <div className="text-gray text-2xl ">Non-Fungible Bible - Auction id# 1DPRC</div>
      </div>
      <div className="text-white bg-black mt-8  py-10 border border-lightGray rounded-md flex flex-row justify-between relative">
        <div className="col-span-6 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col border-r border-lightGray flex-1">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">850 WETH/Rip</h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Current Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col flex-1">
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
        <div className="col-span-6 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col flex-1"></div>
        <div className="timer flex flex-col justify-between items-center">
          <Countdown
            date={auctionEndDate}
            renderer={(props) => (
              <ProgressBar
                {...props}
                auctionEndDate={auctionEndDate}
                auctionStartDate={auctionStartDate}
              />
            )}
          />
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col border-r border-lightGray flex-1">
          <h2 className="flex items-center text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            250 WETH{' '}
            <img className="ml-3" src={require('../../../assets/images/link.svg').default} alt="" />
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            Total Auctions{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6 my-6 px-8 flex flex-col flex-1">
          <h2 className="text-white mb-1 xl:text-2xl md:text-xl font-bold text-primary">
            600 WETH/<span className="text-blue">Ripple</span>
          </h2>
          <div className="flex items-center text-white text-xl md:text-lg ">
            {' '}
            Min Bid Price{' '}
            <img className="ml-3" src={require('../../../assets/images/info.svg').default} alt="" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-15">
        <div className="col-span-4 bg-fadeBlack rounded-2xl flex flex-col ">
          <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
            <div className="flex flex-col items-start justify-start ">
              <div className="text-white text-2xl ">Non-Fungible Bible</div>
              <div className="text-base font-normal">Auction id#1DPRC</div>
            </div>
            <div className="flex flex-col items-center ">
              <div className="">
                <span className="upcoming-icon"></span>
              </div>
              <div className="text-sm">Upcoming</div>
            </div>
          </div>
          <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Contract</div>
              <div className="text-xl font-medium">OXICFO...IFBC74C57D</div>
            </div>
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Token</div>
              <div className="text-xl font-medium">OXI032...CC1FFE315B</div>
            </div>
            <div className="flex flex-col mb-8">
              <div className="text-md font-medium mb-0">Website</div>
              <div className="text-xl font-medium">https://google.com</div>
            </div>
            <div className="flex flex-col  mb-7">
              <div className="text-lg font-medium mb-3">About</div>
              <div className="flex flex-wrap justify-between space-x-2 ">
                <div className="flex items-center text-xl font-medium underline">
                  <img
                    className="mr-3"
                    src={require('../../../assets/images/telegram.svg').default}
                    alt=""
                  />{' '}
                  Telegram
                </div>
                <div className="flex items-center text-xl font-medium underline">
                  <img
                    className="mr-3"
                    src={require('../../../assets/images/discord.svg').default}
                    alt=""
                  />
                  Discord
                </div>
                <div className="flex items-center text-xl font-medium underline">
                  <img
                    className="mr-3"
                    src={require('../../../assets/images/medium.svg').default}
                    alt=""
                  />
                  Medium
                </div>
                <div className="flex items-center text-xl font-medium underline">
                  <img
                    className="mr-3"
                    src={require('../../../assets/images/telegram.svg').default}
                    alt=""
                  />
                  Twitter
                </div>
              </div>
            </div>
          </div>
          <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
            <div className="flex flex-col mb-7">
              <div className="text-lg font-medium mb-2">Description</div>
              <div className="text-lg font-normal">
                Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in, iaculis eu
                lectus. Aenean a urna vitae risus ullamcorper feugiat sed non quam. Fusce in rhoncus
                nibh.
              </div>
            </div>
          </div>
          <div className="text-white flex flex-row items-stretch justify-between items-center p-6 ">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Dutch auction</div>
            </div>
          </div>
        </div>
        <div className="col-span-4 bg-fadeBlack rounded-2xl flex flex-col justify-between">
          <AuctionStatus auctionEndDate={auctionEndDate} label="Auction Progress" />
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
        wrapperClassName="hidden md:block"
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
export default Detail;
