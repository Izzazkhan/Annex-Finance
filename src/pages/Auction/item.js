import React, { useEffect } from 'react';
import MiniLogo from '../../components/UI/MiniLogo';
import { BlockChart } from '../../components/common/BlockChart';

const data = [
  {
    value: 3,
  },{
    value: 3,
  },{
    value: 3,
  },{
    value: 3,
  },{
    value: 3,
  },
  {
    value: 1,
  },
  {
    value: 8,
  },
  {
    value: 3,
  },
  {
    value: 4,
  },
  {
    value: 9,
  },
  {
    value: 9,
  },
  {
    value: 9,
  },
  {
    value: 9,
  },
  {
    value: 9,
  },
  {
    value: 10,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
];
function AuctionItem(props) {
  useEffect(() => {
    const blockchart = new BlockChart(`myCanvas${props.id}`, {
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
    });
    blockchart.loadData(data);
  }, []);
  return (
    <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-black rounded-2xl p-6 flex flex-col">
      <div className="text-white flex flex-row items-stretch justify-between items-center mb-8">
        <div className="flex flex-col items-start justify-start ">
          <div className="text-white text-2xl ">Non-Fungible Bible</div>
          <div className="text-base font-normal">Auction id#1DPRC</div>
        </div>
        <div className="flex flex-col items-center ">
          <MiniLogo size="sm" />
          <div className="text-sm mt-2">Live</div>
        </div>
      </div>
      <div className="graph">
        {/* <img src={require('../../assets/images/graph.png').default} alt="" /> */}
        <canvas id={`myCanvas${props.id}`} width="290" height="211"></canvas>
      </div>

      <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
        <div className="items-start ">
          <div className="text-primary text-sm font-normal">Batch auction</div>
        </div>
        <div className="items-center ">
          <div className="flex items-center text-primary text-sm font-bold">
            Enter
            <img
              className="ml-2"
              src={require('../../assets/images/enter-icon.png').default}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionItem;
