/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import toHex from 'to-hex';
import { methods } from '../../../utilities/ContractService';

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
  const [loading, setLoading] = useState(false);
  const trimAddress = (address) => {
    let length = address.length;
    if (length > 20) {
      address = address.substring(0, 6) + '...' + address.substring(length - 5, length);
    }
    return address;
  };
  const claimAuction = async (item) => {
    try {
      setLoading(true);
      let auctionId = item['auctionId']['id'];
      let userId = item['userId']['id'];
      let sellAmount = item['sellAmount'];
      let buyAmount = item['buyAmount'];
      userId = toHex(userId, { addPrefix: true });
      sellAmount = toHex(sellAmount, { addPrefix: true });
      buyAmount = toHex(buyAmount, { addPrefix: true });
      let orderData = encodeOrder(userId, sellAmount, buyAmount);

      await methods.send(
        props.auctionContract.methods.claimFromParticipantOrder,
        [auctionId, [orderData]],
        props.account,
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const cancelAuction = async (item) => {
    try {
      setLoading(true);
      let auctionId = item['auctionId']['id'];
      let userId = item['userId']['id'];
      let sellAmount = item['sellAmount'];
      let buyAmount = item['buyAmount'];
      userId = toHex(userId, { addPrefix: true });
      sellAmount = toHex(sellAmount, { addPrefix: true });
      buyAmount = toHex(buyAmount, { addPrefix: true });
      let orderData = encodeOrder(userId, sellAmount, buyAmount);
      await methods.send(
        props.auctionContract.methods.cancelSellOrders,
        [auctionId, [orderData]],
        props.account,
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const encodeOrder = (userId, sellAmount, buyAmount) => {
    return (
      '0x' +
      userId.slice(2).padStart(16, '0') +
      buyAmount.slice(2).padStart(24, '0') +
      sellAmount.slice(2).padStart(24, '0')
    );
  };
  // Render the UI for your table
  return (
    <div className="relative w-full">
      <div className="bg-fadeBlack w-full p-6 mt-16">
        <h2 className="text-white py-6 text-4xl font-normal mb-5">
          Auction User Transaction History
        </h2>
        <table className="text-left">
          <thead>
            <tr>
              <th>Address</th>
              <th>Amount Committed</th>
              <th>Tokens Claimable</th>
              <th>TX Hash</th>
              <th>Block Number</th>
              {props.auctionStatus === 'completed' ? <th>Claim</th> : ''}
              {props.isAllowCancellation ? <th>Cancel Order</th> : ''}
            </tr>
          </thead>
          <tbody>
            {props.loading ? (
              <tr>
                <td colSpan="12">
                  <div>Loading...</div>
                </td>{' '}
              </tr>
            ) : props.data.length === 0 ? (
              <tr>
                <td colSpan="12">
                  <div>No Data Found</div>
                </td>{' '}
              </tr>
            ) : (
              props.data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <div className="flex justify-start items-center space-x-2">
                        {/* <img
                          src={require('../../../assets/icons/bitcoinBlack.svg').default}
                          alt=""
                        /> */}
                        <div>{item.userId ? item.userId.address : ''} </div>
                      </div>
                    </td>
                    <td>
                      <div>{item.auctionDivBuyAmount}</div>
                    </td>
                    <td>
                      <div>0</div>
                    </td>
                    <td>
                      <div className="text-primary">{trimAddress(item.txHash)}</div>
                    </td>
                    <td>
                      <div>{item.blockNumber}</div>
                    </td>
                    {props.auctionStatus === 'completed' ? (
                      <td>
                        <button
                          className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24 bg-white rounded-lg bgPrimaryGradient rounded-lg"
                          disabled={
                            loading || !props.isAlreadySettle || item.bidder.status !== 'ACTIVE'
                          }
                          onClick={() => claimAuction(item)}
                        >
                          {item.bidder.status === 'ACTIVE'
                            ? 'Claim'
                            : item.bidder.status === 'SUCCESS'
                            ? 'Claimed'
                            : item.bidder.status}
                        </button>
                      </td>
                    ) : (
                      ''
                    )}

                    {props.isAllowCancellation ? (
                      <td>
                        <button
                          className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24 bg-white rounded-lg bgPrimaryGradient rounded-lg"
                          disabled={loading || item.status === 'CANCELLED'}
                          onClick={() => cancelAuction(item)}
                        >
                          {item.status === 'CANCELLED' ? item.status : 'Cancel'}
                        </button>
                      </td>
                    ) : (
                      ''
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App(props) {
  return (
    <Styles>
      <Table {...props} />
    </Styles>
  );
}

export default App;
