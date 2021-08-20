import React, { useEffect, useState } from 'react';
import coinsBar from '../../assets/images/coins.png';
import Web3 from 'web3';
import toHex from 'to-hex';
import ArrowIcon from '../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import Slider from 'react-rangeslider';
import styled from 'styled-components';
import SliderIcon from '../../assets/images/slider-icon.png';
import SliderBg from '../../assets/images/slider-bg.png';
import ActiveBg from '../../assets/images/active-bg.png';
import AprBg from '../../assets/images/apr-bg.png';
import { useActiveWeb3React } from '../../hooks';
import { bindActionCreators } from 'redux';
import { accountActionCreators, connectAccount } from '../../core';
import BigNumber from 'bignumber.js';
import { getEpochContract, methods } from '../../utilities/ContractService';
import { set } from 'lodash';

const Styles = styled.div`
  .landing {
    .custom-range {
      .rangeslider__fill {
        background: linear-gradient(90deg, #ffcb5b 16.38%, #f19920 67.43%);
      }
      .rangeslider-horizontal {
        height: 30px;
        border-radius: 15px;
      }
      .rangeslider__handle {
        background: url(${SliderIcon});
        background-size: 100%;
        background-position: center;
        border: none;
        width: 50px;
        height: 50px;
        box-shadow: none;
        background-repeat: no-repeat;
        &:after {
          display: none;
        }
        .rangeslider__handle-tooltip {
          background: url(${SliderBg});
          background-size: 100%;
          background-position: center;
          background-repeat: no-repeat;
          top: unset;
          bottom: -35px;
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            margin-top: 4px;
            font-weight: bold;
          }
          &:after {
            display: none;
          }
        }
        .rangeslider__handle-label {
          background: url(${SliderBg});
          background-size: 100%;
          background-position: center;
          background-repeat: no-repeat;
          top: unset;
          bottom: -35px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          width: 50px;
          height: 40px;
          color: #fff;
          padding-top: 5px;
          font-weight: bold;
          font-size: 10px;
          word-break: break-all;
        }
      }
      .label {
        margin-bottom: -12px;
      }
    }
    .custom-progressbar {
      max-width: 850px;
      width: 80%;
      margin: 0 auto;
      .items-list {
        padding: 6px;
        .item-bar {
          width: 3%;
          height: 40px;
          background: linear-gradient(90deg, #fefefe 57.11%, rgba(181, 177, 173, 0) 220.65%);
          border-radius: 5px;
          border: 3px solid;
          &.active {
            background: linear-gradient(90deg, #f19920 57.11%, rgba(181, 177, 173, 0) 220.65%);
            border-color: #ffff;
          }
        }
      }
      .active-label {
        background: url(${ActiveBg});
        position: absolute;
        width: 32px;
        height: 37px;
        top: -10px;
        background-size: 100%;
        background-repeat: no-repeat;
        line-height: 12px;
        text-align: center;
        word-break: break-all;
        font-size: 10px;
      }
    }
    .text-border {
      span {
        height: 2px;
        width: 80%;
        color: #fff;
        position: absolute;
        bottom: -10px;
        left: 0;
        right: 0;
        margin: auto;
        border-bottom: 2.25px dotted #f1992080;
        border-style: dashed;
      }
    }
    .holding-apr {
      left: 20%;
      .left-bottom {
        background: url(${AprBg});
        background-size: 100%;
        background-repeat: no-repeat;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        padding-top: 4px;
        font-weight: bold;
        margin-top: 45px;
        margin-left: -15px;
        word-break: break-all;
      }
      .top-right {
        background: url(${AprBg});
        background-size: 100%;
        background-repeat: no-repeat;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        padding-top: 4px;
        font-weight: bold;
        transform: rotate(180deg);
        margin-top: -35px;
        align-items: end;
        span {
          transform: rotate(-180deg);
        }
      }
    }
    .custom-top {
      position: relative;
      top: 50px;
    }
    .title-text {
      left: 0;
      right: 0;
      margin: 0 auto;
      max-width: 200px;
    }
  }
`;

const ArrowDown = styled.button`
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #000000;
  border: 1px solid #2b2b2b;
  transition: 0.3s ease all;
  will-change: background-color, border, transform;
  width: 30px;
  height: 30px;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }

  &:hover {
    background-color: #101016;
  }
`;

const ArrowContainer = styled.div`
  transform: ${({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: 0.3s ease all;
  will-change: transform;
`;

const Epoch = ({ settings, setSetting }) => {
  const { account } = useActiveWeb3React();

  const [showDetails, setShowDetails] = useState(false);
  const [annBalance, setAnnBalance] = useState('');
  const [currentEpochROI, setCurrentEpochROI] = useState('');
  const [holdingReward, setHoldingReward] = useState('');
  const [eligibleEpochs, seteligibleEpochs] = useState('');
  const [currentEpoch, setCurrentEpoch] = useState('');
  const [holdingAPI, setHoldingAPI] = useState('');
  const [checkCurrentEligibleEpoch, setCheckCurrentEligibleEpoch] = useState(false);

  console.log('settings', settings)

  useEffect(() => {
    balanceOf();
  }, []);

  const balanceOf = async () => {
    const accountAddress = account;
    if (!accountAddress) {
      return;
    }
    try {
      const epochContract = getEpochContract();
      let annBalance = await methods.call(epochContract.methods.balanceOf, [accountAddress]);
      let decimals = await methods.call(epochContract.methods.decimals, []);
      if (annBalance) {
        setAnnBalance(annBalance / Math.pow(10, decimals));
      }
      let currentEpochROI = await methods.call(epochContract.methods.getCurrentEpochROI, []);
      setCurrentEpochROI(currentEpochROI / 100);
      let holdingReward = await methods.call(epochContract.methods.getHoldingReward, [
        accountAddress,
      ]);

      if (holdingReward) {
        setHoldingReward(holdingReward / Math.pow(10, decimals));
      }

      let eligibleEpochs = await methods.call(epochContract.methods.eligibleEpochs, []);
      if (eligibleEpochs) {
        seteligibleEpochs(eligibleEpochs);
        // seteligibleEpochs(50);
      }
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:3000');
      const blockNumber = await web3.eth.getBlockNumber();
      let getEpoch = await methods.call(epochContract.methods.getEpochs, [blockNumber]);
      let transferPoint = await methods.call(epochContract.methods.transferPoints, [
        accountAddress,
        0,
      ]);
      if (
        Number(getEpoch) - Number(transferPoint[0]) > Number(eligibleEpochs) ||
        Number(getEpoch) - Number(transferPoint[0]) === Number(eligibleEpochs)
      ) {
        setHoldingAPI((currentEpochROI / 100) * (Number(getEpoch) - Number(transferPoint[0])));
      } else {
        setHoldingAPI(0);
      }
      setCurrentEpoch(Number(getEpoch) - Number(transferPoint[0]));
      setSetting({
        annBalance: annBalance / Math.pow(10, decimals)
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (
      Number(currentEpoch) > Number(eligibleEpochs) ||
      Number(currentEpoch) === Number(eligibleEpochs)
    ) {
      setCheckCurrentEligibleEpoch(true);
    } else {
      setCheckCurrentEligibleEpoch(false);
    }
  }, [currentEpoch, eligibleEpochs]);

  return (
    <Styles>
      <div className=" landing bg-lightGray rounded-md p-8 text-primary pb-8">
        <div className="flex items-center justify-between pr-10 relative">
          <div className={` ${showDetails && 'custom-top'} flex items-center`}>
            <div className="font-bold text-md text-right">
              ANN Balance <br />
              {annBalance} ANN
            </div>
            <div className="image">
              <img src={coinsBar} alt="" />
            </div>
          </div>
          {showDetails && (
            <div className="flex items-center holding-apr absolute">
              <div className="font-bold text-md text-center">
                Holdding <br />
                APR
              </div>
              <div className="left-bottom text-white text-xs text-center">
                <span style={{ 'whiteSpace': 'nowrap', 'overflow': 'hidden', 'textOverflow': 'ellipsis', 'width': '75%' }}>{holdingAPI}%</span></div>
              <div className="top-right text-white text-xs text-center">
                <span style={{ 'whiteSpace': 'nowrap', 'overflow': 'hidden', 'textOverflow': 'ellipsis', 'width': '75%' }}>
                  +<br />
                  {currentEpochROI}%
                </span>
              </div>
              <div className="font-bold text-sm text-right">per epoch</div>
            </div>
          )}
          <div className="text-center font-bold text-3xl text-border absolute title-text">
            {currentEpoch} epoch <span className=""></span>
          </div>
          <div className={` ${showDetails && 'custom-top'} flex items-center font-bold`}>
            <div className="text-lg">ANN Holding Rewards : </div>
            <div className="text-md ml-1"> {holdingReward} ANN</div>
          </div>
          <div className="absolute right-0">
            <ArrowDown onClick={() => setShowDetails((s) => !s)} className={'order-4 flex'}>
              <ArrowContainer active={showDetails}>
                <SVG src={ArrowIcon} />
              </ArrowContainer>
            </ArrowDown>
          </div>
        </div>
        {showDetails && (
          <div className="pt-12">
            <div className="custom-progressbar flex font-bold items-center">
              <div className="flex w-full relative py-8">
                <div
                  className="active-label flex font-bold items-center justify-center text-black"
                  style={{
                    left: `calc(${Number(currentEpoch) > Number(eligibleEpochs) ? 30 : currentEpoch
                      } * 3%)`,
                  }}
                >
                  {currentEpoch}
                </div>
                <div className="text-white text-xl p-2">0</div>
                <div className="border-4 border-white rounded-xl flex items-list justify-between flex-1">
                  {Number(currentEpoch) > Number(eligibleEpochs) ? (
                    [...Array(Number(eligibleEpochs))].map((e, i) => {
                      return <div key={i} className="item-bar active"></div>;
                    })
                  ) : (
                    <>
                      {[...Array(Number(eligibleEpochs))].slice(1, currentEpoch + 1).map((e, i) => {
                        return <div key={i} className="item-bar active"></div>;
                      })}
                      {[...Array(Number(eligibleEpochs))]
                        .slice(currentEpoch, [...Array(Number(eligibleEpochs))].length + 1)
                        .map((e, i) => {
                          return <div key={i} className="item-bar"></div>;
                        })}
                    </>
                  )}
                </div>
                <div className="text-white text-xl p-2">{eligibleEpochs}</div>
              </div>
              <button className="ml-2 focus:outline-none bg-primary py-2 md:px-6 px-6 rounded-2xl text-md  max-w-full  text-black">Claim</button>

            </div>
            <div className="custom-range">
              <div className="label flex justify-between font-bold text-primary text-xl">
                <div className="">0%</div>
                <div className="">100%</div>
              </div>

              <Slider
                // labels={checkCurrentEligibleEpoch ? holdingAPI.toString() : '0'}
                handleLabel={checkCurrentEligibleEpoch ? holdingAPI.toString() : '0'}
                min={0}
                max={100}
                value={checkCurrentEligibleEpoch ? holdingAPI : 0}
                tooltip={true}
              />
            </div>
          </div>
        )}
      </div>
    </Styles>
  );
};

Epoch.defaultProps = {
  settings: {},
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
    },
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Epoch);
