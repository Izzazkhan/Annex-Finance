import React, { useState } from 'react';
import Form from './form';
import DutchForm from './dutch-form';
import FixedForm from './fixed-form';
import styled from 'styled-components';
import * as constants from '../../../utilities/constants';
import { useActiveWeb3React } from '../../../hooks';

export default function CreateAuction(props) {
  const { account, chainId } = useActiveWeb3React();
  const biddingTokenOptions = React.useMemo(() => {
    return Object.keys(constants.BIDDING_AUCTION_TOKEN[chainId]).map((key, index) => ({
      id: constants.BIDDING_AUCTION_TOKEN[chainId][key].id,
      name: constants.BIDDING_AUCTION_TOKEN[chainId][key].symbol,
      logo: constants.BIDDING_AUCTION_TOKEN[chainId][key].asset,
      addr: constants.BIDDING_AUCTION_TOKEN[chainId][key].address,
      decimal: constants.BIDDING_AUCTION_TOKEN[chainId][key].decimals,
    }));
  }, []);
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

  const annexSwapOptions = [
    {
      name: 'Annex Finance Swap',
      value: '0',
    },
    {
      name: 'Annex Swap',
      value: '2',
    },
    // {
    //   name: 'Pancake Swap',
    //   value: '0',
    // },
  ];
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
    <div className="create-auction bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
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
          <h2 className="text-white text-4xl font-normal">Create Batch Auction</h2>
          <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
          <Form
            biddingTokenOptions={biddingTokenOptions}
            annexSwapOptions={annexSwapOptions}
            account={account}
            chainId={chainId}
            activeTab={activeTab}
          />
        </>
      ) : activeTab === 'dutch' ? (
        <>
          <h2 className="text-white text-4xl font-normal">Create Dutch Auction</h2>
          <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
          <DutchForm
            biddingTokenOptions={biddingTokenOptions}
            account={account}
            chainId={chainId}
            activeTab={activeTab}
          />
        </>
      ) : activeTab === 'fixed' ? (
        <>
          <h2 className="text-white text-4xl font-normal">Create Fixed Auction</h2>
          <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
          <FixedForm
            biddingTokenOptions={biddingTokenOptions}
            account={account}
            chainId={chainId}
            activeTab={activeTab}
          />
        </>
      ) : (
        ''
      )}
    </div>
  );
}
