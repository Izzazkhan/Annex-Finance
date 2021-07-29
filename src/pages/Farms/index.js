import React from 'react';
import Layout from '../../layouts/MainLayout/MainLayout';
import Table from './Table';
import arrow from '../../assets/icons/arrow.svg';
import expandBox from '../../assets/icons/expandBox.svg';
import tick from '../../assets/icons/tick.svg';
import ListIcon from '../../assets/images/card-list-btn.png';
import GridIcon from '../../assets/images/card-grid-btn.png';
import Select from '../../components/UI/Select';
import Switch from "../../components/UI/Switch";


function Farms() {
  const subComponent = (
    <div className="flex justify-between w-full text-white lg:px-16">
      <div className="w-full flex flex-col items-start space-y-1">
        <div className="flex space-x-6">
          <div className="">Get ANN-BNB LP</div>
          <img src={expandBox} alt="" />
        </div>
        <div className="flex space-x-6">
          <div className="">View Contract</div>
          <img src={expandBox} alt="" />
        </div>
        <div className="flex space-x-6">
          <div className="">See Pair Info</div>
          <img src={expandBox} alt="" />
        </div>
        <button
          className="font-bold text-white bg-primary px-4 py-1 mt-3
                           rounded-3xl flex items-center space-x-2"
        >
          <img src={tick} alt="" />
          <div className="text-lg text-black">Core</div>
        </button>
      </div>
      <div className="flex flex-col space-y-4 xl:space-y-0 xl:flex-row xl:justify-center xl:space-x-8 w-full">
        <div className="bg-primary p-4 rounded-lg w-92 flex flex-col justify-between">
          <div className="font-bold text-black">ANN EARNED</div>
          <div className="flex items-center justify-between">
            <div className="font-bold text-black">9845.558</div>
            <button className="font-bold text-white bg-lightBlue py-2 px-4 rounded">Harvest</button>
          </div>
        </div>
        <div className="bg-primary p-4 rounded-lg w-92 flex flex-col justify-between">
          <div className="font-bold text-black">ENABLE FARM</div>
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
      <div className="grid grid-cols-1 gap-y-3 md:gap-y-0 md:grid-cols-3 md:gap-x-3 px-10 pt-0 py-6
 pl-6 lg:pr-8 ">
        <div className="flex items-center">
          <div className="list-icon">
            <img src={ListIcon} alt="" className="" />
          </div>
          <div className="grid-icon ml-3">
            <img src={GridIcon} alt="" className="" />
          </div>
        </div>
        <div className="flex items-center">
          <a href="" className="focus:outline-none bgPrimaryGradient py-2 px-4 rounded-3xl text-white w-40 text-center">Live</a>
          <a href="" className="focus:outline-none bg-transparent border border-primary py-2 px-4 
          rounded-3xl text-white ml-5 w-40 text-center">Finished</a>
          <div className="">
            <Switch/>
            <label>Staked only</label>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-5">
          <Select className="border-primary" type="basic" options={sortOptions} />
          </div>
          <div className="search">
            <input
              className="border border-solid border-primary bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 py-2 text-white text-lg"
              type="text"
              placeholder="Search"
            />
          </div>

        </div>

      </div>
      <Table columns={columns} data={data} tdClassName="" subComponent={subComponent} />
    </Layout>
  );
}

export default Farms;
