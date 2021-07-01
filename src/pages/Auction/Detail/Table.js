/* eslint-disable */
import React from 'react';
import styled from 'styled-components';


const Styles = styled.div`
  width: 100%;
  overflow: auto;
  table {
    width: 100%;
    background-color: #000;
    color: #fff;
    border-spacing: 0;
    border: 1px solid #2b2b2b;

    tr {
      border-bottom: 1px solid #2b2b2b;
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem 2rem 0.5rem 0;
      text-align: center;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function Table(props) {
  // Render the UI for your table
  return (
    <div className="relative w-full">
      <div className="bg-fadeBlack w-full p-6 mt-16">
        <h2 className="text-white py-6 text-4xl font-normal mb-5">Auction User Transaction History</h2>
        <table className="text-left">
          <thead>
            <tr>
              <th>Address</th>
              <th>Amount Committed</th>
              <th>Tokens Claimable</th>
              <th>TX Hash</th>
              <th>Block Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* <td colSpan="12">
                <div>No Data found</div>
              </td> */}
              <td>
                <div className="flex justify-start items-center space-x-2">
                  <img src={require('../../../assets/icons/bitcoinBlack.svg').default} alt=""/>
                  <div>0x39500416…158B46e9 </div>
                </div>
              </td>
              <td>
                <div>0.5 BTC</div>
              </td>
              <td>
                <div>0.5197505197505198</div>
              </td>
              <td>
                <div className="text-primary">0x3c89498f…a30153c4</div>
              </td>
              <td>
                <div>12690644</div>
              </td>
            </tr>
            <tr>
              {/* <td colSpan="12">
                <div>No Data found</div>
              </td> */}
              <td>
                <div className="flex justify-start items-center space-x-2">
                  <img src={require('../../../assets/icons/bitcoinBlack.svg').default} alt=""/>
                  <div>0x39500416…158B46e9 </div>
                </div>
              </td>
              <td>
                <div>0.01 ETH</div>
              </td>
              <td>
                <div>0.5197505197505198</div>
              </td>
              <td>
                <div className="text-primary">0x3c89498f…a30153c4</div>
              </td>
              <td>
                <div>12690644</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App(props) {
  return (
    <Styles>
      <Table />
    </Styles>
  );
}

export default App;
