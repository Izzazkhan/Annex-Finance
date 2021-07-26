/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import toHex from 'to-hex';
import { methods } from '../../../utilities/ContractService';
import Loading from '../../../components/UI/Loading';


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
  const [isShowMyOrder, updateMyOrder] = useState(false);
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
      props.getData();
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
      props.getData();
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
        <div className="flex justify-between items-center">
          <h2 className="text-white py-6 text-4xl font-normal mb-5">
            Auction User Transaction History
          </h2>
          <div className="flex text-white text-sm items-center custom-check">
            <label className="container text-base ml-2 font-normal">
              Show my orders only
              <input
                type="checkbox"
                checked={isShowMyOrder}
                onChange={() => updateMyOrder(!isShowMyOrder)}
              />
              <span className="checkmark"></span>
            </label>
            <button>
              
            </button>
          </div>
        </div>
        <table className="text-left">
          <thead>
            <tr>
              <th>Address</th>
              <th>Amount Committed</th>
              <th>LP Tokens Claimable</th>
              <th>TX Hash</th>
              <th>Block Number</th>
              <th>Buy Amount</th>
              <th>Sell Amount</th>
              {props.auctionStatus === 'completed' ? <th></th> : ''}
              {props.isAllowCancellation ? <th></th> : ''}
            </tr>
          </thead>
          <tbody>
            {props.loading ? (
              <tr>
                <td colSpan="12">
                  <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                    <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                  </div>
                </td>
              </tr>
            ) : props.data.length === 0 ? (
              <tr>
                <td colSpan="12">
                  <div className="text-center">No Data Found</div>
                </td>{' '}
              </tr>
            ) : (
                  props.data.map((item, index) => {
                    let userId = item.userId.address.toLowerCase();
                    let account = props.account ? props.account.toLowerCase() : '0x';
                    return !isShowMyOrder || (isShowMyOrder && userId === account) ? (
                      <tr key={index}>
                        <td>
                          <div className="flex justify-start items-center space-x-2">
                            {/* <img
                          src={require('../../../assets/icons/bitcoinBlack.svg').default}
                          alt=""
                        /> */}
                            <div className="text-primary">
                              <a
                                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.userId.address}`}
                                target="_blank"
                              >
                                {item.userId ? item.userId.address.substring(0, 5) + '...' : ''}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            {item.auctionDivBuyAmount} {item.biddingSymbol}
                          </div>
                        </td>
                        <td>
                          <div>{item.lpToken}</div>
                        </td>
                        <td>
                          <div className="text-primary">
                            <a
                              href={`${process.env.REACT_APP_BSC_EXPLORER}/tx/${item.txHash}`}
                              target="_blank"
                            >
                              {trimAddress(item.txHash)}
                            </a>
                          </div>
                        </td>
                        <td>
                          <div>{item.blockNumber}</div>
                        </td>
                        <td>
                          <div>{item.auctionDivBuyAmount}</div>
                        </td>
                        <td>
                          <div>{item.auctionDivSellAmount}</div>
                        </td>
                        {account === userId && props.auctionStatus === 'completed' ? (
                          <td>
                            <button
                              className="focus:outline-none py-2 px-4 text-black text-sm 2xl:text-12 bg-white rounded-sm bgPrimaryGradient rounded-sm"
                              disabled={
                                loading ||
                                !props.isAlreadySettle ||
                                ['ACTIVE', 'NOTCLAIMED'].indexOf(item.bidder.status) === -1
                              }
                              onClick={() => claimAuction(item)}
                            >
                              {item.bidder.status === 'ACTIVE' || item.bidder.status === 'NOTCLAIMED'
                                ? 'Claim'
                                : item.bidder.status === 'SUCCESS'
                                  ? 'Claimed'
                                  : item.bidder.status}
                            </button>
                          </td>
                        ) : (
                            ''
                          )}

                        {account === userId && props.isAllowCancellation ? (
                          <td>
                            <button
                              className="focus:outline-none py-2 px-4 text-black text-sm 2xl:text-12 bg-white rounded-sm bgPrimaryGradient rounded-sm"
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
                    ) : (
                        ''
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
