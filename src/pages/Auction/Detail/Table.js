/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toHex from 'to-hex';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { methods } from '../../../utilities/ContractService';
import Loading from '../../../components/UI/Loading';
import { sortTypes } from './sortTypes';
import sortUp from '../../../assets/icons/sortUp.svg';
import sortDown from '../../../assets/icons/sortDown.svg';

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

  table.border-thick {
    border: 5px solid #2b2b2b;
    tr.top-border-thick {
      border-top: 5px solid #2b2b2b;
    }
  }

  table.no-data,
  table.loading {
    font-size: 1.2rem;
    th {
      border-right: 1px solid #2b2b2b;
    }
    div.loader-container {
      min-width: 150px;
    }
  }

  @media (max-width: 372px) {
    table.no-data,
    table.loading {
      div.loader-container {
        min-width: auto;
      }
    }
  }
`;

function Table(props) {
  const [selectedClaimOrders, updateSelectedClaimOrders] = useState([]);
  const [selectedCancelOrders, updateSelectedCancelOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockNumberSorted, setBlockNumberSorted] = useState(true);
  const [upDownValue, setUpDownValue] = useState(true);
  const [sortPrice, setSortPrice] = useState(true);
  const [priceUpDownValue, setPriceUpDownValue] = useState(true);
  const [propsData, setPropsData] = useState([]);
  const [currentSort, setCurrentSort] = useState('default');
  const [isTableHorizontal, setIsTableHorizontal] = useState(true);

  const { width } = useWindowSize() || {};
  useEffect(() => {
    if (width <= 1024) {
      setIsTableHorizontal(false);
    } else {
      setIsTableHorizontal(true);
    }
  }, [width]);

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
      let auctionId = props['auctionId'];
      let orders = [];
      for (let index = 0; index < selectedClaimOrders.length; index++) {
        const element = selectedClaimOrders[index];
        console.log('element: ', element);
        let userId = element['userId']['id'];
        let sellAmount = element['sellAmount_eth'];
        let buyAmount = element['buyAmount_eth'];
        console.log('user claim data: ', userId, sellAmount, buyAmount);
        userId = toHex(userId, { addPrefix: true });
        sellAmount = toHex(sellAmount, { addPrefix: true });
        buyAmount = toHex(buyAmount, { addPrefix: true });
        let orderData = encodeOrder(userId, sellAmount, buyAmount);
        orders.push(orderData);
      }
      console.log('claim orders: ', orders);
      await methods.send(
        props.auctionContract.methods.claimFromParticipantOrder,
        [auctionId, orders],
        props.account,
      );
      // updateSelectedClaimOrders([]);
      props.getData();
      setLoading(false);
    } catch (error) {
      updateSelectedClaimOrders([]);
      setLoading(false);
    }
  };
  const cancelAuction = async () => {
    try {
      setLoading(true);
      let auctionId = props['auctionId'];
      let orders = [];
      for (let index = 0; index < selectedCancelOrders.length; index++) {
        const element = selectedCancelOrders[index];
        let userId = element['userId']['id'];
        let sellAmount = element['sellAmount'];
        let buyAmount = element['buyAmount'];
        userId = toHex(userId, { addPrefix: true });
        sellAmount = toHex(sellAmount, { addPrefix: true });
        buyAmount = toHex(buyAmount, { addPrefix: true });
        let orderData = encodeOrder(userId, sellAmount, buyAmount);
        orders.push(orderData);
      }
      await methods.send(
        props.auctionContract.methods.cancelSellOrders,
        [auctionId, orders],
        props.account,
      );
      // updateSelectedCancelOrders([]);
      props.getData();
      setLoading(false);
    } catch (error) {
      updateSelectedCancelOrders([]);
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
  const handleClaimCheckbox = (item) => {
    let arr = [...selectedClaimOrders];
    let index = arr.findIndex((x) => x.id === item.id);
    if (index !== -1) {
      arr.splice(index, 1);
    } else {
      arr.push(item);
    }
    updateSelectedClaimOrders(arr);
  };
  const handleCancelCheckbox = (item) => {
    let arr = [...selectedCancelOrders];
    let index = arr.findIndex((x) => x.id === item.id);
    if (index !== -1) {
      arr.splice(index, 1);
    } else {
      arr.push(item);
    }
    updateSelectedCancelOrders(arr);
  };

  useEffect(() => {
    let descendingSort = props.data.sort((a, b) => b.blockNumber - a.blockNumber);
    setPropsData(descendingSort);
  }, [props.data]);

  const onSortChange = (sortColum) => {
    if (sortColum === 'BlockNumber') {
      let nextSort;
      if (currentSort === 'down') nextSort = 'up';
      else if (currentSort === 'up') nextSort = 'default';
      else if (currentSort === 'default') nextSort = 'down';
      else nextSort = 'down';
      setCurrentSort(nextSort);
    } else {
      let nextSort;
      if (currentSort === 'priceDown') nextSort = 'priceUp';
      else if (currentSort === 'priceUp') nextSort = 'priceDefault';
      else if (currentSort === 'priceDefault') nextSort = 'priceDown';
      else nextSort = 'priceDown';
      setCurrentSort(nextSort);
    }
  };

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
                onChange={() => { }}
                onChange={() => updateMyOrder(!isShowMyOrder)}
              />
              <span className="checkmark"></span>
            </label>
            {props.isAllowCancellation && props.auctionStatus !== 'completed' ? (
              <button
                disabled={loading || selectedCancelOrders.length === 0}
                onClick={() => cancelAuction()}
                className="focus:outline-none bg-primary py-2 md:px-6 px-6 rounded-2xl text-md  max-w-full  text-black"
              >
                Cancel
              </button>
            ) : props.auctionStatus === 'completed' && props.isAlreadySettle ? (
              <button
                disabled={loading || selectedClaimOrders.length === 0}
                onClick={() => claimAuction()}
                className="focus:outline-none bg-primary py-2 md:px-6 px-6 rounded-2xl text-md  max-w-full  text-black"
              >
                Claim
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
        <Styles>
          <table
            className={`text-left ${!isTableHorizontal && 'border-thick'} ${propsData.length === 0 && 'no-data'
              }`}
          >
            {isTableHorizontal ? (
              <>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>
                      Price{' '}
                      <button onClick={() => onSortChange('Price')}>
                        {sortTypes[currentSort].class === 'price-sort-down' ? (
                          <img
                            className="inline relative left-1"
                            src={sortDown}
                            alt="price-sort-down"
                          />
                        ) : sortTypes[currentSort].class === 'price-sort-up' ? (
                          <img
                            className="inline relative left-1"
                            src={sortUp}
                            alt="price-sort up"
                          />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="price-sort-up" />
                            <img className="inline w-2.5" src={sortDown} alt="price-sort-down" />
                          </span>
                        )}
                      </button>
                    </th>
                    <th>Amount Committed</th>
                    <th>Tokens Claimable</th>
                    <th>TX Hash</th>
                    <th>
                      Block Number{' '}
                      <button onClick={() => onSortChange('BlockNumber')}>
                        {sortTypes[currentSort].class === 'sort-down' ? (
                          <img className="inline relative left-1" src={sortDown} alt="sort down" />
                        ) : sortTypes[currentSort].class === 'sort-up' ? (
                          <img className="inline relative left-1" src={sortUp} alt="sort up" />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="sort up" />
                            <img className="inline w-2.5" src={sortDown} alt="sort down" />
                          </span>
                        )}
                      </button>
                    </th>
                    <th>Buy Amount</th>
                    <th>Sell Amount</th>
                    <th className="text-center">Status</th>
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
                  ) : propsData.length === 0 ? (
                    <tr>
                      <td colSpan="12">
                        <div className="text-center">No Data Found</div>
                      </td>
                    </tr>
                  ) : (
                    propsData.sort(sortTypes[currentSort].fn).map((item, index) => {
                      let userId = item.userId.address.toLowerCase();
                      let account = props.account ? props.account.toLowerCase() : '0x';
                      return !isShowMyOrder || (isShowMyOrder && userId === account) ? (
                        <tr key={index}>
                          <td>
                            <div className="flex justify-start items-center space-x-2">
                              <div className="text-primary">
                                <a
                                  href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.userId.address}`}
                                  target="_blank"
                                >
                                  {item.userId
                                    ? item.userId.address.substring(0, 5) + '...'
                                    : 'xxx'}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              {item.price} {item.priceUnit}
                            </div>
                          </td>
                          <td>
                            <div>{item.sellAmount}</div>
                          </td>
                          <td>
                            <div>{item.claimableLP} {item.auctionSymbol}</div>
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
                            <div>{item.buyAmount}</div>
                          </td>
                          <td>
                            <div>{item.sellAmount}</div>
                          </td>
                          <td>
                            {account === userId &&
                              props.auctionStatus === 'completed' &&
                              props.isAlreadySettle &&
                              item.status !== 'CANCELLED' ? (
                              <div className="flex items-center custom-check">
                                <label
                                  className={`container text-base ml-2 font-normal ${loading || !props.isAlreadySettle ? 'disabled' : ''
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    disabled={
                                      loading ||
                                      !props.isAlreadySettle ||
                                      item.status === 'PROCESSED'
                                    }
                                    checked={
                                      item.status === 'PROCESSED' ||
                                      selectedClaimOrders.findIndex((x) => x.id === item.id) !== -1
                                    }
                                    onChange={() => { }}
                                    onClick={() => handleClaimCheckbox(item)}
                                  />
                                  <span
                                    className={`checkmark ${item.status === 'PROCESSED' ? 'green' : ''
                                      }`}
                                  >
                                    <span style={{ display: 'none' }} className="text">
                                      {item.status === 'PROCESSED' ? 'Claimed' : 'Claim'}
                                    </span>
                                  </span>
                                </label>
                              </div>
                            ) : account === userId &&
                              props.isAllowCancellation &&
                              props.auctionStatus !== 'completed' &&
                              item.status !== 'CANCELLED' ? (
                              <div className="flex items-center custom-check">
                                <label
                                  className={`container text-base ml-2 font-normal ${loading || item.status === 'CANCELLED' ? 'disabled' : ''
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    disabled={loading || item.status === 'CANCELLED'}
                                    checked={
                                      item.status === 'CANCELLED' ||
                                      selectedCancelOrders.findIndex((x) => x.id === item.id) !== -1
                                    }
                                    onChange={() => { }}
                                    onClick={() => handleCancelCheckbox(item)}
                                  />
                                  <span className="checkmark">
                                    <span style={{ display: 'none' }} className="text">
                                      Cancel
                                    </span>
                                  </span>
                                </label>
                              </div>
                            ) : item.status === 'CANCELLED' ? (
                              <div className="flex items-center custom-check">
                                <label className={`container text-base ml-2 font-normal `}>
                                  <input
                                    type="checkbox"
                                    disabled={true}
                                    checked={true}
                                    onChange={() => { }}
                                  />
                                  <span className="checkmark red">
                                    <span style={{ display: 'none' }} className="text">
                                      {' '}
                                      Cancelled
                                    </span>
                                  </span>
                                </label>
                              </div>
                            ) : props.auctionStatus === 'completed' && !props.isAlreadySettle ? (
                              <div>Waiting to settle</div>
                            ) : (
                              'Bid'
                            )}
                          </td>
                        </tr>
                      ) : (
                        ''
                      );
                    })
                  )}
                </tbody>
              </>
            ) : props.loading ? (
              <>
                <tbody>
                  <tr colSpan={'100%'}>
                    <th colSpan={'50%'}>Address</th>
                    <td className={'expand'} rowSpan={9} colSpan={'50%'}>
                      <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg loader-container">
                        <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      Price{' '}
                      <button onClick={() => onSortChange('Price')}>
                        {sortTypes[currentSort].class === 'price-sort-down' ? (
                          <img
                            className="inline relative left-1"
                            src={sortDown}
                            alt="price-sort-down"
                          />
                        ) : sortTypes[currentSort].class === 'price-sort-up' ? (
                          <img
                            className="inline relative left-1"
                            src={sortUp}
                            alt="price-sort up"
                          />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="price-sort-up" />
                            <img className="inline w-2.5" src={sortDown} alt="price-sort-down" />
                          </span>
                        )}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th>Amount Committed</th>
                  </tr>
                  <tr>
                    <th>Tokens Claimable</th>
                  </tr>
                  <tr>
                    <th>TX Hash</th>
                  </tr>
                  <tr>
                    <th>
                      Block Number{' '}
                      <button onClick={() => onSortChange('BlockNumber')}>
                        {sortTypes[currentSort].class === 'sort-down' ? (
                          <img className="inline relative left-1" src={sortDown} alt="sort down" />
                        ) : sortTypes[currentSort].class === 'sort-up' ? (
                          <img className="inline relative left-1" src={sortUp} alt="sort up" />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="sort up" />
                            <img className="inline w-2.5" src={sortDown} alt="sort down" />
                          </span>
                        )}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th>Buy Amount</th>
                  </tr>
                  <tr>
                    <th>Sell Amount</th>
                  </tr>
                  <tr className={'border-bottom-none'}>
                    <th className="text-center">Status</th>
                  </tr>
                </tbody>
              </>
            ) : propsData.length === 0 ? (
              <>
                <tbody>
                  <tr colSpan={'100%'}>
                    <th colSpan={'50%'}>Address</th>
                    <td className={'content'} rowSpan={9} colSpan={'50%'}>
                      <div className="text-center">No Data Found</div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      Price{' '}
                      <button onClick={() => onSortChange('Price')}>
                        {sortTypes[currentSort].class === 'price-sort-down' ? (
                          <img
                            className="inline relative left-1"
                            src={sortDown}
                            alt="price-sort-down"
                          />
                        ) : sortTypes[currentSort].class === 'price-sort-up' ? (
                          <img
                            className="inline relative left-1"
                            src={sortUp}
                            alt="price-sort up"
                          />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="price-sort-up" />
                            <img className="inline w-2.5" src={sortDown} alt="price-sort-down" />
                          </span>
                        )}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th>Amount Committed</th>
                  </tr>
                  <tr>
                    <th>Tokens Claimable</th>
                  </tr>
                  <tr>
                    <th>TX Hash</th>
                  </tr>
                  <tr>
                    <th>
                      Block Number{' '}
                      <button onClick={() => onSortChange('BlockNumber')}>
                        {sortTypes[currentSort].class === 'sort-down' ? (
                          <img className="inline relative left-1" src={sortDown} alt="sort down" />
                        ) : sortTypes[currentSort].class === 'sort-up' ? (
                          <img className="inline relative left-1" src={sortUp} alt="sort up" />
                        ) : (
                          <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                            <img className="inline w-2.5" src={sortUp} alt="sort up" />
                            <img className="inline w-2.5" src={sortDown} alt="sort down" />
                          </span>
                        )}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th>Buy Amount</th>
                  </tr>
                  <tr>
                    <th>Sell Amount</th>
                  </tr>
                  <tr className={'border-bottom-none'}>
                    <th className="text-center">Status</th>
                  </tr>
                </tbody>
              </>
            ) : (
              <tbody>
                {propsData.sort(sortTypes[currentSort].fn).map((item, index) => {
                  let userId = item.userId.address.toLowerCase();
                  let account = props.account ? props.account.toLowerCase() : '0x';
                  return !isShowMyOrder || (isShowMyOrder && userId === account) ? (
                    <React.Fragment key={index}>
                      <tr className={'top-border-thick'}>
                        <th>Address</th>
                        <td>
                          <div className="flex justify-start items-center space-x-2">
                            <div className="text-primary">
                              <a
                                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.userId.address}`}
                                target="_blank"
                              >
                                {item.userId ? item.userId.address.substring(0, 5) + '...' : 'xxx'}
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          Price{' '}
                          <button onClick={() => onSortChange('Price')}>
                            {sortTypes[currentSort].class === 'price-sort-down' ? (
                              <img
                                className="inline relative left-1"
                                src={sortDown}
                                alt="price-sort-down"
                              />
                            ) : sortTypes[currentSort].class === 'price-sort-up' ? (
                              <img
                                className="inline relative left-1"
                                src={sortUp}
                                alt="price-sort up"
                              />
                            ) : (
                              <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                                <img className="inline w-2.5" src={sortUp} alt="price-sort-up" />
                                <img
                                  className="inline w-2.5"
                                  src={sortDown}
                                  alt="price-sort-down"
                                />
                              </span>
                            )}
                          </button>
                        </th>
                        <td>
                          <div>
                            {item.price} {item.priceUnit}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Amount Committed</th>
                        <td>
                          <div>{item.sellAmount}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>Tokens Claimable</th>
                        <td>
                          <div>{item.claimableLP} {item.auctionSymbol}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>TX Hash</th>
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
                      </tr>
                      <tr>
                        <th>
                          Block Number{' '}
                          <button onClick={() => onSortChange('BlockNumber')}>
                            {sortTypes[currentSort].class === 'sort-down' ? (
                              <img
                                className="inline relative left-1"
                                src={sortDown}
                                alt="sort down"
                              />
                            ) : sortTypes[currentSort].class === 'sort-up' ? (
                              <img className="inline relative left-1" src={sortUp} alt="sort up" />
                            ) : (
                              <span className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                                <img className="inline w-2.5" src={sortUp} alt="sort up" />
                                <img className="inline w-2.5" src={sortDown} alt="sort down" />
                              </span>
                            )}
                          </button>
                        </th>
                        <td>
                          <div>{item.blockNumber}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>Buy Amount</th>
                        <td>
                          <div>{item.buyAmount}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>Sell Amount</th>
                        <td>
                          <div>{item.sellAmount}</div>
                        </td>
                      </tr>
                      <tr>
                        <th className="text-center">Status</th>
                        <td>
                          {account === userId &&
                            props.auctionStatus === 'completed' &&
                            props.isAlreadySettle &&
                            item.status !== 'CANCELLED' ? (
                            <div className="flex items-center custom-check">
                              <label
                                className={`container text-base ml-2 font-normal ${loading || !props.isAlreadySettle ? 'disabled' : ''
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={
                                    loading || !props.isAlreadySettle || item.status === 'PROCESSED'
                                  }
                                  checked={
                                    item.status === 'PROCESSED' ||
                                    selectedClaimOrders.findIndex((x) => x.id === item.id) !== -1
                                  }
                                  onChange={() => { }}
                                  onClick={() => handleClaimCheckbox(item)}
                                />
                                <span
                                  className={`checkmark ${item.status === 'PROCESSED' ? 'green' : ''
                                    }`}
                                >
                                  <span style={{ display: 'none' }} className="text">
                                    {item.status === 'PROCESSED' ? 'Claimed' : 'Claim'}
                                  </span>
                                </span>
                              </label>
                            </div>
                          ) : account === userId &&
                            props.isAllowCancellation &&
                            props.auctionStatus !== 'completed' &&
                            item.status !== 'CANCELLED' ? (
                            <div className="flex items-center custom-check">
                              <label
                                className={`container text-base ml-2 font-normal ${loading || item.status === 'CANCELLED' ? 'disabled' : ''
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={loading || item.status === 'CANCELLED'}
                                  checked={
                                    item.status === 'CANCELLED' ||
                                    selectedCancelOrders.findIndex((x) => x.id === item.id) !== -1
                                  }
                                  onChange={() => { }}
                                  onClick={() => handleCancelCheckbox(item)}
                                />
                                <span className="checkmark">
                                  <span style={{ display: 'none' }} className="text">
                                    Cancel
                                  </span>
                                </span>
                              </label>
                            </div>
                          ) : item.status === 'CANCELLED' ? (
                            <div className="flex items-center custom-check">
                              <label className={`container text-base ml-2 font-normal `}>
                                <input
                                  type="checkbox"
                                  disabled={true}
                                  checked={true}
                                  onChange={() => { }}
                                />
                                <span className="checkmark red">
                                  <span style={{ display: 'none' }} className="text">
                                    {' '}
                                    Cancelled
                                  </span>
                                </span>
                              </label>
                            </div>
                          ) : props.auctionStatus === 'completed' && !props.isAlreadySettle ? (
                            <div>Waiting to settle</div>
                          ) : (
                            'Bid'
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ) : (
                    ''
                  );
                })}
              </tbody>
            )}
          </table>
        </Styles>
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

const Checkbox = (disabled, checked, item) => {
  <div className="flex items-center custom-check">
    <label className={`container text-base ml-2 font-normal ${disabled}`}>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={() => { }}
        onClick={() => handleCancelCheckbox(item)}
      />
      <span className="checkmark"></span>
    </label>
  </div>;
};
export default App;
