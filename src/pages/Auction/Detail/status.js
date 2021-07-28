import React, { Fragment, useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import BarChart from '../../../components/common/BarChart';
import LineChart from '../../../components/common/LineChart';
import Slider from 'react-rangeslider';
import BigNumber from 'bignumber.js';
import { getTokenContract, methods } from '../../../utilities/ContractService';
import Modal from './modal';
import Swal from 'sweetalert2';

const AuctionStatus = ({
  auctionEndDate,
  auctionStartDate,
  detail,
  minBuyAmount,
  maxAvailable,
  biddingSymbol,
  account,
  auctionId,
  biddingDecimal,
  auctionDecimal,
  auctionStatus,
  auctionContract,
  auctionAddr,
  getData,
}) => {
  const [showModal, updateShowModal] = useState(false);
  const [modalType, updateModalType] = useState('inprogress');
  const [modalError, setModalError] = useState({
    message: '',
    type: '',
    payload: {},
  });
  const [loading, setLoading] = useState(false);
  const [approveBiddingToken, setApproveBiddingToken] = useState({
    status: false,
    isLoading: false,
    label: '',
  });
  const [auctionThreshold, setAuctionThreshold] = useState('');
  useEffect(async () => {
    if (showModal) {
      const threshold = await methods.call(auctionContract.methods.threshold, []);
      setAuctionThreshold(threshold);
    }
  }, [showModal]);
  const showCommitModal = async (minBuyAmount, sellAmount) => {
    updateShowModal(true);
    let biddingTokenContract = getTokenContract(biddingSymbol.toLowerCase());
    let biddingTokenBalance = await methods.call(biddingTokenContract.methods.balanceOf, [account]);
    if (Number(biddingTokenBalance) < Number(sellAmount)) {
      setModalError({
        type: 'error',
        message: 'Insufficient Bidding Token Balance',
        payload: { minBuyAmount, sellAmount },
      });
    } else {
      setModalError({
        type: '',
        message: '',
        payload: { minBuyAmount, sellAmount },
      });
    }
    await handleApproveBiddingToken();
  };
  const handleApproveBiddingToken = async () => {
    try {
      setApproveBiddingToken({ status: false, isLoading: true, label: 'Loading...' });
      let biddingTokenContract = getTokenContract(biddingSymbol.toLowerCase());
      await getTokenAllowance(biddingTokenContract.methods, auctionAddr, auctionThreshold);
      setApproveBiddingToken({ status: true, isLoading: false, label: 'Done' });
    } catch (error) {
      console.log(error);
      setApproveBiddingToken({ status: false, isLoading: false, label: 'Error' });
    }
  };
  const getTokenAllowance = async (contractMethods, spenderAddr, threshold) => {
    let allowance = await methods.call(contractMethods.allowance, [account, spenderAddr]);
    if (allowance < threshold) {
      let maxValue = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      await methods.send(contractMethods.approve, [spenderAddr, maxValue], account);
      allowance = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    }
    return allowance;
  };
  const commitAuction = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      let sellAmount = modalError.payload.sellAmount;
      let buyAmount = modalError.payload.minBuyAmount;
      sellAmount = new BigNumber(sellAmount).multipliedBy(biddingDecimal).toString();
      buyAmount = new BigNumber(buyAmount).multipliedBy(auctionDecimal).toString();
      let data = [
        auctionId,
        [buyAmount],
        [sellAmount],
        ['0x0000000000000000000000000000000000000000000000000000000000000001'],
        '0x',
      ];
      console.log('data', data);
      let auctionTxDetail = await methods.send(
        auctionContract.methods.placeSellOrders,
        data,
        account,
      );
      setLoading(false);
      updateShowModal(true);
      updateModalType('success');
      getData();
      setModalError({
        message: '',
        type: '',
        payload: {},
      });
    } catch (error) {
      console.log(error);
      setModalError({
        ...modalError,
        message: error.message,
      });
      setLoading(false);
    }
  };
  const settlAuction = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log('settleAuction');
      await methods.send(auctionContract.methods.settleAuction, [auctionId], account);
      getData();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const closeModal = () => {
    updateShowModal(false);
    updateModalType('inprogress');
  };
  return (
    <Fragment>
      <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
        <div className="flex flex-col items-start justify-start ">
          <div className="text-white text-2xl ">
            {auctionStatus === 'upcoming'
              ? 'Countdown'
              : auctionStatus === 'inprogress'
              ? 'Auction Progress'
              : auctionStatus === 'completed'
              ? 'Auction Completed'
              : ''}
          </div>
          <div className="text-base font-normal opacity-0 "> text</div>
        </div>
      </div>
      {auctionStatus === 'upcoming' ? (
        <AuctionCountDown auctionStartDate={auctionStartDate * 1000} />
      ) : auctionStatus === 'inprogress' ? (
        <AuctionProgress
          auctionEndDate={auctionEndDate}
          detail={detail}
          minBuyAmount={minBuyAmount}
          maxAvailable={maxAvailable}
          handleSubmit={showCommitModal}
        />
      ) : auctionStatus === 'completed' ? (
        <AuctionCompleted settlAuction={settlAuction} isAlreadySettle={detail['isAlreadySettle']} />
      ) : (
        ''
      )}
      {/* */}

      <Modal
        open={showModal}
        type={modalType}
        loading={loading}
        modalError={modalError}
        handleSubmit={commitAuction}
        approveBiddingToken={approveBiddingToken}
        handleApproveBiddingToken={handleApproveBiddingToken}
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => closeModal()}
      />
    </Fragment>
  );
};

const AuctionCountDown = ({ auctionStartDate }) => {
  return (
    <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
      <div className="w-full flex flex-col items-center justify-center ">
        <div className="text-white text-4xl mb-10">Countdown</div>
        <div className="counter bg-primary flex flex-row items-center py-10 rounded-2xl">
          <Countdown
            date={auctionStartDate}
            renderer={({ days, hours, minutes, seconds }) => (
              <Fragment>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{days}</div>
                  <div className="text-2xl font-normal">DAYs</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{hours}</div>
                  <div className="text-2xl font-normal">HOURS</div>
                </div>
                <div className="flex flex-col items-center px-6 border-r border-lightprimary">
                  <div className="text-3xl font-bold">{minutes}</div>
                  <div className="text-2xl font-normal">MIN</div>
                </div>
                <div className="flex flex-col items-center px-6">
                  <div className="text-3xl font-bold">{seconds}</div>
                  <div className="text-2xl font-normal">SEC</div>
                </div>
              </Fragment>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const AuctionCompleted = ({ settlAuction, isAlreadySettle }) => {
  return (
    <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
      <div className="w-full flex flex-col items-center justify-center ">
        <img className="ml-3" src={require('../../../assets/images/check.svg').default} alt="" />

        {!isAlreadySettle ? (
          <Fragment>
            <div className="text-white text-4xl mt-10 mb-3">Auction Finished Successfully</div>
            {/* <div className="text-white text-base mb-10">
              you are able to claim 1 Non-Fungible Bible
            </div> */}
            <button
              className="focus:outline-none py-2 px-12 text-black text-xl 2xl:text-24
         h-14 bg-white rounded-lg bgPrimaryGradient rounded-lg"
              onClick={settlAuction}
            >
              Settle Auction
            </button>
          </Fragment>
        ) : (
          <div className="text-white text-4xl mt-10 mb-3">Auction Settled Successfully</div>
        )}
      </div>
    </div>
  );
};
const AuctionProgress = (props) => {
  const [state, setState] = useState({
    minBuyAmount: '',
    sellAmount: '',
  });
  const handleInputChange = (e) => {
    let value = e.target.value;
    let id = e.target.id;
    setState({
      ...state,
      [id]: value,
    });
  };
  const validateForm = () => {
    let inputs = [
      { id: 'minBuyAmount', placeholder: 'Min Buy Amount' },
      { id: 'sellAmount', placeholder: 'Sell Amount' },
    ];
    let isValid = true;
    let errorMessage = '';
    for (let index = 0; index < inputs.length; index++) {
      let key = inputs[index]['id'];
      let placeholder = inputs[index]['placeholder'];
      let value = Number(state[key]);
      let minBuyAmount = Number(props.minBuyAmount);
      let maxAvailable = Number(props.maxAvailable);
      if (value === '' || value === 0) {
        errorMessage = `${placeholder} required`;
        isValid = false;
        break;
      } else if (key === 'minBuyAmount' && (value < minBuyAmount || value > maxAvailable)) {
        errorMessage = `${placeholder} must be greater than Minimum Token Amount`;
        isValid = false;
        break;
      } else if (key === 'sellAmount' && value > maxAvailable) {
        errorMessage = `${placeholder} must be smaller than Max Available`;
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        showCancelButton: false,
      });
    }
    return isValid;
  };
  const showCommitModal = () => {
    let isValid = validateForm();
    if (isValid) {
      props.handleSubmit(state.minBuyAmount, state.sellAmount);
    }
  };
  return (
    <>
      {props.detail.chartType === 'block' ? (
        <Fragment>
          <div className="chart flex items-end relative mt-5 pl-10 mr-2">
            <div className="graph-left-label flex flex-col items-center text-white text-sm justify-center font-normal">
              <span className="border first"></span>
              <span className="label my-2 font-normal">
                No. of orders{' '}
                <b>{props.detail && props.detail.data ? props.detail.data.length : 0}</b>
              </span>
              <span className=" border last"></span>
            </div>
            <span className="label info success text-sm font-normal">
              <span></span>Successfull
            </span>
            <span className="label info unsuccess text-sm font-normal">
              <span></span>UnSuccessfull
            </span>
            {/*  */}
            {props.detail && props.detail.data.length > 0 ? (
              <BarChart width="100%" height="211px" data={props.detail.data} />
            ) : (
              <div
                className="relative pt-5"
                style={{
                  width: '100%',
                  height: '211px',
                  marginBottom: '-29px',
                }}
              >
                <div>No Graph Data found</div>
              </div>
            )}
          </div>
          <div className="w-full graph-bottom-label flex items-center text-white text-sm mt-8 justify-center font-normal">
            <span className="border first "></span>
            <span className="label mx-2 font-normal">
              Bid per share, sorted from lowest to highest
            </span>
            <span className=" border last "></span>
          </div>
        </Fragment>
      ) : (
        <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
          <LineChart width="100%" height="211px" data={props.detail.data} />
          <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
            <div className="items-center ">
              <div className="flex items-center text-primary text-xs font-bold">Auction Start</div>
            </div>
            <div className="items-center ">
              <div className="flex items-center text-primary text-xs font-bold">Auction End</div>
            </div>
          </div>
        </div>
      )}
      <div className="text-white flex flex-col items-stretch justify-between items-center p-6 ">
        <div className="">
          <div className="mb-7">
            <div className="label flex flex-row justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-sm ">Minimum Token Amount</div>
                <div className="text-lg font-bold">{props.minBuyAmount}</div>
              </div>
              <div className="flex flex-col text-right">
                <div className="text-sm ">Max Available</div>
                <div className="text-lg font-bold">{props.maxAvailable}</div>
              </div>
            </div>
            <div className="custom-range">
              <Slider min={850} max={5000} value={2000} />
              {/* <input id="range" className="w-full" type="range" min="0" max="951.7" /> */}
            </div>
          </div>
          <div className="mb-7">
            <div className="label flex flex-row justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-md text-primary font-bold mb-2 ">Commitment</div>
                {props.detail && props.detail.biddingBalance && props.detail.auctionBalance && (
                  <div className="flex justify-between mb-3">
                    <div className="text-md mr-3">
                      <b>Bidding Token :</b> {props.detail && props.detail.biddingBalance}
                    </div>
                    <div className="text-md ">
                      <b>Auction Token :</b> {props.detail && props.detail.auctionBalance}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mb-3">
                  <div className="text-md ">
                    <b>To calculate the price:</b> Sell amount/ Min Buy amount.
                  </div>
                </div>
                {state.sellAmount && state.minBuyAmount ? (
                  <div className="text-md ">
                    {' '}
                    <b>Price: </b>
                    {state.sellAmount / state.minBuyAmount}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="mb-3 w-full">
              <span className="label">Sell Amount</span>
              <input
                placeholder={props.detail ? props.detail.placeholderSellAmount : 0}
                id="sellAmount"
                onChange={handleInputChange}
                className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
                type="number"
              />
            </div>
            <div className="mb-3 w-full pr-2">
              <span className="label">Min Buy Amount</span>
              <input
                placeholder={props.detail ? props.detail.placeHolderMinBuyAmount : 0}
                id="minBuyAmount"
                className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
                type="number"
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="input-with-button text-right">
            <button
              className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
         h-14 bg-primary rounded-lg"
              onClick={showCommitModal}
            >
              Commit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AuctionClaim = () => {
  return (
    <div className="flex-1 text-white flex flex-row items-stretch justify-between items-center  p-6">
      <div className="w-full flex flex-col items-center justify-center ">
        <div className="text-white text-4xl mb-10">Countdown</div>
        <div className="counter bg-primary flex flex-row items-center py-10 rounded-2xl">
          <div className="flex flex-col items-center px-6 border-r border-lightprimary">
            <div className="text-3xl font-bold">01</div>
            <div className="text-2xl font-normal">DAYs</div>
          </div>
          <div className="flex flex-col items-center px-6 border-r border-lightprimary">
            <div className="text-3xl font-bold">07</div>
            <div className="text-2xl font-normal">HOURS</div>
          </div>
          <div className="flex flex-col items-center px-6 border-r border-lightprimary">
            <div className="text-3xl font-bold">50</div>
            <div className="text-2xl font-normal">MIN</div>
          </div>
          <div className="flex flex-col items-center px-6">
            <div className="text-3xl font-bold">32</div>
            <div className="text-3xl font-normal">SEC</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionStatus;
