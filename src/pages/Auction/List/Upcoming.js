import React from 'react';
import AuctionItem from './item';

function Upcoming(props) {
  const auction = React.useMemo(
    () => [
      {
        chartType: 'block',
        type: 'Batch',
        data: [
          {
            name: '1',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: false,
          },
          {
            name: '2',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: false,
          },
          {
            name: '3',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: false,
          },
          {
            name: '4',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: true,
          },
          {
            name: '5',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: true,
          },
          {
            name: '6',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: true,
          },
        ],
        status: 'Upcoming',
        statusClass:'upcoming',
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
        status: 'Upcoming',
        statusClass:'upcoming',
        title: 'Non-Fungible Bible',
        id: '1DPRD',
      },
      {
        chartType: 'block',
        type: 'Fixed Swap',
        data: [
          {
            name: '1',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: false,
          },
          {
            name: '2',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: false,
          },
          {
            name: '3',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: false,
          },
          {
            name: '4',
            uv: 4000,
            pv: 2400,
            amt: 2400,
            isSuccessfull: true,
          },
          {
            name: '5',
            uv: 3000,
            pv: 1398,
            amt: 2210,
            isSuccessfull: true,
          },
          {
            name: '6',
            uv: 2000,
            pv: 9800,
            amt: 2290,
            isSuccessfull: true,
          },
        ],
        status: 'Upcoming',
        statusClass:'upcoming',
        title: 'Non-Fungible Bible',
        id: '1DPRE',
      },
    ],
    [],
  );
  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Upcoming Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        {auction.map((item, index) => {
          return <AuctionItem {...item} key={index} />;
        })}
      </div>
    </div>
  );
}

export default Upcoming;
