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
  orders,
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
      // let allowListCallData = modalError.payload.allowListCallData;
      // let prevOrder = modalError.payload.prevOrder;
      sellAmount = new BigNumber(sellAmount).multipliedBy(biddingDecimal).toString(10);
      buyAmount = new BigNumber(buyAmount).multipliedBy(auctionDecimal).toString(10);
      let data = [
        auctionId,
        [buyAmount],
        [sellAmount],
        ['0x0000000000000000000000000000000000000000000000000000000000000001'],
        '0x',
      ];
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
          orders={orders}
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
  const [orderArr, setOrderArr] = useState([]);

  useEffect(() => {
    let isSuccessfullArr = [];
    props.detail.data
      .sort((a, b) => b.price - a.price)
      .map((item) => {
        isSuccessfullArr.push({ isSuccessfull: item.isSuccessfull });
      });

    const priceMapped = props.orders.map((item) => {
      return {
        ...item,
        priceValue: Number(item.price.split(' ')[0]),
        minFundingThresholdNotReached: props.detail.minFundingThresholdNotReached,
      };
    });

    const orderArray = priceMapped
      .sort((a, b) => a.price_eth - b.price_eth)
      .map((item, i) => {
        return {
          ...item,
          isSuccessfull: isSuccessfullArr[i].isSuccessfull,
        };
      });
    setOrderArr(orderArray);
  }, []);

  const [state, setState] = useState({
    minBuyAmount: '',
    sellAmount: '',
    // allowListCallData: '0x0000000000000000000000000000000000000000000000000000000000000001',
    // prevOrder: '0x',
  });

  const [value, setValue] = useState(props.minBuyAmount);
  const handleInputChange = (e) => {
    let value = e.target.value;
    let id = e.target.id;
    setState({
      ...state,
      [id]: value,
    });
    setValue(value);
  };

  const validateForm = () => {
    let inputs = [
      { id: 'minBuyAmount', placeholder: 'Min Buy Amount' },
      { id: 'sellAmount', placeholder: 'Sell Amount' },
      // { id: 'allowListCallData', placeholder: 'Allow List Call Data' },
      // { id: 'prevOrder', placeholder: 'Previous Order' },
    ];
    let isValid = true;
    let errorMessage = '';
    for (let index = 0; index < inputs.length; index++) {
      let key = inputs[index]['id'];
      let placeholder = inputs[index]['placeholder'];
      let value = Number(state[key]);
      let minBuyAmount = Number(props.minBuyAmount);
      let maxAvailable = Number(props.maxAvailable);
      let minBiddingPerOrder = Number(props.detail.minimumBiddingAmountPerOrder);
      let biddingSymbol = props.detail.biddingSymbol;
      let auctioningSymbol = props.detail.auctionSymbol;

      if (value === '' || value === 0) {
        errorMessage = `${placeholder} required`;
        isValid = false;
        break;
        // } else if (key === 'minBuyAmount' && (value < minBuyAmount || value > maxAvailable)) {
      } else if (key === 'minBuyAmount' && value > maxAvailable) {
        errorMessage = `${placeholder} must be less than Maximum Auctioning Amount - ${maxAvailable} ${auctioningSymbol}`;
        isValid = false;
        break;
      } else if (key === 'sellAmount' && value < minBuyAmount) {
        errorMessage = `${placeholder} must be larger than Minimum Bidding Amount Per Order - ${minBiddingPerOrder} ${biddingSymbol}`;
        isValid = false;
        break;
      }
    }
    if (isValid) {
      let bidPrice = state['sellAmount'] / state['minBuyAmount'];
      if (bidPrice < props.detail.currentPrice || bidPrice < props.detail.minimumPrice) {
        errorMessage = `Your bid price ${bidPrice} must be larger than current price or minimum bidding price`;
        isValid = false;
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
      props.handleSubmit(
        state.minBuyAmount,
        state.sellAmount,
        // state.allowListCallData,
        // state.prevOrder,
      );
    }
  };

  const onChangeSlider = (newValue) => {
    setValue(newValue);
    setState({
      ...state,
      ['sellAmount']: newValue,
    });
  };

  return (
    <>
      {props.detail && props.detail.chartType === 'block' ? (
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
            {orderArr && orderArr.length > 0 ? (
              <BarChart width="100%" height="211px" data={orderArr} />
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
                <div className="text-lg font-bold">{props.detail.biddingBalance}</div>
              </div>
            </div>
            <div className="custom-range">
              <Slider
                min={props.minBuyAmount}
                max={props.detail.biddingBalance}
                value={value}
                onChange={onChangeSlider}
              />
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
                      <b>Bidding Token :</b> {props.detail.biddingBalance}{' '}
                      {props.detail.biddingSymbol}
                    </div>
                    <div className="text-md ">
                      <b>Auction Token :</b> {props.detail.auctionBalance}{' '}
                      {props.detail.auctionSymbol}
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
              <span className="label">Sell Amount - {props.detail.biddingSymbol}</span>
              <input
                placeholder={props.detail ? props.detail.placeholderSellAmount : 0}
                id="sellAmount"
                onChange={handleInputChange}
                className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
                type="number"
                value={state.sellAmount}
              />
            </div>
            <div className="mb-3 w-full pl-2">
              <span className="label">Min Buy Amount - {props.detail.auctionSymbol}</span>
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
          {/* <div className="flex justify-between">
            <div className="mb-3 w-full">
              <span className="label">Allow List Call Data</span>
              <input
                // placeholder={props.detail ? props.detail.placeholderSellAmount : 0}
                id="allowListCallData"
                onChange={handleInputChange}
                className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
                // type="number"
                value={state.allowListCallData}
              />
            </div>
            <div className="mb-3 w-full pl-2">
              <span className="label">Previous Order</span>
              <input
                // placeholder={props.detail ? props.detail.placeHolderMinBuyAmount : 0}
                id="prevOrder"
                className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 text-white"
                // type="number"
                onChange={handleInputChange}
                value={state.prevOrder}
              />
            </div>
          </div> */}
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
