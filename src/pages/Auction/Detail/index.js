import React from 'react';
import Table from './Table';
import Progress from '../../../components/UI/Progress';

function Detail(props) {
  return (
    <div>
      <div className="col-span-12 p-6 flex flex-col">
        <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        <div className="text-gray text-2xl ">Non-Fungible Bible - Auction id# 1DPRC</div>
      </div>
      <div className="text-white bg-black mt-8  py-10 border border-lightGray rounded-md flex flex-row justify-between">
        <div className="col-span-6 lg:col-span-3 md:col-span-6  px-8 flex flex-col border-r border-lightGray flex-1">
          <h2 className="text-white mb-1 text-3xl font-bold text-primary">850 WETH/Rip</h2>
          <div className="text-white text-2xl ">Current Price</div>
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6  px-8 flex flex-col flex-1">
          <h2 className="text-white mb-1 text-3xl font-bold text-blue">Ripple</h2>
          <div className="text-white text-2xl ">Bidding With</div>
        </div>
        {/* <div className="timer bg-fadeBlack col-span-6 lg:col-span-3 md:col-span-6 px-8 flex flex-col flex-1 justify-center items-center">
          <h2 className="text-white mb-1 text-3xl font-bold text-primary">05:01:25</h2>
          <div className="text-white text-3xl font-bold">ENDS IN</div>
        </div> */}
        <div className="flex flex-col justify-between items-center order-last md:order-2">
          <div className="relative mb-2">
            <Progress
              wrapperClassName="hidden md:block"
              type="circle"
              width={200}
              percent={0}
              strokeWidth={4}
            />
            <div
              className={`flex flex-col items-center absolute top-1/2 left-1/2 
                            w-full h-full pt-18 md:pt-14 pb-14 md:pb-10 px-4
                            transform -translate-x-1/2 -translate-y-1/2 justify-center`}
            >
              <div className="flex flex-col items-center space-y-1 md:space-y-2 mb-3 md:mb-3 flex-grow text-center">
                <div className="text-primary font-bold text-lg md:text-xl">05:01:25</div>
                <div className="text-white font-bold text-xl md:text-2xl">ENDS IN</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6  px-8 flex flex-col border-r border-lightGray flex-1">
          <h2 className="text-white mb-1 text-3xl font-bold text-primary">250 WETH</h2>
          <div className="text-white text-2xl ">Total Auctions</div>
        </div>
        <div className="col-span-6 lg:col-span-3 md:col-span-6 px-8 flex flex-col flex-1">
          <h2 className="text-white mb-1 text-3xl font-bold text-primary">
            600 WETH/<span className="text-blue">Ripple</span>
          </h2>
          <div className="text-white text-2xl "> Min Bid Price </div>
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
            <div className="flex flex-col mb-7">
              <div className="text-lg font-bold mb-2">Contract</div>
              <div className="text-xl font-bold">OXICFO...IFBC74C57D</div>
            </div>
            <div className="flex flex-col mb-7">
              <div className="text-lg font-bold mb-2">Token</div>
              <div className="text-xl font-bold">OXI032...CC1FFE315B</div>
            </div>
            <div className="flex flex-col mb-7">
              <div className="text-lg font-bold mb-2">Website</div>
              <div className="text-xl font-bold">https://google.com</div>
            </div>
            <div className="flex flex-col  mb-7">
              <div className="text-lg font-bold mb-3">About</div>
              <div className="flex space-x-2 ">
                <div className="text-xl font-bold">Telegram</div>
                <div className="text-xl font-bold">Discord</div>
                <div className="text-xl font-bold">Medium</div>
                <div className="text-xl font-bold">Twitter</div>
              </div>
            </div>
          </div>
          <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
            <div className="flex flex-col mb-7">
              <div className="text-lg font-bold mb-2">Description</div>
              <div className="text-2xl font-normal">
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
          <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
            <div className="flex flex-col items-start justify-start ">
              <div className="text-white text-2xl ">Auction Progress</div>
              <div className="text-base font-normal opacity-0 "> text</div>
            </div>
          </div>
          <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
            <div className="w-full flex flex-col items-center justify-center ">
              <div className="text-white text-4xl mb-10">Countdown</div>
              <div className="counter bg-primary flex flex-row items-center py-10 rounded-2xl">
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">01</div>
                  <div className="text-2xl font-normal">DAYs</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">07</div>
                  <div className="text-2xl font-normal">HOURS</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">50</div>
                  <div className="text-2xl font-normal">MIN</div>
                </div>
                <div className="flex flex-col items-center px-6">
                  <div className="text-3xl font-bold">32</div>
                  <div className="text-3xl font-normal">SEC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Table />
    </div>
  );
}

export default Detail;
