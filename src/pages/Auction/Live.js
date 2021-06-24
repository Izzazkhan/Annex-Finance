import React, { useEffect } from 'react';
import {BlockChart} from '../../components/common/BlockChart';

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
          style: 'transparent'
        },
      },
      boundary: {
        background: {
          style: 'transparent'
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
    <div>
      <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
        Live Auctions
      </div>
      <div className="container static">
        <div className="columns is-centered">
          <div className="column is-8">
            <canvas id="myCanvas" width="400" height="250"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Live;
