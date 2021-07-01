import React, { Fragment, useEffect } from 'react';
import Countdown from 'react-countdown';
import BarChart from '../../../components/common/BarChart';
import LineChart from '../../../components/common/LineChart';
import Slider from 'react-rangeslider';

let blockChartOptions = {
  // style of canvas and boundary to be plotted on to
  canvas: {
    background: {
      style: 'transparent',
    },
  },
  padding: {
    top: 0, // space between canvas and top of draw area
    bottom: 0, // space between canvas and bottom of draw area
    left: 0, // space between canvas and left of draw area
    right: 0, // space between canvas and right of draw area
  },
  boundary: {
    background: {
      style: 'transparent',
    },
  },
  yAxis: {
    width: 0.5, // thickness of y axis
    color: '#C4C4C4', // color of y axis
  },
  xAxis: {
    width: 0.5, // thickness of x axis
    color: '#C4C4C4', // color of x axis
  },
  // style and properties of blocks to be plotted
  blocks: {
    forceSquare: true,
    space: {
      horizontal: 0, // space between each column
      vertical: 0, // space between each blocks in vertical
    },
    groupBy: 'value', // key used to group data into same column
    background: {
      style: 'custom', // custom background color. other supported color is 'scale', 'preset-scale'
      color: '#aaaaaa', // default block background color
      scaleTo: '#eacd31', // when scale style is used, color palette will be generate from color -> scaleTo color
    },
    shadow: {
      style: 'custom', // custom shadow. other supported shadow is 'none'
      color: '#aaaaaa',
      blur: 1,
      offsetX: 1,
      offsetY: 1,
    },
    border: {
      style: 'line',
      width: 2,
      color: '#000000',
    },
  },
};

const AuctionStatus = ({ auctionEndDate, label, detail }) => {
  return (
    <Fragment>
      <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
        <div className="flex flex-col items-start justify-start ">
          <div className="text-white text-2xl ">{label}</div>
          <div className="text-base font-normal opacity-0 "> text</div>
        </div>
      </div>
      <AuctionProgress auctionEndDate={auctionEndDate} detail={detail} />
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
        <button
          className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24
         h-14 bg-white rounded-lg bgPrimaryGradient rounded-lg"
        >
          Claim
        </button>
      </div>
    </div>
  );
};
const AuctionProgress = (props) => {
  return (
    <>
      {props.detail.chartType === 'block' ? (
        <Fragment>
          <div className="chart flex items-end relative mt-5 pl-10 mr-2">
            <div className="graph-left-label flex flex-col items-center text-white text-sm justify-center font-normal">
              <span className="border first"></span>
              <span className="label my-2 font-normal">
                No. of share <b>50</b>
              </span>
              <span className=" border last"></span>
            </div>
            <span className="label info success text-sm font-normal"><span></span>Successfull</span>
            <span className="label info unsuccess text-sm font-normal"><span></span>UnSuccessfull</span>
            <BarChart width="100%" height="211px" data={props.detail.data} />
          </div>
          <div className="w-full graph-bottom-label flex items-center text-white text-sm mt-8 justify-center font-normal">
            <span className="border first "></span>
            <span className="label mx-2 font-normal">
              Bid per share, sorted from lowest to highest
            </span>
            <span className=" border last "></span>
          </div>
        </Fragment>
      ) : (
        <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
          <LineChart width="100%" height="211px" data={props.detail.data} />
          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-center ">
              <div className="flex items-center text-primary text-xs font-bold">Auction Start</div>
            </div>
            <div className="items-center ">
              <div className="flex items-center text-primary text-xs font-bold">Auction End</div>
            </div>
          </div>
        </div>
      )}
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
            <div className="custom-range">
              <Slider min={850} max={5000} value={2000} />
              {/* <input id="range" className="w-full" type="range" min="0" max="951.7" /> */}
            </div>
          </div>
          <div className="mb-7">
            <input
              className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
              type="text"
            />
          </div>
          <div className="mb-7">
            <div className="label flex flex-row justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-md text-primary font-bold mb-2 ">Commitment</div>
                <div className="text-md ">
                  Sed a condimentum nisl. Nulla mi libero, pretium sit amet posuere in, iaculis eu
                  lectus. Aenean a urna vitae risus ullamcorpe.
                </div>
              </div>
            </div>
          </div>
          <div className="input-with-button flex">
            <input
              className="w-full border border-solid border-primary bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 pr-10 h-14 text-white"
              type="text"
            />
            <button
              className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
         h-14 bg-primary rounded-lg"
            >
              Commit
            </button>
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
