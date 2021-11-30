import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import annCoin from '../../assets/images/coins/ann.png'
import annLogo from '../../assets/icons/logoSolid.svg'
import pancakeLogo from '../../assets/images/pancakeswap-logo.png'
import upArrow from '../../assets/icons/arrowUp.png'
import config from '../../constants/config';
import BigNumber from 'bignumber.js';
import commaNumber from 'comma-number';
import useApproveFarm from 'hooks/farms/useApproveFarm'
import useHarvestFarm from 'hooks/farms/useHarvestFarm'
import { useLP } from "hooks/useContracts"
import Loader from 'components/UI/Loader';
import styled from 'styled-components';


const harvest = (obj) => { }
const Styles = styled.div`
  div.right-col-width {
    width: 38.5%;
  }
  .tooltip {
    margin-bottom: 5px;
    .label {
      display: none;
      position: absolute;
      bottom: 100%;
      left: 0;
      color: #e2e2e2;
      font-size: 14px;
      font-weight: 400;
      max-width: 270px;
      width: 14rem;
      text-align: center;
      background: #101016;
      padding: 5px 10px;
      min-height: 50px;
      align-items: center;
      justify-content: center;
      top: auto;
      border-radius: 10px;
      line-height: normal;
      border: 2px solid #B068009C;
      height: auto;
    }
    .tooltip-label {
      text-decoration-line: underline;
      text-decoration-style: dotted;
      text-underline-offset: 5px;
    }
    .tooltip-label:hover + .label {
      display: flex;
    }
  }
 `

function Card({ item, dipositWithdraw }) {
  const format = commaNumber.bindWith(',', '.');
  const [pendingTx, setPendingTx] = useState(false)
  const lpContract = useLP(item.lpAddress, true)
  const { onApprove } = useApproveFarm(lpContract)
  const { onReward } = useHarvestFarm(item.pid)

  return (
    <Styles>
      <div className="text-white text-base py-7 px-6 m-6 rounded-3xl border border-primary">
        <div className="flex justify-between">
          <div className="flex">
            <div className="mr-3 relative h-14 w-14">
              <img src={item.token0Img} alt="" className="h-8" />
              {item.token1Img && <img src={item.token1Img} alt="" className="h-10 absolute right-0 bottom-0" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold">
                {item.token1Name && (item.token1Name + " ")}{item.token0Name}
              </span>
              <span className="mt-2">{item.token0Symbol}{item.token1Symbol && ` - ${item.token1Symbol}`}</span>
            </div>
          </div>
          <div className="mr-4">
            {
              item.type === 'pancake_lp' ? (
                <img src={pancakeLogo} alt="" className="h-8 title-tooltip" title={item.lpName} />
              ) : (
                <img src={annLogo} alt="" className="h-8 title-tooltip" title={item.lpName} />
              )
            }
          </div>
        </div>
        <div className="flex mt-7 justify-between">
          <div className="font-bold text-primary text-lg">Yield (per $1,000)</div>
          <div className="flex w-6/12">
            <img src={annCoin} alt="" className="h-8 mr-4" />
            <div className="flex flex-col">
              <span className="font-bold">
                {format(
                  new BigNumber(item.rewardPerDayPerThousand).gt(10000000)
                    ? 10000000
                    : new BigNumber(item.rewardPerDayPerThousand)
                      .dp(2)
                      .toString(10)
                )} ANN / Day
              </span>
              <span className="mt-2 text-primary">{item.allocPoint} allocPoint</span>
            </div>
          </div>
        </div>
        <div className="flex mt-5 justify-between">
          <div>
            <div
              className={` open mb-2 font-bold text-primary text-lg`}
            >
              <div className="tooltip relative">
                <div className="tooltip-label">
                  APY<span className=""></span>
                </div>
                <span className="label">
                  For Information Purposes.
                  Calculated based on current rates
                  {" & "}
                  assuming you manually compound daily. This Pool does not Auto Compound
                </span>
              </div>
            </div>
            <span className="font-bold mt-3.5 flex items-center">
              <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
              {format(
                new BigNumber(item.apy).gt(1000000000)
                  ? 1000000000
                  : new BigNumber(item.apy)
                    .dp(2)
                    .toString(10)
              )}%
            </span>
          </div>
          <div className="flex flex-col right-col-width">
            <span className="font-bold text-primary text-lg">Liquidity</span>
            <span className="mt-2 font-bold mt-3.5">
              ${format(
                new BigNumber(item.liquidity)
                  .dp(2)
                  .toString(10)
              )}
            </span>
          </div>
        </div>
        <div className="flex mt-5 justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-primary text-lg">Staked</span>
            <span className="mt-2 font-bold mt-3.5">
              {
                item.userData ? '$' + format(item.userData.stakedAmountUSD) : 0
              }
            </span>
          </div>
          <div className="flex self-end right-col-width">
            <span className="text-primary">
              {item.userData ? item.userData.token0Amount : 0} {item.token0Symbol}
              {
                item.token1Symbol &&
                ` / ${item.userData ? item.userData.token1Amount : 0} ${item.token1Symbol}`
              }
            </span>
          </div>
        </div>
        <div className="flex mt-5 justify-between">
          <div>
            <span className="font-bold text-primary text-lg">Earned</span>
          </div>
          <div className="flex w-6/12">
            <img src={annCoin} alt="" className="h-8 mr-4" />
            <div className="flex flex-col">
              <span className="font-bold">
                {new BigNumber(item.userData ? item.userData.earnings : 0)
                  .div(1e18)
                  .dp(6, 1)
                  .toString(10)} ANN
              </span>
              {
                new BigNumber(item.userData ? item.userData.earnings : 0).isGreaterThan(0) ? (
                  <button
                    className={`p-1.5 flex justify-center items-center 
                    font-bold rounded-md mt-2 
                    text-md outline-none
                    ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bgPrimaryGradient text-black "}`}
                    onClick={async () => {
                      setPendingTx(true)
                      await onReward(item.pid)
                      setPendingTx(false)
                    }}>
                    {pendingTx && <Loader size="20px" className="mr-1.5" stroke="#717579" />}
                    Harvest Now
                  </button>
                ) : (
                  <span className="mt-2 text-primary mb-4">No Rewards</span>
                )
              }
            </div>
          </div>
        </div>
        {
          item.type === 'annex_lp' ? (
            <Link to={config.annexAddLiquidityURL}
              className={`flex py-2.5 px-28 font-bold 
              rounded-3xl mt-5 w-full text-center 
              text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}
              ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bgPrimaryGradient text-black "}`}
            >Add Liquidity</Link>
          ) : (
            <a
              className={`flex py-2.5 px-28 font-bold 
              rounded-3xl mt-5 w-full text-center 
              text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}
              ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bgPrimaryGradient text-black "}`}
              href={
                `${config.pcsAddLiquidityURL}/${item.token0}/${item.token1}`
              }
              target="_new">Add Liquidity</a>
          )
        }
        {
          new BigNumber(item.userData ? item.userData.allowance : 0).isGreaterThan(0) ? (
            <div className="flex justify-between">
              <button
                className={`py-2.5 px-14 font-bold 
                rounded-3xl mt-5 w-full 
                text-2xl outline-none
                ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bgPrimaryGradient text-black "}`}
                onClick={async () => {
                  dipositWithdraw(true, item, 'stake')
                }}>Stake</button>
              {
                new BigNumber(item.userData ? item.userData.stakedBalance : 0).isGreaterThan(0) && (
                  <button
                    className={`py-2.5 px-10 font-bold 
                    rounded-3xl mt-5 w-full 
                    text-2xl outline-none ml-4
                    ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bgPrimaryGradient text-black "}`}
                    onClick={() => {
                      dipositWithdraw(true, item, 'unstake')
                    }}>UnStake</button>
                )
              }
            </div>
          ) : (
            <div className="mt-5 flex justify-center items-center text-2xl text-primary cursor-pointer" onClick={async () => {
              setPendingTx(true)
              await onApprove()
              setPendingTx(false)
            }}>
              {pendingTx && <Loader size="20px" className="mr-4" stroke="#ff9800" />}
              Approve Staking
            </div>
          )
        }
      </div>
    </Styles>
  )
}

export default Card;