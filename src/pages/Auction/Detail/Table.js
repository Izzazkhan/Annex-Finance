/* eslint-disable */
import React, { useState, Fragment } from 'react';
import styled from 'styled-components';
import toHex from 'to-hex';
import { methods } from '../../../utilities/ContractService';
import Loading from '../../../components/UI/Loading';
import { useTable, useSortBy, useExpanded } from 'react-table';
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
`;

function Table({ columns, data, ...props }) {
  data.map(
    (item) => (
      (item.address = item.userId.address),
      (item.amountCommited = item.auctionDivBuyAmount + ' ' + item.biddingSymbol)
    ),
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn: 'rank',
      autoResetSortBy: false,
    },
    useSortBy,
    useExpanded,
  );
  console.log('props', rows);

  const [selectedClaimOrders, updateSelectedClaimOrders] = useState([]);
  const [selectedCancelOrders, updateSelectedCancelOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isShowMyOrder, updateMyOrder] = useState(false);
  const trimAddress = (address) => {
    console.log('address', address);
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
    console.log('selectedClaimOrders', selectedClaimOrders);
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
    console.log('selectedCancelOrders', selectedCancelOrders);
    updateSelectedCancelOrders(arr);
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
        {/* <table className="text-left">
          <thead>
            <tr>
              <th>Address</th>
              <th>Amount Committed</th>
              <th>LP Tokens Claimable</th>
              <th>TX Hash</th>
              <th>Block Number</th>
              <th>Buy Amount</th>
              <th>Sell Amount</th>
              <th className="text-center"></th>
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
                    <td>
                      {account === userId &&
                      props.auctionStatus === 'completed' &&
                      props.isAlreadySettle &&
                      item.status !== 'CANCELLED' ? (
                        <div className="flex items-center custom-check">
                          <label
                            className={`container text-base ml-2 font-normal ${
                              loading || !props.isAlreadySettle ? 'disabled' : ''
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
                              onClick={() => handleClaimCheckbox(item)}
                            />
                            <span
                              className={`checkmark ${item.status === 'PROCESSED' ? 'green' : ''}`}
                            >
                              <span style={{ display: 'none' }} className="text">
                                {item.status === 'PROCESSED' ? 'Claimed' : 'Claim'}
                              </span>
                            </span>
                          </label>
                        </div>
                      ) : props.isAllowCancellation &&
                        props.auctionStatus !== 'completed' &&
                        item.status !== 'CANCELLED' ? (
                        <div className="flex items-center custom-check">
                          <label
                            className={`container text-base ml-2 font-normal ${
                              loading || item.status === 'CANCELLED' ? 'disabled' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={loading || item.status === 'CANCELLED'}
                              checked={
                                item.status === 'CANCELLED' ||
                                selectedCancelOrders.findIndex((x) => x.id === item.id) !== -1
                              }
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
                            <input type="checkbox" disabled={true} checked={true} />
                            <span className="checkmark red">
                              <span style={{ display: 'none' }} className="text">
                                {' '}
                                Cancelled
                              </span>
                            </span>
                          </label>
                        </div>
                      ) : props.auctionStatus === 'completed' && !props.isAlreadySettle ? (
                        <div>'Waiting to settle</div>
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                ) : (
                  ''
                );
              })
            )}
          </tbody>
        </table> */}
        <table {...getTableProps()}>
          <thead>
            {[headerGroups[1]].map((headerGroup) => (
              // eslint-disable-next-line react/jsx-key
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={column.Header}
                    >
                      {column.render('Header')}
                      {(index === 1 || index === 5) && (
                        <span>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <img
                                className="inline relative left-1"
                                src={sortDown}
                                alt="sort down"
                              />
                            ) : (
                              <img className="inline relative left-1" src={sortUp} alt="sort up" />
                            )
                          ) : (
                            <div className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                              <img className="inline w-2.5" src={sortUp} alt="sort up" />
                              <img className="inline w-2.5" src={sortDown} alt="sort down" />
                            </div>
                          )}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {props.loading ? (
              <tr>
                <td colSpan="12">
                  <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                    <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="12">
                  <div className="text-center">No Data Found</div>
                </td>{' '}
              </tr>
            ) : (
              rows.map((row, i) => {
                console.log('row', row);
                prepareRow(row);
                return (
                  // eslint-disable-next-line react/jsx-key
                  <Fragment key={i}>
                    <tr {...row.getRowProps()} className="cursor-pointer">
                      {console.log('row.getRowProps()', row.cells)}
                      {row.cells.map((cell) => {
                        console.log('cell', cell);
                        let userId = cell.column.Header === 'Address' && cell.value.toLowerCase();
                        let account = props.account ? props.account.toLowerCase() : '0x';

                        if (!isShowMyOrder || (isShowMyOrder && userId === account)) {
                          if (cell.column.Header === 'Address') {
                            return (
                              <td>
                                <div className="flex justify-start items-center space-x-2">
                                  <div className="text-primary">
                                    <a
                                      href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${cell.value}`}
                                      target="_blank"
                                    >
                                      {cell.value ? cell.value.substring(0, 5) + '...' : ''}
                                    </a>
                                  </div>
                                </div>
                              </td>
                            );
                          } else if (cell.column.Header === 'TX Hash') {
                            return (
                              // eslint-disable-next-line react/jsx-key
                              <td>
                                <div className="text-primary">
                                  <a
                                    href={`${process.env.REACT_APP_BSC_EXPLORER}/tx/${cell.value}`}
                                    target="_blank"
                                  >
                                    {trimAddress(cell.value)}
                                  </a>
                                </div>
                              </td>
                            );
                          } else if (
                            cell.column.Header === 'Amount Commited' ||
                            cell.column.Header === 'LP Tokens Claimable' ||
                            cell.column.Header === 'Block Number' ||
                            cell.column.Header === 'Buy Amount' ||
                            cell.column.Header === 'Sell Amount' ||
                            cell.column.Header === 'Price'
                          ) {
                            return (
                              // eslint-disable-next-line react/jsx-key
                              <td {...cell.getCellProps()} className="">
                                <div>{cell.render('Cell')}</div>
                              </td>
                            );
                          }
                        } else {
                          return '';
                        }
                      })}
                    </tr>
                  </Fragment>
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

const Checkbox = (disabled, checked, item) => {
  <div className="flex items-center custom-check">
    <label className={`container text-base ml-2 font-normal ${disabled}`}>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onClick={() => handleCancelCheckbox(item)}
      />
      <span className="checkmark"></span>
    </label>
  </div>;
};
export default App;
