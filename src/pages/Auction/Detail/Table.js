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
        <table className="">
          <thead>
            <tr>
              <td>Address</td>
              <td>Amount Committed</td>
              <td>Tokens Claimable</td>
              <td>TX Hash</td>
              <td>Block Number</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="12">
                <div>No Data found</div>
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
