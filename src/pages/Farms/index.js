import React, { useEffect, useState } from 'react'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout'
import Table from './Table'
import Card from './Card'
import { DepositWithdrawModal, LiquidityModal } from './Modal'
import Select from '../../components/UI/Select'
import Switch from "../../components/UI/Switch"
import ListIcon from '../../assets/images/card-list-btn.png'
import GridIcon from '../../assets/images/card-grid-btn.png'
import ListIconActive from '../../assets/images/card-list-btn-active.png'
import GridIconActive from '../../assets/images/card-grid-btn-active.png'
import annCoin from '../../assets/images/coins/ann.png'
import { connectAccount, useFarms, usePollFarmsData } from 'core'

const Styles = styled.div`
  width: 100%;
  overflow: auto;
  background-color: #101016;
  border-radius: 1.5rem;
`;

function Farms({ settings }) {
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [isGridView, setIsGridView] = useState(true)
  const [showLiquidityModal, setShowLiquidityModal] = useState(false)
  const [showDepositeWithdrawModal, setShowDepositeWithdrawModal] = useState(true)
  const [filteredPairs, setFilteredPairs] = useState([])

  let { data: pairs } = useFarms()
  usePollFarmsData()

  useEffect(() => {
    if (pairs && pairs.length !== 0) {
      pairs = pairs.map(pair => {
        const token0 = settings.assetList.find((obj => obj.symbol === pair.token0Symbol))
        const token1 = settings.assetList.find((obj => obj.symbol === pair.token1Symbol))

        return {
          ...pair,
          token0Img: token0
            ? token0.img
            : annCoin,
          token1Img: token1
            ? token1.img
            : null,
        }
      })
      setFilteredPairs(pairs)
    }
  }, [pairs])

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
            // <Cards data={data} harvest={harvest} stake={stake} unStake={unStake} approve={approve} />
            <Styles>
              <div className="p-4 flex flex-row flex-wrap">
              {
                data.map((item, key) => {
                  return (
                    <Card key={key} item={item} />
                  )
                })
              }
              </div>
            </Styles>
          ) : (
            <Table data={data} tdClassName="" />
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
