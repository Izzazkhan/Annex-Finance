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
import { getEpochContract, methods } from '../../utilities/ContractService';

const Styles = styled.div`
  .landing {
    .custom-range {
      @media (max-width: 767px) {
        width: 90%;
        margin: 0 auto;
      }

      .rangeslider__fill {
        background: linear-gradient(90deg, #ffcb5b 16.38%, #f19920 67.43%);
      }
      .rangeslider-horizontal {
        height: 30px;
        border-radius: 15px;
        @media (max-width: 767px) {
          height: 20px;
          border-radius: 10x;
        }
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
        @media (max-width: 767px) {
          width: 40px;
          height: 40px;
        }
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
          @media (max-width: 767px) {
            width: 40px;
            height: 30px;
            bottom: -27px;
          }
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
      @media (max-width: 767px) {
        margin: 70px auto 0;
        width: 100%;
      }
      .items-list {
        padding: 6px;
        @media (max-width: 767px) {
          padding: 3px;
        }
        .item-bar {
          width: 3%;
          height: 40px;
          background: linear-gradient(90deg, #fefefe 57.11%, rgba(181, 177, 173, 0) 220.65%);
          border-radius: 5px;
          border: 3px solid;
          @media (max-width: 767px) {
            height: 25px;
            margin-right: 2px;
            border: 1px solid;
          }
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
        @media (max-width: 767px) {
          top: -23px;
        }
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
        @media (max-width: 767px) {
          width: 40%;
        }
      }
    }
    .holding-apr {
      left: 20%;
      @media (max-width: 1024px) {
        left: 14%;
        top: -30px;
      }
      @media (max-width: 767px) {
        left: 0%;
        top: 35px;
      }
      .left-bottom {
        display: flex;
        justify-content: center;
        padding-top: 4px;
        font-weight: bold;
        word-break: break-all;
        @media (max-width: 767px) {
          padding: 0;
          height: auto;
          margin: 0;
        }
        span {
          @media (max-width: 767px) {
            br {
              display: none;
            }
          }
        }
      }
      .top-right {
        display: flex;
        justify-content: center;
        padding-top: 4px;
        font-weight: bold;
        align-items: end;
        @media (max-width: 767px) {
          padding: 0;
          height: auto;
          margin: 0;
        }
        span {
          line-height: 14px;
          @media (max-width: 767px) {
            br {
              display: none;
            }
          }
        }
      }
    }
    .custom-top {
      position: relative;
      top: 50px;
      @media (max-width: 1280px) {
        top: 35px;
      }
      @media (max-width: 767px) {
        top: 80px;
      }
      .image {
        img {
          width: 30px;
          margin-left: 5px;
        }
      }
    }
    .title-text {
      left: 0;
      right: 0;
      margin: 0 auto;
      max-width: 200px;
      @media (max-width: 1024px) {
        &.open {
          top: 25px;
        }
      }
      @media (max-width: 767px) {
        top: 40px;
        &.open {
          top: 0;
        }
      }
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
  const [holdingAPR, setHoldingAPR] = useState('');
  const [checkCurrentEligibleEpoch, setCheckCurrentEligibleEpoch] = useState(false);

  // console.log('settings', settings)

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
        setAnnBalance((annBalance / Math.pow(10, decimals)).toFixed(2));
      }
      let currentEpochROI = await methods.call(epochContract.methods.getCurrentEpochROI, []);
      setCurrentEpochROI(currentEpochROI / 100);
      let holdingReward = await methods.call(epochContract.methods.getHoldingReward, [
        accountAddress,
      ]);

      if (holdingReward) {
        setHoldingReward((holdingReward / Math.pow(10, decimals)).toFixed(2));
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
      if (annBalance / Math.pow(10, decimals) === 0) {
        setHoldingAPR(0);
      } else if (
        Number(getEpoch) - Number(transferPoint[0]) > Number(eligibleEpochs) ||
        Number(getEpoch) - Number(transferPoint[0]) === Number(eligibleEpochs)
      ) {
        setHoldingAPR(
          ((currentEpochROI / 100) * (Number(getEpoch) - Number(transferPoint[0]))).toFixed(2),
        );
      } else {
        setHoldingAPR(0);
      }

      if (annBalance / Math.pow(10, decimals) === 0) {
        setCurrentEpoch(0);
      } else {
        setCurrentEpoch(Number(getEpoch) - Number(transferPoint[0]));
      }
      setSetting({
        annBalance: annBalance / Math.pow(10, decimals),
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleSubmitClaim = () => {
    const epochContract = getEpochContract();
    methods
      .send(epochContract.methods.claimReward, [], account)
      .then((data) => {
        console.log('data', data);
      })
      .catch((error) => {
        console.log('error', error);
      });
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
      <div className=" landing bg-lightGray rounded-md p-5 pb-12 md:p-8 md:pb-8 text-primary ">
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
            <>
              {/* <div className="hidden md:flex flex-col md:flex-row items-center holding-apr absolute">
                <div className="flex items-center">
                  <div className="font-bold text-md text-center">
                    Holdding <br />
                    APR
                  </div>
                  <div className="left-bottom text-white text-xs text-center">
                    <span style={{ paddingtop: '5px', textAlign: 'right', width: '90%' }}>
                      {parseFloat(holdingAPR).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="top-right text-white text-xs text-center">
                    <span
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      +<br />
                      {currentEpochROI.toFixed(0)}%
                    </span>
                  </div>
                  <div className="font-bold text-sm text-right">per epoch</div>
                </div>
              </div> */}
              <div className=" flex flex-col  items-start holding-apr absolute">
                <div className="flex items-center">
                  <div className="font-bold text-md text-center mr-2">Holdding APR</div>
                  <div className="left-bottom text-white text-md text-center">
                    <span
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {holdingAPR}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-bold text-sm text-right mr-2">per epoch</div>
                  <div className="top-right text-white text-md text-center">
                    <span
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      +
                      {currentEpochROI}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div
            className={` ${
              showDetails && 'open'
            } text-center font-bold text-2xl md:text-3xl text-border absolute title-text`}
          >
            {currentEpoch} epoch <span className=""></span>
          </div>
          <div
            className={` ${
              showDetails && 'custom-top mr-0'
            } flex items-center font-bold md:mr-3 flex-col lg:flex-row`}
          >
            <div className="text-md md:text-lg">ANN Holding Rewards : </div>
            <div className="text-sm md:text-md ml-1"> {holdingReward} ANN</div>
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
            <div className="custom-progressbar flex font-bold items-center flex-col md:flex-row">
              <div className="flex w-full relative py-5 md:py-8">
                <div
                  className="active-label flex font-bold items-center justify-center text-black"
                  style={{
                    left: `calc(${
                      Number(currentEpoch) > Number(eligibleEpochs) ? 30 : currentEpoch
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
              <button
                className="ml-2 focus:outline-none bg-primary py-2 md:px-6 px-6 rounded-2xl text-md  max-w-full  text-black"
                onClick={handleSubmitClaim}
              >
                Claim
              </button>
            </div>
            <div className="custom-range">
              <div className="label flex justify-between font-bold text-primary text-xl">
                <div className="">0%</div>
                <div className="">100%</div>
              </div>

              <Slider
                // labels={checkCurrentEligibleEpoch ? holdingAPR.toString() : '0'}
                handleLabel={checkCurrentEligibleEpoch ? holdingAPR.toString() : '0'}
                min={0}
                max={100}
                value={checkCurrentEligibleEpoch ? parseFloat(holdingAPR).toFixed(2) : 0}
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
