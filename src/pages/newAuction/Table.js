/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toHex from 'to-hex';
import { useWindowSize } from '../../hooks/useWindowSize';
import {
  Link
} from "react-router-dom";

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

// const data = [{ id: 1, address: 1 }, { id: 2, address: 2 }]

function Table({ data }) {
  const [propsData, setPropsData] = useState([]);
  const [isTableHorizontal, setIsTableHorizontal] = useState(true);

  const { width } = useWindowSize() || {};
  useEffect(() => {
    if (width <= 1024) {
      setIsTableHorizontal(false);
    } else {
      setIsTableHorizontal(true);
    }
  }, [width]);

  return (
    <div className="relative w-full">
      <div className="bg-fadeBlack w-full p-6 mt-16">
        <Styles>
          <table
            className={`text-left ${!isTableHorizontal && 'border-thick'} ${propsData.length === 0 && 'no-data'
              }`}
          >
            <>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 && data.map(item => (
                  <tr>
                    <td>{item.address}</td>
                    <th><Link to={`/newAuction/detail/${item.address}`}><button>View</button></Link></th>
                  </tr>
                ))}
              </tbody>
            </>

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
