import React, { useState } from 'react';
import AuctionItem from './item';

const graphData = [
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
];
function Upcoming(props) {
  const [auction, updateAuction] = useState(['', '', '']);
  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Upcoming Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        {auction.map((item, index) => {
          return (
            <AuctionItem
              id={index}
              key={index}
              data={graphData}
              chartType={index === 1 ? 'line' : 'block'}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Upcoming;
