import React from 'react';
import AuctionItem from './item';

function Past(props) {
  const auction = React.useMemo(
    () => [
      {
        chartType: 'block',
        type: 'Batch',
        data: [
          {
            value: 3,
          },
          {
            value: 3,
          },
          {
            value: 3,
          },
          {
            value: 3,
          },
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
        ],
        status: 'Finished',
        statusClass:'past',
        title: 'Non-Fungible Bible',
        id: '1DPRC',
      },
      {
        chartType: 'line',
        type: 'Dutch',
        data: [
          {
            name: '',
            uv: 4000,
            pv: 2400,
            amt: 2400,
          },
          {
            name: '',
            uv: 3000,
            pv: 398,
            amt: 2210,
          },
        ],
        status: 'Finished',
        statusClass:'past',
        title: 'Non-Fungible Bible',
        id: '1DPRD',
      },
      {
        chartType: 'block',
        type: 'Fixed Swap',
        data: [
          {
            value: 3,
          },
          {
            value: 3,
          },
          {
            value: 3,
          },
          {
            value: 3,
          },
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
        ],
        status: 'Finished',
        statusClass:'past',
        title: 'Non-Fungible Bible',
        id: '1DPRE',
      },
    ],
    [],
  );
  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Past Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        {auction.map((item, index) => {
          return <AuctionItem {...item} key={index} />;
        })}
      </div>
    </div>
  );
}

export default Past;
