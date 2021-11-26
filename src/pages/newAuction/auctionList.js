import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import * as constants from '../../utilities/constants';
// import { auctionCount } from './auctionCount'
import Table from './Table'
import { restService } from 'utilities';

function Live(props) {
  const { account, chainId } = useActiveWeb3React();
  const [data, setData] = useState([])



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

  // useEffect(async () => {
  //   try {
  //     const response = await restService({
  //       third_party: true,
  //       api: 'http://192.168.99.197:3070/api/v1/contract',
  //       method: 'GET',
  //       params: {}
  //     })
  //     setData(response.data.data)
  //     console.log('responseeee', response)
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [])

  useEffect(async () => {
    try {
      const response = await restService({
        third_party: true,
        api: 'http://192.168.99.197:3070/api/v1/getAllAuctions',
        method: 'GET',
        params: {}
      })
      // setData(response.data.data)
      console.log('responseeee', response)
    } catch (error) {
      console.error(error);
    }
  }, [])



  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  return (
    <div className="bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <Styles>
        <div
          className="auction-btn-wrapper flex justify-start items-center 
      mb-5 border-b border-solid border-primary"
        >
          <h2 className="text-white ml-5 text-4xl font-normal">Contract List</h2>
        </div>

      </Styles>

      <>
        {/* <Table
          data={data}
        /> */}
      </>

    </div>
  );
}

export default Live;
