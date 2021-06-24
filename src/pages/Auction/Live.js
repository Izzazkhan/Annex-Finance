import React, { useEffect } from 'react';
import MiniLogo from '../../components/UI/MiniLogo';
import { BlockChart } from '../../components/common/BlockChart';

function Live(props) {
  useEffect(() => {
    let data = [
      {
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
    const blockchart = new BlockChart('myCanvas', {
      // style of canvas and boundary to be plotted on to
      canvas: {
        background: {
          style: 'transparent',
        },
      },
      boundary: {
        background: {
          style: 'transparent',
        },
      },
      yAxis: {
        width: 0.5, // thickness of y axis
        color: '#777777', // color of y axis
      },
      xAxis: {
        width: 0.5, // thickness of x axis
        color: '#777777', // color of x axis
      },

      // style and properties of blocks to be plotted
      blocks: {
        forceSquare: true,
        space: {
          horizontal: 4, // space between each column
          vertical: 4, // space between each blocks in vertical
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
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Live Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
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
            <img src={require('../../assets/images/graph.png').default} alt="" />
            {/* <canvas id="myCanvas" width="400" height="250"></canvas> */}
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
            <img src={require('../../assets/images/graph.png').default} alt="" />
          </div>

          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Dutch auction</div>
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
            <img src={require('../../assets/images/graph.png').default} alt="" />
          </div>

          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Fixed swap auction</div>
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
      </div>
    </div>
  );
}

export default Live;
