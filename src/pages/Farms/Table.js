import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useTable,
  useSortBy,
  useFilters,
  useGlobalFilter,
  usePagination,
  useExpanded,
} from 'react-table';
import BigNumber from 'bignumber.js'
import commaNumber from 'comma-number'
import { matchSorter } from 'match-sorter';
import config from '../../constants/config'
import sortUp from '../../assets/icons/sortUp.svg';
import sortDown from '../../assets/icons/sortDown.svg';
import rightArrow from '../../assets/icons/rightArrow.svg';
import annCoin from '../../assets/images/coins/ann.png'
import { useWindowSize } from 'hooks/useWindowSize'
import upArrow from '../../assets/icons/arrowUp.png'
import annLogo from '../../assets/icons/logoSolid.svg'
import pancakeLogo from '../../assets/images/pancakeswap-logo.png'
import useApproveFarm from 'hooks/farms/useApproveFarm'
import useStakeFarms from 'hooks/farms/useStakeFarms'
import { useLP } from "hooks/useContracts"

const Styles = styled.div`
  width: 100%;
  overflow: auto;
  background-color: #101016;
  table {
    width: 100%;
    background-color: #000;
    color: #fff;
    border-spacing: 0;
    border: 4px solid #2b2b2b;

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
      padding: 0.5rem 2rem 0.5rem 1rem;
      text-align: center;

      :last-child {
        border-right: 0;
      }
    }
    td.padding-2rem {
      padding: 2rem 2rem 2rem 1rem;
    }
  }
`;

// Define a default UI for filtering
function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
  const count = preFilteredRows.length;

  return (
    <input
      className="border border-solid border-gray bg-transparent
                           rounded-md mt-1 w-full focus:outline-none font-bold px-3 py-2 text-white"
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder="Search"
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

const format = commaNumber.bindWith(',', '.')

const harvest = (obj) => { }
const stake = (obj) => { }
const unStake = (obj) => { }
const approve = async (obj) => {
  const lpContract = useLP(obj.lpAddress)
  const { onApprove } = useApproveFarm(lpContract)
  const [pendingTx, setPendingTx] = useState(false)
  
  setPendingTx(true)
  await onApprove()
  setPendingTx(false)
}

const columns = [
  {
    Header: 'Farms',
    disableSortBy: true,
    Cell: ({ value, row }) => {
      return (
        <div className="flex justify-center">
          <div className="flex flex-1">
            <div className="mr-5 relative h-12 w-12">
              <img src={row.original.token0Img} alt="" className="h-8" />
              {
                row.original.token1Img && <img src={row.original.token1Img} alt="" className="h-8 absolute right-0 bottom-0" />
              }
            </div>
            <div className="flex flex-col w-8/12">
              <span className="font-bold">{row.original.token1Name && `${row.original.token1Name}`} {row.original.token0Name}</span>
              <span className="mt-1 text-xs font-light">
                {row.original.token0Symbol}{row.original.token1Symbol && ` - ${row.original.token1Symbol}`}
              </span>
            </div>
          </div>
          <div className="mr-4">
            {
              row.original.type === 'pancake_lp' ? (
                <img src={pancakeLogo} alt="" className="h-8" title={row.original.lpName} />
              ) : (
                <img src={annLogo} alt="" className="h-8" title={row.original.lpName} />
              )
            }
          </div>
        </div>
      )
    },
  },
  {
    Header: () => (<>Yield <span className="text-sm font-light">(per $1,000)</span></>),
    accessor: 'rewardPerDay',
    disableSortBy: true,
    Cell: ({ value, row }) => (
      <div className="flex flex-col text-sm">
        <span className="font-light">
          {format(
            new BigNumber(value)
              .dp(2)
              .toString(10)
          )} ANN / Day
        </span>
        <span className="text-primary font-bold">{row.original.allocPoint} allocPoint</span>
      </div>
    )
  },
  {
    Header: 'APY',
    accessor: 'apy',
    Cell: ({ value, row }) => (
      <span className="font-bold flex items-center justify-center">
        <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
        {format(
          new BigNumber(value)
            .dp(2)
            .toString(10)
        )}%
      </span>
    )
  },
  {
    Header: 'Liquidity',
    accessor: 'liquidity',
    Cell: ({ value, row }) => (
      `$${format(
        new BigNumber(value)
          .dp(2)
          .toString(10)
      )}`
    )
  },
  {
    Header: 'Stacked',
    accessor: 'staked',
    // sortedContainerClass: 'ml-6',
    // containerClass: 'flex justify-center text-right',
    Cell: ({ value, row }) => (
      <div className="flex flex-col text-sm">
        <span className="font-light">{value}</span>
        <span className="font-bold">0 ANN / 0 ETH</span>
      </div>
    )
  },
  {
    Header: 'Earned',
    accessor: 'earned',
    disableSortBy: true,
    Cell: ({ value, row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-primary">
          {new BigNumber(row.original.userData ? row.original.userData.earnings : 0)
            .div(1e18)
            .dp(2, 1)
            .toString(10)} ANN
        </span>
        {
          new BigNumber(row.original.userData ? row.original.userData.earnings : 0).isGreaterThan(0) ? (
            <button
              className={`text-black font-bold 
                bgPrimaryGradient rounded-md
                text-md outline-none`}
              onClick={() => {
                harvest(row.original)
              }}>Harvest Now</button>
          ) : (
            <span className="font-normal">No Rewards</span>
          )
        }
      </div>
    )
  },
  {
    Header: '',
    accessor: 'empty',
    disableSortBy: true,
    Cell: ({ value, row, dipositWithdraw }) => (
      <div className="flex flex-col">
        <a
          className={`text-primary font-bold 
            rounded-3xl p-2 outline-none border 
            border-primary outline-none ${row.original.token1 === null ? 'invisible' : ''}`}
          href={
            `${row.original.type === 'annex_lp'
              ? config.annexAddLiquidityURL
              : config.pcsAddLiquidityURL}/${row.original.token0}/${row.original.token1}`
          }
          target="_new">Add Liquidity</a>
        {
          new BigNumber(row.original.userData ? row.original.userData.allowance : 0).isGreaterThan(0) ? (
            <>
              <button
                className={`text-primary font-bold 
                rounded-3xl p-2 outline-none border mt-2 
                border-primary`}
                onClick={() => {
                  stake(row.original)
                  dipositWithdraw(true, row.original)
                }}>Stake</button>
              {
                new BigNumber(row.original.userData.stakedBalance).isGreaterThan(0) && (
                  <button
                    className={`text-primary font-bold 
                    rounded-3xl p-2 outline-none border mt-2 
                    border-primary`}
                    onClick={() => {
                      unStake(row.original)
                      dipositWithdraw(true, row.original)
                    }}>UnStake</button>
                )
              }
            </>
          ) : (
            <div className="mt-2 flex justify-center cursor-pointer" onClick={() => {
              approve(row.original)
            }}>Approve Staking</div>
          )
        }
      </div>
    )
  },
]

function Table({ data, dipositWithdraw }) {
  const [isTableHorizontal, setIsTableHorizontal] = useState(true)

  const { width } = useWindowSize() || {};
  useEffect(() => {
    if (width <= 1280) {
      setIsTableHorizontal(false);
    } else {
      setIsTableHorizontal(true);
    }
  }, [width]);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    pageOptions,
    visibleColumns,
    pageCount,
    page,
    state: { pageIndex, pageSize, expanded },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      initialState: { pageIndex: 0 },
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    useSortBy,
    useExpanded,
    usePagination,
  );

  // Render the UI for your table
  return (
    <div className="relative">
      <div className="bg-fadeBlack p-6 mt-10 text-white text-base">
        <table {...getTableProps()}>
          {
            isTableHorizontal ? (<>
              <thead className="text-lg">
                {[headerGroups[0]].map((headerGroup) => (
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
                          {column.canSort && (
                            <span className={column.sortedContainerClass}>
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
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <Fragment key={i}>
                      <tr {...row.getRowProps()} className="">
                        {row.cells.map((cell) => {
                          return (
                            // eslint-disable-next-line react/jsx-key
                            <td {...cell.getCellProps()} className="padding-2rem">
                              <div className={(cell.column.containerClass || '') + (cell.value === 'detail' ? 'text-primary' : '')}>
                                {cell.render('Cell', { dipositWithdraw })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </>) : (
              <tbody {...getTableBodyProps()}>
                {
                  page.map((row, i) => {
                    prepareRow(row)
                    return (
                      <Fragment key={i}>
                        {
                          row.cells.map((cell, index) => (
                            <tr {...row.getRowProps()} key={index} className={(index === (row.cells.length - 1)) ? "border-b-4" : ""}>
                              {cell.column.Header !== '' && <td className="padding-2rem">
                                {(typeof (cell.column.Header) === "string" ? (cell.column.Header) : (cell.column.Header()))}
                              </td>}
                              <td className="padding-2rem" colSpan={cell.column.Header !== '' ? (1) : (2)}>
                                {cell.render('Cell', { dipositWithdraw })}
                              </td>
                            </tr>
                          ))
                        }
                      </Fragment>
                    )
                  })
                }
              </tbody>
            )
          }
        </table>
        <br />
        <div className="flex justify-between">
          <div className="text-white">
            Showing {page?.length} from {data.length} data
          </div>
          <div className="">
            <div className="flex space-x-6 px-6">
              <div className="flex space-x-2 text-white">
                {[
                  pageIndex - 2,
                  pageIndex - 1,
                  pageIndex,
                  pageIndex + 1,
                  pageIndex + 2,
                  pageIndex + 3,
                ].map(
                  (p, i) =>
                    p <= pageCount &&
                    p >= 1 && (
                      <div
                        key={p}
                        className={`cursor-pointer text-lg ${p === pageIndex + 1 ? 'text-primary' : ''
                          }`}
                        onClick={() => {
                          const page = Number(p) - 1;
                          gotoPage(page);
                        }}
                      >
                        {p}
                      </div>
                    ),
                )}
              </div>
              <button
                className="text-primary focus:outline-none"
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <div className="flex space-x-2">
                  <div className="">Next</div>
                  <img src={rightArrow} alt="" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App({ data, tdClassName, dipositWithdraw }) {

  return (
    <Styles>
      <Table
        data={data}
        tdClassName={tdClassName}
        dipositWithdraw={dipositWithdraw}
      />
    </Styles>
  );
}

export default App;
