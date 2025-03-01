import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BatchLive from './batch-auction';
import DutchLive from './dutch-auction';
import FixedLive from './fixed-auction';
import { useActiveWeb3React } from '../../../hooks';
import * as constants from '../../../utilities/constants';
import { auctionCount } from './auctionCount'

function Live(props) {
  const { chainId } = useActiveWeb3React();
  const [activeTab, setActiveTab] = useState('batch');
  const [batchActive, setBatchActive] = useState(true);
  const [dutchActive, setDutchActive] = useState(false);
  const [fixedActive, setFixedActive] = useState(false);

  const [batchCount, setBatchCount] = useState(0);
  const [dutchCount, setDutchCount] = useState(0);
  const [fixedCount, setFixedCount] = useState(0);

  const batchTab = (e) => {
    setActiveTab(e.target.value);
    if (!batchActive) {
      setBatchActive(true);
    }
    setDutchActive(false);
    setFixedActive(false);
  };
  const dutchTab = (e) => {
    setActiveTab(e.target.value);
    setBatchActive(false);
    setDutchActive(true);
    setFixedActive(false);
  };
  const fixedTab = (e) => {
    setActiveTab(e.target.value);
    setBatchActive(false);
    setDutchActive(false);
    setFixedActive(true);
  };

  const Styles = styled.div`
    button.active {
      position: relative;
      &:before {
        content: '';
        position: absolute;
        bottom: -30px;
        left: 0;
        right: 0;
        width: 20px;
        margin: 0 auto;
        border: 15px solid transparent;
        border-top-color: #ffab2d;
      }
    }
    .auction-btn-wrapper{
      button{
        .number {
          padding: 0;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
          font-weight: bold;
          color: #fff;
        }
      }
    }

    @media (min-width: 432px) {
      .toggle-label-break {
        display: none;
      }
    }
  `;

  const currentTimeStamp = Math.floor(Date.now() / 1000);
  let auctionTime1, auctionTime2
  auctionTime1 = 'auctionEndDate_gt'
  auctionTime2 = 'auctionStartDate_lt'

  let query = `
  {
    auctions(where: { ${auctionTime1}: "${currentTimeStamp}", ${auctionTime2}: "${currentTimeStamp}" }) {
      id
    }
  }
`;
  let dutchQuery = `
    {
      auctions(where: { ${auctionTime1}: "${currentTimeStamp}", ${auctionTime2}: "${currentTimeStamp}" }) {
        id
    }
    }
  `;

  let fixedQuery = `
    {
      auctions(where: { ${auctionTime1}: "${currentTimeStamp}", ${auctionTime2}: "${currentTimeStamp}" }) {
        id
      }
    }
  `;

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // auctionCount(query, constants.BATCH_AUCTION_DATASOURCE[chainId], setBatchCount, setLoading, setError)
    auctionCount(dutchQuery, constants.DUTCH_AUCTION_DATASOURCE[chainId], setDutchCount, setLoading, setError)
    auctionCount(fixedQuery, constants.FIXED_AUCTION_DATASOURCE[chainId], setFixedCount, setLoading, setError)
  }, [])


  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <Styles>
        <div
          className="auction-btn-wrapper flex justify-start items-center 
      mb-5 border-b border-solid border-primary"
        >
          <button
            onClick={(e) => {
              batchTab(e);
            }}
            value="batch"
            className={`py-2 p-1.5 w-2/6 justify-center 
           rounded h-15 mr-2 flex items-center ${batchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              }`}
          >
            <span>{'Batch '}<br className={'toggle-label-break'} />Auction</span>
            <span className={`${batchActive ? "bg-black text-white number" : "bg-primaryLight number"}`}
            >{batchCount}</span>
          </button>
          <button
            onClick={(e) => {
              dutchTab(e);
            }}
            value="dutch"
            className={`py-2 p-1.5 rounded transition-all h-15 mr-2 flex items-center w-2/6 justify-center 
             ${dutchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            <span>{'Dutch '}<br className={'toggle-label-break'} />Auction</span>
            <span className={`${dutchActive ? "bg-black text-white number" : "bg-primaryLight number"}`}>{dutchCount}</span>
          </button>
          <button
            onClick={(e) => {
              fixedTab(e);
            }}
            value="fixed"
            className={`py-2 p-1.5 rounded transition-all h-15 w-2/6 justify-center 
            flex items-center ${fixedActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            <span>Fixed</span>
            <span className={`${fixedActive ? "bg-black text-white number" : "bg-primaryLight number"}`}>{fixedCount}</span>
          </button>
        </div>

      </Styles>

      {activeTab === 'batch' ? (
        <>
          <BatchLive
            activeTab={activeTab}
            auctionStatus='live'
            setBatchCount={setBatchCount}
          />
        </>
      ) : activeTab === 'dutch' ? (
        <>
          <DutchLive
            activeTab={activeTab}
            auctionStatus='live'
          />
        </>
      ) : activeTab === 'fixed' ? (
        <>
          <FixedLive
            activeTab={activeTab}
            auctionStatus='live'
          />
        </>
      ) : (
        ''
      )}

    </div>
  );
}

export default Live;
