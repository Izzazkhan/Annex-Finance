import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/MainLayout/MainLayout';
import config from '../../constants/config';
import Table from './Table';
import Cards from './Cards';
import { DepositWithdrawModal, LiquidityModal } from './Modal';
import Select from '../../components/UI/Select';
import Switch from "../../components/UI/Switch";
import ListIcon from '../../assets/images/card-list-btn.png';
import GridIcon from '../../assets/images/card-grid-btn.png';
import ListIconActive from '../../assets/images/card-list-btn-active.png';
import GridIconActive from '../../assets/images/card-grid-btn-active.png';
import annCoin from '../../assets/images/coins/ann.png'
import upArrow from '../../assets/icons/arrowUp.png'
import annLogo from '../../assets/icons/logoSolid.svg'
import pancakeLogo from '../../assets/images/pancakeswap-logo.png'
import { connectAccount, useFarms, usePollFarmsData } from 'core';
import { bindActionCreators } from 'redux';
import BigNumber from 'bignumber.js';
import commaNumber from 'comma-number';
import _ from 'lodash';


function Farms({ settings }) {
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [isGridView, setIsGridView] = useState(true)
  const [showLiquidityModal, setShowLiquidityModal] = useState(false)
  const [showDepositeWithdrawModal, setShowDepositeWithdrawModal] = useState(false)
  const [filteredPairs, setFilteredPairs] = useState([])

  const format = commaNumber.bindWith(',', '.');

  const { data: pairs } = useFarms()
  usePollFarmsData()

  useEffect(() => {
    if (pairs && pairs.length !== 0) {
      setFilteredPairs(pairs)
    }
  }, [pairs])

  const getTokenDetails = (symbol) => {
    return settings.assetList.find((obj => obj.symbol === symbol))
  }
  console.log('pair: ', pairs)

  const harvest = (obj) => { }
  const stake = (obj) => { }
  const upStake = (obj) => { }

  const columns = [
    {
      Header: 'Farms',
      disableSortBy: true,
      Cell: ({ value, row }) => {
        const token1Details = getTokenDetails(row.original?.token1Symbol)
        return (
          <div className="flex justify-center">
            <div className="flex flex-1">
              <div className="mr-5 relative h-12 w-12">
                <img src={annCoin} alt="" className="h-8" />
                {token1Details && <img src={token1Details.img} alt="" className="h-8 absolute right-0 bottom-0" />}
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
      Cell: ({ value, row }) => (
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
                  border-primary ${row.original.token1 === null ? 'invisible' : ''}`}
                  onClick={() => {
                    stake(row.original)
                  }}>Stake</button>
                {
                  new BigNumber(row.original.userData.stakedBalance).isGreaterThan(0) && (
                    <button
                      className={`text-primary font-bold 
                      rounded-3xl p-2 outline-none border mt-2 
                      border-primary  ${row.original.token1 === null ? 'invisible' : ''}`}
                      onClick={() => {
                        upStake(row.original)
                      }}>UnStake</button>
                  )
                }
              </>
            ) : (
              <div className="mt-2 flex justify-center cursor-pointer" onClick={() => {
                // it should be the transparent button
              }}>Approve Staking</div>
            )
          }
        </div>
      )
    },
  ]
  const sortOptions = [
    { name: 'Hot' },
    { name: 'APR' },
    { name: 'Multiplier' },
    { name: 'Earned' },
    { name: 'Liquidity' },
  ];
  const data = React.useMemo(() => filteredPairs, [filteredPairs]);
  const handleFocus = (event) => event.target.select();

  const filterSearch = (search) => {
    const data = pairs.filter((obj, index) => {
      let check = false
      _.forEach(obj, (val, key) => {
        if (_.lowerCase(val).includes(search) || `${val}`.includes(search) || search.trim() === '') {
          check = true
        }
      })
      return check
    })
    setFilteredPairs(data)
  }

  const stakedFilterToggle = (value) => {
    setOnlyStaked((oldVal) => !oldVal)
    // Perform Action here

  }

  return (
    <Layout mainClassName="min-h-screen py-8">
      <div className="flex justify-between pt-0 py-6">
        <div className="flex items-center">
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
        <div className="flex items-center">
          <div className="flex items-center text-white mr-5 pt-2">
            <Switch value={onlyStaked} onChange={stakedFilterToggle} />
            <div className="ml-2 mb-2">Staked only</div>
          </div>
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
              style={{ minWidth: '200px' }}
              onChange={(event) => {
                filterSearch(event.target.value)
              }}
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
            <Cards data={data} harvest={harvest} stake={stake} upStake={upStake} />
          ) : (
            <Table columns={columns} data={data} tdClassName="" />
          )
        )
      }
    </Layout>
  );
}

Farms.defaultProps = {
  settings: {},
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Farms);
