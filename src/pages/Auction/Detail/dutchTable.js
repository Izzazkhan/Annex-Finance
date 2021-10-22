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

  const encodeOrder = (sellAmount, buyAmount) => {
    return (
      '0x' +
      // userId.slice(2).padStart(16, '0') +
      buyAmount.slice(2).padStart(24, '0') +
      sellAmount.slice(2).padStart(24, '0')
    );
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
                onChange={() => {}}
                onChange={() => updateMyOrder(!isShowMyOrder)}
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
        <Styles>
          <table
            className={`text-left ${!isTableHorizontal && 'border-thick'} ${
              propsData.length === 0 && 'no-data'
            }`}
          >
            {isTableHorizontal ? (
              <>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>TX Hash</th>
                    <th>Amount Commited</th>
                    <th>Amount Claimable</th>
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
                      return !isShowMyOrder ? (
                        <tr key={index}>
                          <td>
                            <div className="flex justify-start items-center space-x-2">
                              <div className="text-primary">
                                <a
                                  href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.auctioner_address}`}
                                  target="_blank"
                                >
                                  {item.auctioner_address
                                    ? item.auctioner_address.substring(0, 5) + '...'
                                    : 'xxx'}
                                </a>
                              </div>
                            </div>
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
                            <div>
                              {item.auctionDivSellAmount} {item.biddingSymbol}
                            </div>
                          </td>
                          <td>
                            <div>
                              {item.auctionDivBuyAmount} {item.auctionSymbol}
                            </div>
                          </td>
                          <td>
                            <div>{item.blockNumber}</div>
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
                    <th>TX Hash</th>
                  </tr>
                  <tr>
                    <th>Amount Commited</th>
                  </tr>
                  <tr>
                    <th>Amount Claimable</th>
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
                    <th>TX Hash</th>
                  </tr>
                  <tr>
                    <th>Amount Commited</th>
                  </tr>
                  <tr>
                    <th>Amount Claimable</th>
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
                </tbody>
              </>
            ) : (
              <tbody>
                {propsData.sort(sortTypes[currentSort].fn).map((item, index) => {
                  return !isShowMyOrder ? (
                    <React.Fragment key={index}>
                      <tr className={'top-border-thick'}>
                        <th>Address</th>
                        <td>
                          <div className="flex justify-start items-center space-x-2">
                            <div className="text-primary">
                              <a
                                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.auctioner_address}`}
                                target="_blank"
                              >
                                {item.auctioner_address
                                  ? item.auctioner_address.substring(0, 5) + '...'
                                  : 'xxx'}
                              </a>
                            </div>
                          </div>
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
                        <th>Amount Commited</th>
                        <td>
                          <div>
                            {item.auctionDivSellAmount} {item.biddingSymbol}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Amount Claimable</th>
                        <td>
                          <div>
                            {item.auctionDivBuyAmount} {item.auctionSymbol}
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
                      <tr></tr>
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

export default App;
