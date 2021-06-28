import React, { Fragment } from 'react';
import Countdown from 'react-countdown';

const AuctionStatus = ({ auctionEndDate, label }) => {
  return (
    <Fragment>
      <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
        <div className="flex flex-col items-start justify-start ">
          <div className="text-white text-2xl ">{label}</div>
          <div className="text-base font-normal opacity-0 "> text</div>
        </div>
      </div>
      <AuctionProgress auctionEndDate={auctionEndDate} />
    </Fragment>
  );
};

const AuctionCountDown = ({ auctionEndDate }) => {
  return (
    <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
      <div className="w-full flex flex-col items-center justify-center ">
        <div className="text-white text-4xl mb-10">Countdown</div>
        <div className="counter bg-primary flex flex-row items-center py-10 rounded-2xl">
          <Countdown
            date={auctionEndDate}
            renderer={({ days, hours, minutes, seconds }) => (
              <Fragment>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{days}</div>
                  <div className="text-2xl font-normal">DAYs</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{hours}</div>
                  <div className="text-2xl font-normal">HOURS</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{minutes}</div>
                  <div className="text-2xl font-normal">MIN</div>
                </div>
                <div className="flex flex-col items-center px-6">
                  <div className="text-3xl font-bold">{seconds}</div>
                  <div className="text-2xl font-normal">SEC</div>
                </div>
              </Fragment>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const AuctionCompleted = () => {
  return (
    <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
      <div className="w-full flex flex-col items-center justify-center ">
        <img className="ml-3" src={require('../../../assets/images/check.svg').default} alt="" />
        <div className="text-white text-4xl mt-10 mb-3">Auction Finished Successfully</div>
        <div className="text-white text-base mb-10">you are able to claim 1 Non-Fungible Bible</div>
        <button className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24
         h-14 bg-white rounded-lg bgPrimaryGradient rounded-lg">Claim</button>
      </div>
    </div>
  );
};

const AuctionProgress = () => {
  return (
    <>
      <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
        graph
      </div>
      <div className="text-white flex flex-col items-stretch justify-between items-center p-6 ">
        <div className="">
          <div className="mb-7">
            <div className="label flex flex-row justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-sm ">Minimum Token Amount</div>
                <div className="text-lg font-bold">0.33248854885568644856</div>
              </div>
              <div className="flex flex-col text-right">
                <div className="text-sm ">Max Available</div>
                <div className="text-lg font-bold">951.7</div>
              </div>
            </div>
            <input className="w-full" type="range" min="0" max="951.7" />
          </div>
          <div className="mb-7">
            <input className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white" type="text" />
          </div>
          <div className="mb-7">
            <div className="label flex flex-row justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-md text-primary font-bold mb-2 ">Commitment</div>
                <div className="text-md ">Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in,
                  iaculis eu lectus. Aenean a urna vitae risus ullamcorpe.</div>
              </div>
            </div>
          </div>
          <div className="input-with-button flex">
            <input className="w-full border border-solid border-primary bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 pr-10 h-14 text-white" type="text" />
            <button className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24
         h-14 bg-white rounded-lg bg-primary rounded-lg">Commit</button>
          </div>
        </div>
      </div>
    </>
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
