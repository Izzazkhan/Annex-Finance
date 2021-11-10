import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import BatchLive from './batch-auction';
import DutchLive from './dutch-auction';
import FixedLive from './fixed-auction';


function Past(props) {

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
  `;

  const currentTimeStamp = Math.floor(Date.now() / 1000);
  let auctionTime1, auctionTime2
  auctionTime1 = 'auctionEndDate_lt'
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

  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "query": query
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      let subGraph
      if (process.env.REACT_APP_ENV === 'dev') {
        subGraph = process.env.REACT_APP_TEST_SUBGRAPH_DATASOURCE;
      } else {
        subGraph = process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      }

      fetch(subGraph, requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log('JSON.parse(result)', JSON.parse(result))
          setBatchCount(JSON.parse(result).data.auctions.length)
        })
        .catch(error => {
          console.log(error);
          setLoading(false)
          setError('Error while Loading. Please try again later.')
        });
    } catch (error) {
      console.log(error);
      setLoading(false)
      setError('Error while Loading. Please try again later.')
    }
  }, [])

  useEffect(() => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "query": dutchQuery
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      let subGraph
      if (process.env.REACT_APP_ENV === 'dev') {
        subGraph = process.env.REACT_APP_TEST_DUTCH_AUCTION_DATASOURCE;
      } else {
        subGraph = process.env.REACT_APP_MAIN_DUTCH_AUCTION_DATASOURCE;
      }

      fetch(subGraph, requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log('resultttttt', result)
          setDutchCount(JSON.parse(result).data.auctions.length)

        })
        .catch(error => {
          console.log(error);
          setLoading(false)
          setError('Error while Loading. Please try again later.')
        });
    } catch (error) {
      console.log(error);
      setLoading(false)
      setError('Error while Loading. Please try again later.')
    }
  }, [])

  useEffect(() => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        "query": fixedQuery
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      let subGraph
      if (process.env.REACT_APP_ENV === 'dev') {
        subGraph = process.env.REACT_APP_TEST_FIXED_AUCTION_DATASOURCE;
      } else {
        subGraph = process.env.REACT_APP_MAIN_FIXED_AUCTION_DATASOURCE;
      }

      fetch(subGraph, requestOptions)
        .then(response => response.text())
        .then(result => {
          setFixedCount(JSON.parse(result).data.auctions.length)
        })
        .catch(error => {
          console.log(error);
          setLoading(false)
          setError('Error while Loading. Please try again later.')
        });
    } catch (error) {
      console.log(error);
      setLoading(false)
      setError('Error while Loading. Please try again later.')
    }
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
            className={`
           py-2 rounded px-32 h-15 mr-2  ${batchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              }`}
          >
            Batch Auction  {batchCount}
          </button>
          <button
            onClick={(e) => {
              dutchTab(e);
            }}
            value="dutch"
            className={`py-2 rounded px-32 transition-all h-15 mr-2 ${dutchActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            Dutch Auction  {dutchCount}
          </button>
          <button
            onClick={(e) => {
              fixedTab(e);
            }}
            value="fixed"
            className={`py-2 rounded px-32 transition-all h-15  ${fixedActive ? 'bg-primaryLight text-black active' : `bg-black text-white`
              } `}
          >
            Fixed  {fixedCount}
          </button>
        </div>

      </Styles>

      {activeTab === 'batch' ? (
        <>
          <BatchLive
            auctionStatus='past'
          />
        </>
      ) : activeTab === 'dutch' ? (
        <>
          <DutchLive
            activeTab={activeTab}
            auctionStatus='past'
          />
        </>
      ) : activeTab === 'fixed' ? (
        <>
          <FixedLive
            activeTab={activeTab}
            auctionStatus='past'
          />
        </>
      ) : (
        ''
      )}

    </div>
  );
}

export default Past;
