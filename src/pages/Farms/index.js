import React, { useEffect, useState } from 'react'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout'
import Table from './Table'
import Card from './Card'
import { DepositWithdrawModal } from './Modal'
import Select from '../../components/UI/Select'
import Switch from "../../components/UI/Switch"
import ListIcon from '../../assets/images/card-list-btn.png'
import GridIcon from '../../assets/images/card-grid-btn.png'
import ListIconActive from '../../assets/images/card-list-btn-active.png'
import GridIconActive from '../../assets/images/card-grid-btn-active.png'
import annCoin from '../../assets/images/coins/ann.png'
import { connectAccount, useFarms, usePollFarmsData } from 'core'
import BigNumber from 'bignumber.js';
import Loader from 'components/UI/Loader';

import sxp from '../../assets/images/coins/sxp.png';
import usdc from '../../assets/images/coins/usdc.png';
import usdt from '../../assets/images/coins/usdt.png';
import busd from '../../assets/images/coins/busd.png';
import bnb from '../../assets/images/coins/bnb.png';
import btc from '../../assets/images/coins/btc.png';
import eth from '../../assets/images/coins/eth.png';
import ltc from '../../assets/images/coins/ltc.png';
import xrp from '../../assets/images/coins/xrp.png';
import link from '../../assets/images/coins/link.png';
import dot from '../../assets/images/coins/dot.png';
import bch from '../../assets/images/coins/bch.png';
import dai from '../../assets/images/coins/dai.png';
import fil from '../../assets/images/coins/fil.png';
import beth from '../../assets/images/coins/beth.png';
import ada from '../../assets/images/coins/ada.png';
import doge from '../../assets/images/coins/doge.png';
import trx from '../../assets/images/coins/trx.png';
import tusd from '../../assets/images/coins/tusd.png';
import xvs from '../../assets/images/coins/xvs.png';
import cake from '../../assets/images/coins/cake.png';
import ann from '../../assets/images/coins/ann.png';

const icons = {
  sxp,
  usdc,
  usdt,
  busd,
  bnb,
  btc,
  eth,
  ltc,
  xrp,
  link,
  dot,
  bch,
  dai,
  fil,
  beth,
  ada,
  doge,
  trx,
  tusd,
  xvs,
  cake,
  ann,
}

const Styles = styled.div`
  width: 100%;
  overflow: auto;
  background-color: #101016;
  border-radius: 1.5rem;
  display: flex;
  justify-content: center;
`;

function Farms({ settings }) {
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [isGridView, setIsGridView] = useState(true)
  const [showDepositeWithdrawModal, setShowDepositeWithdrawModal] = useState(false)
  const [filteredPairs, setFilteredPairs] = useState([])
  const [selectedFarm, setSelectedFarm] = useState(null)

  let { data: pairs, loading } = useFarms()
  usePollFarmsData()

  const attatchImgWithData = (data) => {
    if (data && data.length > 0) {
      data = data.map(pair => {
        const userPercent = pair.userData
          ? new BigNumber(pair.userData.stakedBalance).div(1e18).div(pair.totalSupply)
          : new BigNumber(0)
        let token0Amount = 0
        let token1Amount = 0
        if (pair.userData) {
          token0Amount = pair.token1Symbol
            ? new BigNumber(pair.reserve0)
              .div(new BigNumber(10).pow(pair.token0Decimals))
              .times(userPercent)
              .dp(2, 1)
              .toString(10)
            : new BigNumber(pair.userData.stakedBalance)
              .div(new BigNumber(10).pow(pair.token0Decimals))
              .dp(2, 1)
              .toString(10)
          token1Amount = new BigNumber(pair.reserve1)
            .div(new BigNumber(10).pow(pair.token1Decimals))
            .times(userPercent)
            .dp(2, 1)
            .toString(10)
          pair.userData.token0Amount = token0Amount
          pair.userData.token1Amount = token1Amount
          pair.userData.token0AmountUSD = new BigNumber(pair.reserve0USD).times(userPercent).toString(10)
          pair.userData.token1AmountUSD = new BigNumber(pair.reserve1USD).times(userPercent).toString(10)
          pair.userData.stakedAmountUSD = pair.token1Symbol
            ? new BigNumber(pair.userData.token0AmountUSD)
              .plus(pair.userData.token1AmountUSD)
              .dp(2, 1)
              .toString(10)
            : new BigNumber(pair.userData.token0AmountUSD)
              .dp(2, 1)
              .toString(10)
        }

        return {
          ...pair,
          userPercent: userPercent.toString(10),
          token0Img: icons[pair.token0Symbol.toLowerCase()]
            ? icons[pair.token0Symbol.toLowerCase()]
            : null,
          token1Img: pair.token1Symbol && icons[pair.token1Symbol.toLowerCase()]
            ? icons[pair.token1Symbol.toLowerCase()]
            : null,
        }
      })
      setFilteredPairs(data)
    }
  }

  useEffect(() => {
    attatchImgWithData(pairs)
  }, [pairs])

  const sortOptions = [
    { name: 'APY' },
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
    if (data.length === 0) {
      setFilteredPairs(data)
      return
    }
    attatchImgWithData(data)
  }

  const stakedFilterToggle = (value) => {
    setOnlyStaked((oldVal) => !oldVal)
    // Perform Action here
    if (value) {
      const data = pairs.filter((obj, index) => {
        let check = false
        if (new BigNumber(obj.userData ? obj.userData.stakedBalance : 0).isGreaterThan(0)) {
          check = true
        }
        return check
      })
      if (data.length === 0) {
        setFilteredPairs(data)
      } else {
        attatchImgWithData(data)
      }
    } else {
      attatchImgWithData(pairs)
    }
  }

  const sortFilter = (value) => {
    const data = pairs.sort((a, b) => {
      switch (value.name) {
        case 'APY':
          return new BigNumber(b.apy).isGreaterThan(new BigNumber(a.apy)) ? 1 : -1
        case 'Multiplier':
          return new BigNumber(b.rewardPerDay).isGreaterThan(new BigNumber(a.rewardPerDay)) ? 1 : -1
        case 'Earned':
          return new BigNumber(b.userData ? b.userData.earnings : 0).isGreaterThan(new BigNumber(a.userData ? a.userData.earnings : 0)) ? 1 : -1
        case 'Liquidity':
          return new BigNumber(b.liquidity).isGreaterThan(new BigNumber(a.liquidity)) ? 1 : -1
        default:
          return 0
      }
    })
    attatchImgWithData(data)
  }

  const openDepositWithdrawModal = (shouldOpen, item, stakeType) => {
    setShowDepositeWithdrawModal(shouldOpen)
    setSelectedFarm(shouldOpen ? { ...item, stakeType } : null)
  }

  return (
    <Layout mainClassName="min-h-screen py-8">
      <div className="flex justify-between pt-0 py-6">
        <div className="flex items-center">
          <div className="list-icon">
            {/* <a href="#" onClick={() => setIsGridView(false)}>
              <img
                src={(isGridView) ? ListIcon : ListIconActive}
                alt=""
                className="h-6"
              />
            </a> */}
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
            <Select className="border-primary" selectedClassName="px-4 py-2" type="custom-primary" options={sortOptions} onChange={sortFilter} />
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
      {(filteredPairs.length === 0) ? (
        <Styles>
          <div className="text-white text-base p-20 flex justify-center">
            <span className="text-center text-grey text-2xl md:text-3xl 
              text-border title-text">There are no pairs</span>
          </div>
        </Styles>
      ) : (<>
        {
          showDepositeWithdrawModal && (
            <DepositWithdrawModal
              close={() => { setShowDepositeWithdrawModal(false) }}
              item={selectedFarm}
              type={selectedFarm?.type}
              stakeType={selectedFarm.stakeType}
            />
          )
        }
        {
          !showDepositeWithdrawModal && (
            (isGridView) ? (
              // <Cards data={data} harvest={harvest} stake={stake} unStake={unStake} approve={approve} />
              <Styles>
                <div className="p-4 flex flex-row flex-wrap">
                  {
                    loading ? (
                      <Loader size="160px" className="m-40" stroke="#ff9800" />
                    ) : (
                      data.map((item, key) => {
                        return (
                          <Card key={key} item={item} dipositWithdraw={openDepositWithdrawModal} />
                        )
                      })
                    )
                  }
                </div>
              </Styles>
            ) : (
              <Table data={data} tdClassName="" dipositWithdraw={openDepositWithdrawModal} />
            )
          )
        }
      </>)
      }
    </Layout >
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
