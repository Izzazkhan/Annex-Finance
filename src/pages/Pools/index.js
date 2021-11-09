import React, { useState } from 'react';
import Layout from '../../layouts/MainLayout/MainLayout';
import Table from './Table';
import GridView from './Grid';
import arrow from '../../assets/icons/arrow.svg';
import expandBox from '../../assets/icons/expandBox.svg';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import tick from '../../assets/icons/tick.svg';
import Greentick from '../../assets/icons/green-tick.png';
import ListIcon from '../../assets/images/card-list-btn.png';
import GridIcon from '../../assets/images/card-grid-btn.png';
import ListIconActive from '../../assets/images/card-list-btn-active.png';
import GridIconActive from '../../assets/images/card-grid-btn-active.png';
import Select from '../../components/UI/Select';
import Switch from "../../components/UI/Switch";
import { Grid } from 'react-virtualized';
import styled from 'styled-components';
import ComingSoon from '../../assets/images/coming-soon.png';
import ComingSoon2 from '../../assets/images/coming-soon-2.jpg';
import {
  CONTRACT_ANN_Vault, REACT_APP_ANN_Vault_ADDRESS
} from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
import Web3 from 'web3';
const instance = new Web3(window.ethereum);
import Loader from 'components/UI/Loader';


const Styles = styled.div`
 .border-custom{
   border-color: #2E2E2E;
 }
 .finished-label {
  position: absolute;
  right: -20px;
  transform: rotate(45deg);
  width: 200px;
}
`;
function Pools() {
  const [showGrid, setShowGrid] = useState(false)
  const [showList, setShowList] = useState(true)
  const [live, setlive] = useState(true)
  const [finished, setfinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [poolState, setPoolState] = useState('live')

  const { account } = useActiveWeb3React();

  const onClaim = () => {
    setLoading(true)
    const contract = new instance.eth.Contract(
      JSON.parse(CONTRACT_ANN_Vault),
      REACT_APP_ANN_Vault_ADDRESS,
    );
    contract.methods.harvest()
      .send({ from: account })
      .then((res) => {
        console.log('claim data', res);
        setLoading(false)
      })
      .catch((err) => {
        console.log(err);
        setLoading(false)
      });
  }

  const stakedToggle = (value) => {
    setOnlyStaked((oldVal) => !oldVal)
  }

  const stateToggle = (poolState) => {
    setPoolState(poolState)
  }

  const GridViews = () => {
    setShowGrid(true)
    setShowList(false)
  }
  const ListViews = () => {
    setShowGrid(false)
    setShowList(true)
  }
  const subComponent = (
    <div className="flex justify-between w-full text-white p-6 lg:px-16">
      <div className="w-full flex flex-col items-start ">
        <div className="flex space-x-6 items-center">
          <div className="">Get ANN-BNB LP</div>
          <img src={OrangeexpandBox} alt="" />
        </div>
        <div className="flex space-x-6 my-2 items-center">
          <div className="">View Contract</div>
          <img src={OrangeexpandBox} alt="" />
        </div>
        <div className="flex space-x-6 items-center">
          <div className="">See Pair Info</div>
          <img src={OrangeexpandBox} alt="" />
        </div>
        <button
          className="font-bold text-white bg-primary px-4 py-1 mt-5
                           rounded-3xl flex items-center space-x-2"
        >
          <img src={Greentick} alt="" />
          <div className="text-lg text-black">Core</div>
        </button>
      </div>
      <div className="flex flex-col space-y-4 xl:space-y-0 xl:flex-row xl:justify-center xl:space-x-8 w-full">
        <div className="border border-solid border-blue bg-transparent p-4 rounded-lg w-92 flex flex-col justify-between">
          <div className="font-bold text-primary text-left">ANN EARNED</div>
          <div className="flex items-center justify-between">
            <div className="font-bold text-white">9845.558</div>
            <button className="font-bold text-white bg-lightBlue py-2 px-4 rounded">Harvest</button>
          </div>
        </div>
        <div className="bg-primary p-4 rounded-lg w-92 flex flex-col justify-between">
          <div className="font-bold text-black text-left">ENABLE FARM</div>
          <button className="font-bold text-white bg-lightBlue py-2 px-4 rounded w-full">
            Enable
          </button>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      // Make an expander cell
      Header: () => null, // No header
      id: 'expander', // It needs an ID
      // eslint-disable-next-line react/display-name
      Cell: ({ row }) => (
        // Use Cell to render an expander for each row.
        // We can use the getToggleRowExpandedProps prop-getter
        // to build the expander.
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? (
            <img className="transform -rotate-90 w-2 mx-auto" src={arrow} alt="arrow" />
          ) : (
            <img className="transform rotate-180 w-2 mx-auto" src={arrow} alt="arrow" />
          )}
        </span>
      ),
    },
    {
      Header: 'Name',
      columns: [
        {
          Header: 'Coin',
          accessor: 'coin',
        },
        {
          Header: 'Earned',
          accessor: 'earned',
          disableFilters: true,
        },
        {
          Header: 'APR',
          accessor: 'APR',
          disableFilters: true,
        },
        {
          Header: 'Liquidity',
          accessor: 'liquidity',
          disableFilters: true,
        },
        {
          Header: 'Multiplier',
          accessor: 'multiplier',
          disableFilters: true,
        },
        {
          Header: 'Action',
          accessor: 'action',
          disableFilters: true,
        },
      ],
    },
  ];

  const database = [
    {
      coin: 'Bitcoin',
      earned: '?',
      APR: 13.7,
      liquidity: 869.34,
      multiplier: 12,
      action: 'detail',
    },
    {
      coin: 'Ethereum',
      earned: '?',
      APR: 135.07,
      liquidity: 869.34,
      multiplier: 9,
      action: 'detail',
    },
    {
      coin: 'Ripple',
      earned: '?',
      APR: 132.27,
      liquidity: 869.34,
      multiplier: 10,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
    {
      coin: 'Litecoin',
      earned: '?',
      APR: 13.227,
      liquidity: 12869.34,
      multiplier: 11,
      action: 'detail',
    },
  ];
  const sortOptions = [
    { name: 'Hot' },
    { name: 'APR' },
    { name: 'Multiplier' },
    { name: 'Earned' },
    { name: 'Liquidity' },
  ];
  const data = React.useMemo(() => database, []);

  return (
    <Layout mainClassName="min-h-screen py-8">
      {/* <div className="flex justify-between items-center w-full text-white">
        <div className="coming-soon">
          <div className="image">
            <img src={ComingSoon} alt="Coming Soon" className="" />
          </div>
        </div>
      </div> */}

      <Styles>
        <div className="grid grid-cols-1 gap-y-3 md:gap-y-0 md:grid-cols-12 md:gap-x-3 px-10 pt-0 py-6
 pl-6 lg:pr-5 ">
          {/* <div className="col-span-6 flex items-center">
            <div className="list-icon">
              <a onClick={ListViews}>{showList ? <img src={ListIconActive} alt="" className="" width="28px" height="25px" />
                : <img src={ListIcon} alt="" className="" width="28px" height="25px" />}</a>
            </div>
            <div className="grid-icon ml-3">
              <a onClick={GridViews}>{showGrid ? <img src={GridIconActive} alt="" className="" width="25px" height="25px" />
                : <img src={GridIcon} alt="" className="" width="25px" height="25px" />}</a>
            </div>
          </div> */}
          {/* <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 "> */}

          <div className="col-span-3 claim-card">
            <div className='bgPrimaryGradient p-5 rounded-2xl flex items-between w-full justify-between flex-col'
            >

              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-bold">Auto ANN Bounty</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-bold text-lg">0.000</div>
                  <div className="text-white text-sm ">0.000 USDC</div>
                </div>
                <div className="text-white font-bold flex items-center">
                  <button className={`flex items-center focus:outline-none bg-white ${loading ?
                    " bg-lightGray text-gray pointer-events-none " :
                    "  text-primary "} py-2 px-4
                        rounded-lg text-center font-bold text-sm`} onClick={onClaim}>
                    {loading && <Loader size="20px" className="mr-4" stroke="#717579" />}
                    Claim</button></div>
              </div>

            </div>
          </div>
          <div className="col-span-9 flex items-center justify-end">
            <button className={`focus:outline-none py-2 px-4 rounded-3xl text-white w-40 text-center
             ${poolState === 'live' ? "bgPrimaryGradient" : "bg-transparent border border-primary"} `}
              onClick={() => stateToggle('live')}>Live</button>
            <button className={`focus:outline-none py-2 px-4 rounded-3xl text-white w-40 text-center ml-5
             ${poolState === 'finished' ? "bgPrimaryGradient" : "bg-transparent border border-primary"} `}
              onClick={() => stateToggle('finished')}>Finished</button>
            <div className="flex items-center text-white ml-5 pt-2">
              <Switch value={onlyStaked} onChange={stakedToggle} />
              <div className="ml-2 mb-2">Staked only</div>
            </div>
          </div>

          {/* <div className="col-span-5 flex items-center">
            <div className="mr-5">
              <Select className="border-primary" type="custom-primary" options={sortOptions} />
            </div>
            <div className="search flex-1">
              <input
                className="border border-solid border-primary bg-transparent
                 rounded-lg w-full focus:outline-none font-normal px-4 py-2 text-white text-lg"
                type="text"
                placeholder="Search"
              />
            </div>

          </div> */}

        </div>

        <GridView onlyStaked={onlyStaked} poolState={poolState} />
        {/* {showGrid && !showList ? <GridView /> : <Table columns={columns} data={data} tdClassName="" subComponent={subComponent} />} */}
      </Styles>
    </Layout>
  );
}

export default Pools;
