import React from 'react';
import AuctionItem from './item';

function Live(props) {
  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white ml-5 text-4xl font-normal">Live Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-8">
        <AuctionItem id="1" />
        <AuctionItem id="2" />
        <AuctionItem id="3" />
      </div>
    </div>
  );
}

export default Live;
