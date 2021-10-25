import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import BatchLive from './batch-auction';
import DutchLive from './dutch-auction';
import FixedLive from './fixed-auction';


function Upcoming(props) {

  const [activeTab, setActiveTab] = useState('batch');
  const [batchActive, setBatchActive] = useState(true);
  const [dutchActive, setDutchActive] = useState(false);
  const [fixedActive, setFixedActive] = useState(false);

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
  `;

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
            className={`
           py-2 rounded px-32 h-15 mr-2  ${batchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              }`}
          >
            Batch
          </button>
          <button
            onClick={(e) => {
              dutchTab(e);
            }}
            value="dutch"
            className={`py-2 rounded px-32 transition-all h-15 mr-2 ${dutchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            Dutch
          </button>
          <button
            onClick={(e) => {
              fixedTab(e);
            }}
            value="fixed"
            className={`py-2 rounded px-32 transition-all h-15  ${fixedActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            Fixed
          </button>
        </div>

      </Styles>

      {activeTab === 'batch' ? (
        <>
          <BatchLive
            auctionStatus='upcoming'
          />
        </>
      ) : activeTab === 'dutch' ? (
        <>
          <DutchLive
            activeTab={activeTab}
            auctionStatus='upcoming'
          />
        </>
      ) : activeTab === 'fixed' ? (
        <>
          <FixedLive
            activeTab={activeTab}
            auctionStatus='upcoming'
          />
        </>
      ) : (
        ''
      )}

    </div>
  );
}

export default Upcoming;
