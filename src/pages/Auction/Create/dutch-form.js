import { Fragment, useState, useEffect } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';
import ArrowIcon from '../../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import Select from '../../../components/UI/Select';
import {
  getANNTokenContract,
  getAuctionContract,
  getTokenContractWithDynamicAbi,
  methods,
  dutchAuctionContract,
} from '../../../utilities/ContractService';
import { CONTRACT_ANNEX_AUCTION } from '../../../utilities/constants';
import Modal from './modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';
import moment from 'moment';
import toHex from 'to-hex';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { useActiveWeb3React } from '../../../hooks';

const ArrowContainer = styled.div`
  transform: ${({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: 0.3s ease all;
  will-change: transform;
`;

const ArrowDown = styled.button`
  align-items: center;
  justify-content: center;
  transition: 0.3s ease all;
  will-change: background-color, border, transform;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }

  &:hover {
    background-color: #101016;
  }
`;

export default function DutchForm({ biddingTokenOptions, account, chainId, activeTab }) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [auctionThreshold, setAuctionThreshold] = useState('');
  const [approveAuctionToken, setApproveAuctionToken] = useState({
    status: false,
    isLoading: false,
    label: '',
  });
  const [approveANNToken, setApproveANNToken] = useState({
    status: false,
    isLoading: false,
    label: '',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, updateShowModal] = useState(false);
  const [modalType, updateModalType] = useState('inprogress');
  const [modalError, setModalError] = useState({
    message: '',
    type: '',
    payload: {},
  });
  const [state, setState] = useState({
    inputs: [
      {
        type: 'text',
        placeholder: 'Auction token',
        id: 'auctionToken',
        description: 'The token that will auction.',
        value: '',
        colspan: 6,
        label: 'Token Information',
        isValid: true,
      },
      {
        type: 'select',
        id: 'biddingToken',
        placeholder: 'Bidding token ',
        description: 'The token that will use to bid the auction.',
        options: biddingTokenOptions,
        value: biddingTokenOptions[0] ? biddingTokenOptions[0] : [],
        colspan: 6,
        isValid: true,
      },

      {
        type: 'number',
        id: 'sellAmount',
        placeholder: 'Auction sell amount',
        description: 'The amount to sell the auction token.',
        value: '',
        colspan: 12,
        label: 'Details ',
        name: 'sellAmount',
        isValid: true,
      },
      {
        type: 'number',
        id: 'buyAmount',
        placeholder: 'Minimum buy amount',
        description: 'The minimium amount to buy the auction.',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'number',
        id: 'minBidAmount',
        placeholder: 'Minimum bidding amount per order',
        description: 'The minimium amount to bid on the auction.',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'number',
        id: 'decreasingAuctionPrice',
        placeholder: 'Decreasing Price',
        min: '0',
        description: 'Auction price Decreasing Times',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'date',
        id: 'startDate',
        placeholder: 'Auction start date',
        description: 'The date on which auction start.',
        value: new Date(),
        colspan: 6,
        label: 'Date',
        isValid: true,
      },
      {
        type: 'date',
        id: 'endDate',
        placeholder: 'Auction end date',
        description: 'The date on which auction end.',
        value: new Date(),
        colspan: 6,
        isValid: true,
      },
      {
        type: 'url',
        id: 'websiteLink',
        placeholder: 'Website URL',
        description: 'Website URL',
        value: '',
        colspan: 6,
        label: 'Others',
        isValid: true,
      },
      {
        type: 'url',
        id: 'telegramLink',
        placeholder: 'Telegram Link',
        description: 'Telegram Link',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'url',
        id: 'discordLink',
        placeholder: 'Discord Link',
        description: 'Discord Link',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'url',
        id: 'mediumLink',
        placeholder: 'Medium Link',
        description: 'Medium Link',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'url',
        id: 'twitterLink',
        placeholder: 'Twitter Link',
        description: 'Twitter Link',
        value: '',
        colspan: 6,
        isValid: true,
      },
      {
        type: 'textarea',
        id: 'description',
        placeholder: 'Auction Description',
        description: 'Auction Description',
        value: '',
        colspan: 12,
        isValid: true,
      },
    ],
    advanceInputs: [
      {
        type: 'checkbox',
        id: 'isAccessAuto',
        placeholder: '',
        description: 'Only for whitelisters.',
        value: false,
        colspan: 6,
      },
      {
        type: 'text',
        id: 'accessContractAddr',
        placeholder: `
         0x0000000000000000000000000000000000000000,
         0x0000000000000000000000000000000000000000,
         0x0000000000000000000000000000000000000000,
         ...
         ...
         ...`,
        name: 'accessContractAddr',
        description: 'Enter one address on each line. You can entry 300 addressess as maximum.',
        value: '',
        colspan: 12,
      },
    ],
    type: 'dutch',
  });
  const annTokenContract = getANNTokenContract(chainId);
  const auctionContract = getAuctionContract(state.type, chainId);
  const dutchAuction = dutchAuctionContract(chainId);

  useEffect(async () => {
    if (showModal) {
      const threshold = await methods.call(auctionContract.methods.threshold, []);
      setAuctionThreshold(threshold);
      setModalError({
        message: '',
        type: '',
      });
    }
  }, [showModal]);
  useEffect(async () => {
    if (showModal) {
      await handleApproveANNToken();
      await handleApproveAuctionToken();
    }
  }, [auctionThreshold]);
  const validateForm = () => {
    let arr = state.inputs.concat(state.advanceInputs);
    let isValid = true;
    let errorMessage = '';
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element.type === 'select' && element.value.length === 0) {
        isValid = false;
        errorMessage = `${element.placeholder} required`;
        break;
      } else if (element.id === 'auctionToken' && element.value !== '') {
        const web3 = new Web3(window.web3.currentProvider);
        if (!web3.utils.isAddress(element.value)) {
          isValid = false;
          errorMessage = `${element.placeholder} is not valid`;
          break;
        }
      } else if (
        (element.id === 'accessData' || element.id === 'accessContractAddr') &&
        element.value === ''
      ) {
        // obj[element.id] = emptyAddr;
      } else if (element.id === 'cancellationDate' || element.id === 'endDate') {
        // obj[element.id] = moment(element.value).valueOf();
      } else if (element.type === 'url' && element.value !== '') {
        if (!validURL(element.value)) {
          isValid = false;
          errorMessage = `Invalid ${element.placeholder}`;
          break;
        }
      } else if (element.value === '') {
        isValid = false;
        errorMessage = `${element.placeholder} required`;
        // document.getElementById(element.id).focus();
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
  const handleInputChange = (e, type, index, isAdvance) => {
    let key = isAdvance ? 'advanceInputs' : 'inputs';
    let inputs = isAdvance ? [...state.advanceInputs] : [...state.inputs];
    let input = inputs[index];
    if (input) {
      let value = '';
      if (index === 0) {
        if (Web3.utils.isAddress(e.target.value)) {
          input['description'] = 'The token that will auction.';
          input['isValid'] = true;
        } else {
          input['description'] = 'Please enter the correct token';
          input['isValid'] = false;
        }
      } else if (index === 2) {
        if (e.target.value >= 1) {
          input['isValid'] = true;
          input['description'] = 'The amount to sell the auction token.';
        } else {
          input['description'] = 'The amount to sell should be greater than or equal to 1';
          input['isValid'] = false;
        }
      }

      if (type === 'text' || type === 'textarea' || type === 'url' || type === 'number') {
        value = e.target.value;
      } else if (type === 'select') {
        value = e;
      } else if (type === 'checkbox') {
        value = !input['value'];
      } else if (type === 'date') {
        value = e[0];
      }

      if (index === 3) {
        let b = inputs.find((item) => item.id === 'minBidAmount');
        input['value'] = value;
        if (b.value !== '' && Number(e.target.value) < Number(b.value)) {
          input['description'] = 'Amount to buy should be greater than amount to bid';
          input['isValid'] = false;
        } else {
          input['isValid'] = true;
          input['description'] = 'The minimium amount to buy the auction.';
          b['isValid'] = true;
          b['description'] = 'The minimium amount to bid the auction.';
        }
      } else if (index === 4) {
        let a = inputs.find((item) => item.id === 'buyAmount');
        input['value'] = value;
        if (a.value !== '' && Number(e.target.value) > Number(a.value)) {
          input['description'] = 'Amount to bid should be less than amount to buy';
          input['isValid'] = false;
        } else {
          input['isValid'] = true;
          input['description'] = 'The minimium amount to bid the auction.';
          a['isValid'] = true;
          a['description'] = 'The minimium amount to buy the auction.';
        }
      } else if (index === 5) {
        input['value'] = value;
        if (value >= 1) {
          input['isValid'] = true;
          input['description'] = 'Auction price Decreasing Times';
        } else {
          input['description'] = 'Auction price decreasing should be greater than or equal to 1';
          input['isValid'] = false;
        }
      } else if (index !== 3 && index !== 4) {
        input['value'] = value;
      }
    }
    setState({
      ...state,
      [key]: inputs,
    });
  };
  const handleSubmit = async (e) => {
    const whiteLister = state.advanceInputs
      .find((item) => item.id === 'accessContractAddr')
      .value.split(/\r?\n/);
    const whiteListerMapped = whiteLister.map((item) => Web3.utils.isAddress(item));
    const checker = whiteListerMapped.every(Boolean);
    const isDataValid = state.inputs.map((item) => item.isValid && item.isValid);
    const isValid = isDataValid.every(Boolean);
    const advanceCheckBox = state.advanceInputs.find((item) => item.type === 'checkbox');

    try {
      if (!isValid) {
        Swal.fire({
          title: 'Error',
          text: 'Please Enter the valid data',
          icon: 'error',
          showCancelButton: false,
        });
      } else if (
        (state.advanceInputs.find((item) => item.id === 'isAccessAuto').value === true &&
          !checker) ||
        (state.advanceInputs.find((item) => item.id === 'isAccessAuto').value === true &&
          state.advanceInputs.find((item) => item.id === 'accessContractAddr').value === '')
      ) {
        Swal.fire({
          title: 'Error',
          text: 'Please add the correct addresses',
          icon: 'error',
          showCancelButton: false,
        });
      } else {
        e.preventDefault();
        setLoading(true);
        let formatedStateData = await getFormState();
        const accountId = account;
        const auctionTokenContract = getTokenContractWithDynamicAbi(formatedStateData.auctionToken);
        const auctionTokenDecimal = await methods.call(auctionTokenContract.methods.decimals, []);
        const balanceOf = await methods.call(annTokenContract.methods.balanceOf, [accountId]);
        if (balanceOf > auctionThreshold) {
          // formatedStateData.sellAmount = enocodeParamToUint(
          //   formatedStateData.sellAmount,
          //   auctionTokenDecimal,
          // );
          let data = [
            formatedStateData.auctionToken,
            formatedStateData.biddingToken,
            formatedStateData.sellAmount,
            formatedStateData.buyAmount,
            formatedStateData.minBidAmount,
            formatedStateData.decreasingAuctionPrice,
            formatedStateData.startDate,
            formatedStateData.endDate,
            false,
            advanceCheckBox.value,
            [
              formatedStateData.websiteLink,
              formatedStateData.description,
              formatedStateData.telegramLink,
              formatedStateData.discordLink,
              formatedStateData.mediumLink,
              formatedStateData.twitterLink,
            ],
          ];
          console.log('************ auction data ************: ', data);
          let whiteListerArr = whiteLister.includes('') ? [] : whiteLister;
          let auctionTxDetail = await methods.send(
            dutchAuction.methods.initiateAuction,
            [data, whiteListerArr],
            accountId,
          )
          let auctionId = auctionTxDetail['events']['NewAuction']['returnValues']['auctionId'];
          setLoading(false);
          updateShowModal(true);
          updateModalType('success');
          setModalError({
            message: '',
            type: '',
            payload: {
              auctionId,
            },
          });
          // history.push('/auction/live');
        } else {
          setModalError({
            type: 'error',
            message: 'Please buy ANN Token',
            payload: {},
          });
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setModalError({
        message: error.message,
        type: 'error',
        payload: {},
      });
      setLoading(false);
    }
  };
  const auctionCreationChecks = (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      let isValid = validateForm();
      if (isValid) {
        hanldeShowModal(true);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        showCancelButton: false,
      });
      setLoading(false);
    }
  };
  const handleApproveANNToken = async () => {
    try {
      setApproveANNToken({ status: false, isLoading: true, label: 'Loading...' });
      let auctionAddr = CONTRACT_ANNEX_AUCTION[chainId][state.type]['address'];
      let annAllowance = await getTokenAllowance(
        annTokenContract.methods,
        auctionAddr,
        auctionThreshold,
      );
      setApproveANNToken({ status: true, isLoading: false, label: 'Done' });
    } catch (error) {
      console.log(error);
      setApproveANNToken({ status: false, isLoading: false, label: 'Error' });
    }
  };
  const handleApproveAuctionToken = async () => {
    try {
      setApproveAuctionToken({ status: false, isLoading: true, label: 'Loading...' });
      let { auctionToken } = await getFormState();
      let auctionAddr = CONTRACT_ANNEX_AUCTION[chainId][state.type]['address'];
      const auctionTokenContract = getTokenContractWithDynamicAbi(auctionToken);
      let auctionTokenAllowance = await getTokenAllowance(
        auctionTokenContract.methods,
        auctionAddr,
        auctionThreshold,
      );
      setApproveAuctionToken({ status: true, isLoading: false, label: 'Done' });
    } catch (error) {
      console.log(error);
      setApproveAuctionToken({ status: false, isLoading: false, label: 'Error' });
    }
  };

  const getTokenAllowance = async (contractMethods, spenderAddr, threshold) => {
    const accountId = account;
    let allowance = await methods.call(contractMethods.allowance, [accountId, spenderAddr]);
    if (allowance < threshold) {
      let maxValue = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      await methods.send(contractMethods.approve, [spenderAddr, maxValue], accountId);
      allowance = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    }
    return allowance;
  };

  const getFormState = async () => {
    let arr = state.inputs.concat(state.advanceInputs);
    let obj = {};

    let auctionToken = '';
    let auctionIndex = state.inputs.findIndex((x) => x.id === 'auctionToken');
    if (auctionIndex !== -1) {
      auctionToken = state.inputs[auctionIndex]['value'];
    }
    const auctionTokenContract = getTokenContractWithDynamicAbi(auctionToken);
    let auctionDecimal = await methods.call(auctionTokenContract.methods.decimals, []);

    let biddingDecimal = 0;
    let biddingIndex = state.inputs.findIndex((x) => x.id === 'biddingToken');
    if (biddingIndex !== -1) {
      biddingDecimal = state.inputs[biddingIndex]['value']['decimal'];
    }
    let emptyAddr = '0x0000000000000000000000000000000000000000';
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element.type === 'select') {
        if (element.id === 'biddingToken') {
          obj[element.id] = element.value.addr;
        } else {
          obj[element.id] = element.value.value;
        }
      } else if (
        element.id === 'minBidAmount' ||
        element.id === 'minFundThreshold' ||
        element.id === 'buyAmount'
      ) {
        obj[element.id] = enocodeParamToUint(element.value, biddingDecimal);
      } else if (element.id === 'sellAmount') {
        obj[element.id] = enocodeParamToUint(element.value, auctionDecimal);
      } else if (
        (element.id === 'accessData' || element.id === 'accessContractAddr') &&
        element.value === ''
      ) {
        obj[element.id] = emptyAddr;
      } else if (['cancellationDate', 'endDate', 'startDate'].indexOf(element.id) !== -1) {
        let timeStamp = moment(element.value).valueOf();
        timeStamp = Math.floor(timeStamp / 1000);
        obj[element.id] = timeStamp;
      } else {
        obj[element.id] = element.value;
      }
    }
    return obj;
  };
  const enocodeParamToUint = (value, decimal) => {
    const web3 = new Web3(window.web3.currentProvider);
    // value = new BigNumber(value).div(decimal).toString();
    // // value = value.replace('-', '');
    // // value = Number(value);
    // console.log(value);
    // value = web3.eth.abi.encodeParameter('uint256', value);
    // '0x' +
    //   new BigNumber(userId).toString(16).padStart(16, '0') +
    value =
      '0x' +
      new BigNumber(value).times(new BigNumber(10).pow(decimal)).toString(16).padStart(64, '0');
    // let hexValue = toHex(new BigNumber(value).times(new BigNumber(10).pow(decimal)), { addPrefix: true });
    // value = web3.eth.abi.encodeParameter('uint256', hexValue);
    return value;
  };
  const hanldeShowModal = (val) => {
    updateModalType('inprogress');
    updateShowModal(val);
    setLoading(false);
  };
  const validURL = (str) => {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  };
  return (
    <Fragment>
      <form className="needs-validation" onSubmit={auctionCreationChecks} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
          {/* section */}

          {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 col-span-12 form-section"> */}
          {state.inputs.map((input, index) => {
            return (
              <Fragment key={index}>
                {input.label ? (
                  <div
                    className="col-span-12 flex flex-col text-primary  text-3xl pb-2
                  font-normal my-5 form-section-title border-b border-solid border-lightGray mt-10"
                  >
                    {input.label}
                  </div>
                ) : (
                  ''
                )}
                {input.type === 'select' ? (
                  <SelectInput
                    {...input}
                    index={index}
                    key={index}
                    isAdvance={false}
                    handleInputChange={handleInputChange}
                  />
                ) : input.type === 'date' ? (
                  <DateInput
                    key={index}
                    index={index}
                    {...input}
                    isAdvance={false}
                    handleInputChange={handleInputChange}
                  />
                ) : input.type === 'textarea' ? (
                  <Textarea
                    {...input}
                    key={index}
                    index={index}
                    isAdvance={false}
                    handleInputChange={handleInputChange}
                  />
                ) : (
                  <Input
                    key={index}
                    index={index}
                    {...input}
                    isAdvance={false}
                    handleInputChange={handleInputChange}
                  />
                )}
                {input.colspan === 12 ? (
                  <div className={`col-span-6 flex flex-col mt-8`}></div>
                ) : (
                  ''
                )}
                {/* {index !== 0 && input.label ? (
                  <Fragment>
                    <div className=" col-span-12 flex flex-col my-5"></div>
                    <div className="col-span-12 flex flex-col text-white text-2xl font-normal">
                      {input.label}
                    </div>
                  </Fragment>
                ) : (
                  ''
                )} */}
              </Fragment>
            );
          })}

          {/* </div> */}
          {/* section end */}
        </div>
        <div className="text-right">
          <ArrowDown
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className={'flex ml-auto'}
          >
            <div className="reverse-rotate text-primary text-base mr-2">Advance</div>{' '}
            <ArrowContainer className="flex" active={showDetails}>
              <SVG src={ArrowIcon} />
            </ArrowContainer>
          </ArrowDown>
        </div>
        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-5">
            {state.advanceInputs.map((input, index) => {
              return (
                <div className="grid grid-cols-1 md:grid-cols-12 col-span-12" key={index}>
                  {input.type === 'checkbox' ? (
                    <Checkbox
                      {...input}
                      index={index}
                      isAdvance={true}
                      handleInputChange={handleInputChange}
                    />
                  ) : input.type === 'textarea' ? (
                    <Textarea
                      {...input}
                      index={index}
                      isAdvance={true}
                      handleInputChange={handleInputChange}
                    />
                  ) : (
                    <Input
                      {...input}
                      index={index}
                      isAdvance={true}
                      handleInputChange={handleInputChange}
                      state={state}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="text-right mt-10">
          <button
            className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
     h-14 bg-primary rounded-lg"
            type="submit"
            onClick={(e) => {
              auctionCreationChecks(e);
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Submit Form'}
          </button>
        </div>
      </form>
      <Modal
        open={showModal}
        type={modalType}
        isCreatingAuction={loading}
        approveANNToken={approveANNToken}
        approveAuctionToken={approveAuctionToken}
        modalError={modalError}
        handleApproveANNToken={handleApproveANNToken}
        handleApproveAuctionToken={handleApproveAuctionToken}
        handleSubmit={(e) => handleSubmit(e)}
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => updateShowModal(false)}
        auctionType={activeTab}
      />
    </Fragment>
  );
}

const Input = ({
  index,
  type,
  placeholder,
  value,
  isAdvance,
  description,
  isValid,
  handleInputChange,
  state,
}) => {
  return (
    <>
      {state ? (
        state.advanceInputs.map(
          (item) =>
            item.value === true && (
              <>
                <div className={`col-span-12 flex flex-col mt-8`}>
                  <textarea
                    className="border border-solid border-gray bg-transparent
               rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-60 text-white text-lg"
                    type="text"
                    placeholder={placeholder}
                    rows="12"
                    onChange={(e) => handleInputChange(e, type, index, isAdvance)}
                    value={value}
                  ></textarea>
                  <div className="text-gray text-sm font-normal mt-3">{description}</div>
                </div>
              </>
            ),
        )
      ) : (
        <div className={`col-span-12 md:col-span-6  flex flex-col mt-4 md:mt-8`}>
          <input
            className={`border border-solid ${isValid ? 'border-gray' : 'border-red'} bg-transparent
         rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleInputChange(e, type, index, isAdvance)}
            required
          />
          <div className={`${isValid ? 'text-gray' : 'text-red'} text-sm font-normal mt-3`}>
            {description}
          </div>
        </div>
      )}

      {/* <div className="invalid-feedback">title is required.</div> */}
    </>
  );
};

const Textarea = ({
  index,
  type,
  placeholder,
  value,
  isAdvance,
  description,
  handleInputChange,
}) => {
  return (
    <div className={`col-span-12 flex flex-col mt-8`}>
      <textarea
        className="border border-solid border-gray bg-transparent
               rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-20 text-white text-lg"
        type="text"
        placeholder={placeholder}
        row="5"
        onChange={(e) => handleInputChange(e, type, index, isAdvance)}
        value={value}
      ></textarea>
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};

const Checkbox = ({ index, type, description, value, isAdvance, handleInputChange, colspan }) => {
  return (
    <div className={`col-span-12 md:col-span-6 flex mt-4 md:mt-8 items-center custom-check`}>
      <label className="container text-base ml-2 font-normal">
        {description}
        <input
          type={type}
          checked={value}
          onChange={(e) => handleInputChange(e, type, index, isAdvance)}
        />
        <span className="checkmark"></span>
      </label>
    </div>
  );
};

const SelectInput = ({
  index,
  options,
  value,
  type,
  isAdvance,
  handleInputChange,
  description,
}) => {
  return (
    <div className={`col-span-12 md:col-span-6 flex flex-col mt-4 md:mt-8`}>
      <Select
        options={options}
        onChange={(val) => handleInputChange(val, type, index, isAdvance)}
        width="w-66"
        value={value}
        type="basic-xl"
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};

const DateInput = ({ index, type, value, isAdvance, description, handleInputChange }) => {
  return (
    <div className={`col-span-12 md:col-span-6 flex flex-col mt-4 md:mt-8`}>
      <Flatpickr
        className="border border-solid border-gray
                 bg-transparent rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
        data-enable-time={true}
        value={value}
        onChange={(e) => handleInputChange(e, type, index, isAdvance)}
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};
