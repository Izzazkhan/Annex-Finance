import React from 'react';
import MiniLogo from '../../components/UI/MiniLogo';

function Live(props) {
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
            <img src={require( '../../assets/images/graph.png').default} alt="" />
          </div>

          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Batch auction</div>
            </div>
            <div className="items-center ">
              <div className="flex items-center text-primary text-sm font-bold">Enter 
              <img className="ml-2" src={require( '../../assets/images/enter-icon.png').default} alt="" /></div>
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
            <img src={require( '../../assets/images/graph.png').default} alt="" />
          </div>

          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Dutch auction</div>
            </div>
            <div className="items-center ">
              <div className="flex items-center text-primary text-sm font-bold">Enter 
              <img className="ml-2" src={require( '../../assets/images/enter-icon.png').default} alt="" /></div>
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
            <img src={require( '../../assets/images/graph.png').default} alt="" />
          </div>

          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-start ">
              <div className="text-primary text-sm font-normal">Fixed swap auction</div>
            </div>
            <div className="items-center ">
              <div className="flex items-center text-primary text-sm font-bold">Enter 
              <img className="ml-2" src={require( '../../assets/images/enter-icon.png').default} alt="" /></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Live;
