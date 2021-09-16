import React, { useState } from 'react';
import Layout from '../../layouts/MainLayout/MainLayout';
import Table from './Table';
import Cards from './Cards';
import { DepositWithdrawModal, LiquidityModal } from './Modal';
import Select from '../../components/UI/Select';
import Switch from "../../components/UI/Switch";
import arrow from '../../assets/icons/arrow.svg';
import expandBox from '../../assets/icons/expandBox.svg';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import tick from '../../assets/icons/tick.svg';
import Greentick from '../../assets/icons/green-tick.png';
import ListIcon from '../../assets/images/card-list-btn.png';
import GridIcon from '../../assets/images/card-grid-btn.png';
import ListIconActive from '../../assets/images/card-list-btn-active.png';
import GridIconActive from '../../assets/images/card-grid-btn-active.png';
import ComingSoon from '../../assets/images/coming-soon.png';
import ComingSoon2 from '../../assets/images/coming-soon-2.jpg';
import annCoin from '../../assets/images/coins/ann.png'
import ethCoin from '../../assets/images/coins/ceth.png'
import upArrow from '../../assets/icons/arrowUp.png'


function Farms() {
  const [cryptoToggle, setCryptoToggle] = useState('ETH')
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [isGridView, setIsGridView] = useState(true)
  const [showLiquidityModal, setShowLiquidityModal] = useState(false)
  const [showDepositeWithdrawModal, setShowDepositeWithdrawModal] = useState(false)

  const columns = [
    {
      Header: 'Farms',
      // accessor: 'farms',
      disableSortBy: true,
      Cell: ({ value, row }) => (
        <div className="flex justify-center">
          <div className="mr-5 relative h-12 w-12">
            <img src={annCoin} alt="" className="h-8" />
            <img src={ethCoin} alt="" className="h-8 absolute right-0 bottom-0" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{row.original.coin} Token Wrapped ANN</span>
            <span className="mt-1 text-xs font-light">ANN - {row.original.coinAbbr}</span>
          </div>
        </div>
      ),
    },
    {
      Header: () => (<>Yield <span className="text-sm font-light">(per $1,000)</span></>),
      accessor: 'yield',
      disableSortBy: true,
      Cell: ({ value, row }) => (
        <div className="flex flex-col text-sm">
          <span className="font-light">{value} ANN / Day</span>
          <span className="text-primary font-bold">100 allocPoint</span>
        </div>
      )
    },
    {
      Header: 'APY',
      accessor: 'APY',
      Cell: ({ value, row }) => (
        <span className="font-bold flex items-center justify-center">
          <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
          {value}%
        </span>
      )
    },
    {
      Header: 'Liquidity',
      accessor: 'liquidity',
      // sortedContainerClass: 'ml-6',
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
          <span className="font-bold text-primary">{value} ANN</span>
          <span className="font-normal">No Rewards</span>
        </div>
      )
    },
    {
      Header: '',
      accessor: 'empty',
      disableSortBy: true,
      Cell: ({ value, row }) => (
        <div>
          <button className="text-primary font-bold 
              rounded-3xl p-2 outline-none border border-primary" onClick={() => { setShowLiquidityModal(true) }}>
            Add Liquidity
          </button>
          <div className="mt-2 flex justify-center cursor-pointer">Approve Staking</div>
        </div>
      )
    },
  ]
  const database = [
    {
      coin: 'Etherium',
      coinAbbr: 'ETH',
      yield: 0.43,
      APY: 13.7,
      liquidity: '$161,150.71',
      staked: '$0.00',
      earned: 0,
    },
    {
      coin: 'Binance',
      coinAbbr: 'BND',
      yield: 0.43,
      APY: 13.7,
      liquidity: '$261,150.71',
      staked: '$0.00',
      earned: 0,
    },
    {
      coin: 'Binance',
      coinAbbr: 'BND',
      yield: 0.43,
      APY: 13.7,
      liquidity: '$261,150.71',
      staked: '$0.00',
      earned: 0,
    },
    {
      coin: 'Etherium',
      coinAbbr: 'ETH',
      yield: 0.43,
      APY: 13.7,
      liquidity: '$261,150.71',
      staked: '$0.00',
      earned: 0,
    },
    {
      coin: 'Etherium',
      coinAbbr: 'ETH',
      yield: 0.43,
      APY: 13.7,
      liquidity: '$261,150.71',
      staked: '$0.00',
      earned: 0,
    },
  ]
  const sortOptions = [
    { name: 'Hot' },
    { name: 'APR' },
    { name: 'Multiplier' },
    { name: 'Earned' },
    { name: 'Liquidity' },
  ];
  const data = React.useMemo(() => database, []);
  const handleFocus = (event) => event.target.select();

  return (
    <Layout mainClassName="min-h-screen py-8">
      {/* <div className="flex justify-between items-center w-full text-white">
        <div className="coming-soon">
          <div className="image">
            <img src={ComingSoon} alt="Coming Soon" className="" /> 
          </div>
        </div>
      </div> */}


      <div className="grid grid-cols-1 gap-y-3 md:gap-y-0 md:grid-cols-12 md:gap-x-3 pt-0 py-6
        ">
        <div className="col-span-2 flex items-center">
          <div className="list-icon">
            <a href="#" onClick={() => setIsGridView(false)}>
              <img
                src={(isGridView) ? ListIcon : ListIconActive}
                alt=""
                className="h-6"
              />
            </a>
          </div>
          <div className="grid-icon ml-3">
            <a href="#" onClick={() => setIsGridView(true)}>
              <img
                src={(isGridView) ? GridIconActive : GridIcon}
                alt=""
                className="h-6"
              />
            </a>
          </div>
        </div>
        <div className="col-span-5 flex items-center">
          <div className="relative flex border border-primary rounded-3xl">
            <div
              className={`flex absolute h-full w-6/12 bgPrimaryGradient rounded-3xl 
              border border-primary transition-all ` + (cryptoToggle === "ETH" ? "" : "ml-40")}></div>
            <a
              className={`focus:outline-none bg-transparent py-2 px-4 
                rounded-3xl w-40 text-center z-10 cursor-pointer ` + (cryptoToggle === "ETH" ? "text-black font-bold" : "text-primary")}
              onClick={() => setCryptoToggle('ETH')}
            >
              Ethereum</a>
            <a
              className={`focus:outline-none bg-transparent py-2 px-4
                rounded-3xl w-40 text-center z-10 cursor-pointer ` + (cryptoToggle === "ETH" ? "text-primary" : "text-black font-bold")}
              onClick={() => setCryptoToggle('BNB')}
            >Binance</a>
          </div>
          <div className="flex items-center text-white ml-5 pt-2">
            <Switch value={onlyStaked} onChange={() => setOnlyStaked((oldVal) => !oldVal)} />
            <div className="ml-2 mb-2">Staked only</div>
          </div>
        </div>
        <div className="col-span-5 flex items-center">
          <div className="mr-5">
            <Select className="border-primary" selectedClassName="px-4 py-2" type="custom-primary" options={sortOptions} />
          </div>
          <div className="search flex-1">
            <input
              onFocus={handleFocus}
              className="border border-solid border-primary bg-transparent
                 rounded-lg w-full focus:outline-none font-normal px-4 py-2 text-white text-lg"
              type="text"
              placeholder="Search"
            />
          </div>

        </div>

      </div>
      {
        showLiquidityModal && (
          <LiquidityModal back={() => { setShowLiquidityModal(false) }} dipositWithdraw={() => { setShowDepositeWithdrawModal(true) }} />
        )
      }
      {
        showDepositeWithdrawModal && (
          <DepositWithdrawModal close={() => { setShowDepositeWithdrawModal(false) }} />
        )
      }
      {
        !showDepositeWithdrawModal &&
        !showLiquidityModal && (
          (isGridView) ? (
            <Cards data={data} addLiquidity={() => { setShowLiquidityModal(true) }} />
          ) : (
            <Table columns={columns} data={data} tdClassName="" />
          )
        )
      }
    </Layout>
  );
}

export default Farms;
