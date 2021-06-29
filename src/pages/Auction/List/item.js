import React, { Fragment, useEffect } from 'react';
import MiniLogo from '../../../components/UI/MiniLogo';
import { Link } from 'react-router-dom';
import { BlockChart } from '../../../components/common/BlockChart';
import LineChart from '../../../components/common/LineChart';
import { useHistory } from 'react-router-dom';

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
function AuctionItem(props) {
  const history = useHistory();
  useEffect(() => {
    if (props.chartType === 'block') {
      const blockchart = new BlockChart(`myCanvas${props.id}`, blockChartOptions);
      blockchart.loadData(props.data);
    }
  }, []);
  const redirectToUrl = (url) => {
    history.push(url);
  };
  return (
    <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-black rounded-2xl p-6 flex flex-col">
      <Link className="flex flex-col h-full justify-between" to="detail">
        <div className="text-white flex flex-row items-stretch justify-between items-center mb-8">
          <div className="flex flex-col items-start justify-start ">
            <div className="text-white text-2xl ">{props.title}</div>
            <div className="text-base font-normal">Auction id#{props.id}</div>
          </div>
          <div className="flex flex-col items-center relative">
            <span className="live-icon absolute right-0 top-0"></span>
            <MiniLogo size="sm" />
            <div className="text-sm mt-2">{props.status}</div>
          </div>
        </div>
        <div className="graph">
          {props.chartType === 'block' ? (
            <Fragment>
              <div className="flex items-end relative pl-10">
                <div className="graph-left-label flex flex-col items-center text-white text-sm justify-center font-normal">
                  <span className="border first"></span>
                  <span className="label my-2 font-normal">
                    No. of share <b>50</b>
                  </span>
                  <span className=" border last"></span>
                </div>
                <canvas id={`myCanvas${props.id}`} width="290px" height="211px"></canvas>
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
            <Fragment>
              <div className="flex items-end relative ">
                <LineChart width="310px" height="211px" data={props.data} />
              </div>
              <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
                <div className="items-center ">
                  <div className="flex items-center text-primary text-xs font-bold">
                    Auction Start
                  </div>
                </div>
                <div className="items-center ">
                  <div className="flex items-center text-primary text-xs font-bold">
                    Auction End
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </div>

        <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
          <div className="items-start " onClick={() => redirectToUrl('/auction/detail')}>
            <div className="text-primary text-sm font-normal">{props.type} auction</div>
          </div>
          <div className="items-center " onClick={() => redirectToUrl('/auction/detail')}>
            <div className="flex items-center text-primary text-sm font-bold">
              Enter
              <img
                className="ml-2"
                src={require('../../../assets/images/enter-icon.png').default}
                alt=""
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default AuctionItem;
