import styled from "styled-components";
import {matchSorter} from "match-sorter";
import moment from 'moment';
import {
    useTable,
    useSortBy,
    useExpanded,
} from 'react-table';
import React, { Fragment } from "react";

import sortUp from '../../assets/icons/sortUp.svg';
import sortDown from '../../assets/icons/sortDown.svg';

const Styles = styled.div`
  width: 100%;
  overflow: auto;

  table {
    width: 100%;
    background-color: #0a0a0e;
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

    th {
      padding: 1rem !important;
      font-size: 1.12rem;
    }

    td {
      padding: 0.8rem 2rem 0.8rem 0;
    }

    th,
    td {
      margin: 0;
      text-align: right;
      padding: 0.8rem 2rem 0.8rem 0 !important;

      :last-child {
        border-right: 0;
      }
      
      :first-child {
        text-align: left;
        padding-left: 1.5rem !important;
      }
    }
  }
`;


function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;


function Table({ columns, data, onRowClick }) {

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data,
            defaultColumn: 'rank',
            autoResetSortBy: false,
        },
        useSortBy,
        useExpanded,
    );


    return (
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
                                {index !== 6 && (
                                    <span>
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <img
                                                className="inline relative left-1"
                                                src={sortDown}
                                                alt="sort down"
                                                />
                                            ) : (
                                                <img className="inline relative left-1" src={sortUp} alt="sort up"/>
                                            )
                                        ) : (
                                            <div className="inline inline-flex flex-col space-y-0.5 relative bottom-1 left-1">
                                                <img className="inline w-2.5" src={sortUp} alt="sort up"/>
                                                <img className="inline w-2.5" src={sortDown} alt="sort down"/>
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
            {rows.map((row, i) => {
                prepareRow(row);
                return (
                    // eslint-disable-next-line react/jsx-key
                    <Fragment key={i}>
                        <tr {...row.getRowProps()} onClick={onRowClick.bind(this, row)} className="cursor-pointer">
                            {row.cells.map((cell) => {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <td {...cell.getCellProps()} className="">
                                        <div
                                            className={
                                                cell.column.Header === 'Rank'
                                                    ? ''
                                                    : cell.column.Header === 'Supply'
                                                    ? ''
                                                    : ''
                                            }
                                        >
                                            {cell.render('Cell')}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    </Fragment>
                );
            })}
            </tbody>
        </table>
    )


}

function Application({ columns, data, onRowClick }) {
    return (
        <Styles>
            <Table
                columns={columns}
                data={data}
                onRowClick={onRowClick}
            />
        </Styles>
    );
}

const App = React.memo(Application)

export default App;
