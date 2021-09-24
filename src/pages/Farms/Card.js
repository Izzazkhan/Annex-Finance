import React, { useState } from 'react';
import annCoin from '../../assets/images/coins/ann.png'
import annLogo from '../../assets/icons/logoSolid.svg'
import pancakeLogo from '../../assets/images/pancakeswap-logo.png'
import upArrow from '../../assets/icons/arrowUp.png'
import config from '../../constants/config';
import BigNumber from 'bignumber.js';
import commaNumber from 'comma-number';
import useApproveFarm from 'hooks/farms/useApproveFarm'
import useStakeFarms from 'hooks/farms/useStakeFarms'
import { useLP } from "hooks/useContracts"


const harvest = (obj) => { }
const unStake = (obj) => { }


function Card({ item, dipositWithdraw }) {
  const format = commaNumber.bindWith(',', '.');
  const [pendingTx, setPendingTx] = useState(false)
  const lpContract = useLP(item.lpAddress)
  const { onApprove } = useApproveFarm(lpContract)
  const { onStake } = useStakeFarms(item.pid)

  return (
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
                new BigNumber(item.rewardPerDay)
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
          <span className="mb-2 font-bold text-primary text-lg">APY</span>
          <span className="font-bold mt-3.5 flex items-center">
            <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
            {format(
              new BigNumber(item.apy)
                .dp(2)
                .toString(10)
            )}%
          </span>
        </div>
        <div className="flex flex-col w-2/6">
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
          <span className="font-bold text-primary text-lg">Stacked</span>
          <span className="mt-2 font-bold mt-3.5">{item.staked}</span>
        </div>
        <div className="flex self-end w-2/6">
          <span className="text-primary">0 ANN / 0 ETH</span>
        </div>
      </div>
      <div className="flex mt-5 justify-between">
        <div>
          <span className="font-bold text-primary text-lg">Earned</span>
        </div>
        <div className="flex w-6/12">
          <img src={annCoin} alt="" className="mr-9 h-8" />
          <div className="flex flex-col">
            <span className="font-bold">
              {new BigNumber(item.userData ? item.userData.earnings : 0)
                .div(1e18)
                .dp(2, 1)
                .toString(10)} ANN
            </span>
            {
              new BigNumber(item.userData ? item.userData.earnings : 0).isGreaterThan(0) ? (
                <button
                  className={`p-1.5 text-black font-bold 
                    bgPrimaryGradient rounded-md mt-2 
                    text-md outline-none`}
                  onClick={() => {
                    harvest(item)
                  }}>Harvest Now</button>
              ) : (
                <span className="mt-2 text-primary">No Rewards</span>
              )
            }
          </div>
        </div>
      </div>
      <a
        className={`flex py-2.5 px-28 text-black font-bold 
          bgPrimaryGradient rounded-3xl mt-5 w-full 
          text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}`}
        href={
          `${item.type === 'annex_lp'
            ? config.annexAddLiquidityURL
            : config.pcsAddLiquidityURL}/${item.token0}/${item.token1}`
        }
        target="_new">Add Liquidity</a>
      {
        new BigNumber(item.userData ? item.userData.allowance : 0).isGreaterThan(0) ? (
          <div className="flex justify-between">
            <button
              className={`py-2.5 px-14 text-black font-bold 
                bgPrimaryGradient rounded-3xl mt-5 w-full 
                text-2xl outline-none`}
              onClick={async () => {
                dipositWithdraw(true, item, 'stake')
              }}>Stake</button>
            {
              new BigNumber(item.userData ? item.userData.stakedBalance : 0).isGreaterThan(0) && (
                <button
                  className={`py-2.5 px-14 text-black font-bold 
                    bgPrimaryGradient rounded-3xl mt-5 w-full 
                    text-2xl outline-none}`}
                  onClick={() => {
                    unStake(item)
                    dipositWithdraw(true, item, 'unstake')
                  }}>UnStake</button>
              )
            }
          </div>
        ) : (
          <div className="mt-5 flex justify-center text-2xl text-primary cursor-pointer" onClick={async () => {
            setPendingTx(true)
            await onApprove()
            setPendingTx(false)
          }}>Approve Staking</div>
        )
      }
    </div>
  )
}

export default Card;