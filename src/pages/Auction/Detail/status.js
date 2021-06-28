import React, { Fragment } from 'react';

const AuctionStatus = () => {
  return (
    <Fragment>
      <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
        <div className="flex flex-col items-start justify-start ">
          <div className="text-white text-2xl ">Auction Progress</div>
          <div className="text-base font-normal opacity-0 "> text</div>
        </div>
      </div>
      <AuctionCountDown />
    </Fragment>
  );
};

const AuctionCountDown = () => {
  return (
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
            <div className="text-2xl font-normal">SEC</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuctionCompleted = () => {
  return (
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
  );
};

const AuctionProgress = () => {
  return (
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
  );
};

const AuctionClaim = () => {
  return (
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
  );
};

export default AuctionStatus;
