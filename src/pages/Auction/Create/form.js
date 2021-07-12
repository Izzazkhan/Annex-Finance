import { useState } from 'react';
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
} from '../../../utilities/ContractService';
import { CONTRACT_ANNEX_AUCTION } from '../../../utilities/constants';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';
import moment from 'moment';
import toHex from 'to-hex';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';

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

export default function Form(props) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [state, setState] = useState({
    inputs: [
      {
        type: 'text',
        placeholder: 'Auction token',
        id: 'auctionToken',
        description: 'The token that will auction.',
        value: '',
      },
      {
        type: 'select',
        id: 'biddingToken',
        placeholder: 'Bidding token ',
        description: 'The token that will use to bid the auction.',
        options: props.options,
        value: props.options[0] ? props.options[0] : [],
      },
      {
        type: 'date',
        id: 'endDate',
        placeholder: 'Auction end date',
        description: 'The date on which auction end.',
        value: new Date(),
      },
      {
        type: 'date',
        id: 'cancellationDate',
        placeholder: 'Order cancellation date',
        description: 'The date for order cancellation.',
        value: new Date(),
      },
      {
        type: 'text',
        id: 'sellAmount',
        placeholder: 'Auction sell amount',
        description: 'The amount to sell the auction token.',
        value: '',
      },
      {
        type: 'text',
        id: 'buyAmount',
        placeholder: 'Minimum buy amount',
        description: 'The minimium amount to buy the auction.',
        value: '',
      },
      {
        type: 'text',
        id: 'minBidAmount',
        placeholder: 'Minimum bidding amount per order',
        description: 'The minimium amount to bid on the auction.',
        value: '',
      },
      {
        type: 'text',
        id: 'minFundThreshold',
        placeholder: 'Minimum funding threshold',
        description: 'Minimum buy amount against all auctioned tokens and total auctioned tokens.',
        value: '',
      },
    ],
    advanceInputs: [
      {
        type: 'checkbox',
        id: 'isAccessAuto',
        placeholder: '',
        description: 'To settle the auction automatically.',
        value: false,
      },
      {
        type: 'text',
        id: 'accessContractAddr',
        placeholder: 'Access manager contract address',
        description: 'Access manager contract address.',
        value: '',
      },
      {
        type: 'textarea',
        id: 'accessData',
        placeholder: 'Access manager data',
        description: 'Access manager contract data.',
        value: '',
      },
    ],
  });

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
      if (type === 'text' || type === 'textarea') {
        value = e.target.value;
      } else if (type === 'select') {
        value = e;
      } else if (type === 'checkbox') {
        value = !input['value'];
      } else if (type === 'date') {
        value = e[0];
      }
      input['value'] = value;
    }
    console.log(inputs);
    setState({
      ...state,
      [key]: inputs,
    });
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      let isValid = validateForm();
      if (isValid) {
        //   props.hanldeShowModal(true);
        let type = 'batch';
        let formatedStateData = getFormState();
        const accountId = props.account;
        let auctionAddr = CONTRACT_ANNEX_AUCTION[type]['address'];
        const annTokenContract = getANNTokenContract();
        const auctionTokenContract = getTokenContractWithDynamicAbi(formatedStateData.auctionToken);
        const auctionTokenDecimal = await methods.call(auctionTokenContract.methods.decimals, []);
        const auctionContract = getAuctionContract(type);
        const balanceOf = await methods.call(annTokenContract.methods.balanceOf, [accountId]);
        const threshold = await methods.call(auctionContract.methods.threshold, []);
        if (balanceOf > threshold) {
          let annAllowance = await getTokenAllowance(
            annTokenContract.methods,
            auctionAddr,
            threshold,
          );
          let auctionTokenAllowance = await getTokenAllowance(
            auctionTokenContract.methods,
            auctionAddr,
            threshold,
          );
          formatedStateData.sellAmount = enocodeParamToUint(
            formatedStateData.sellAmount,
            auctionTokenDecimal,
          );
          let data = [
            formatedStateData.auctionToken,
            formatedStateData.biddingToken,
            formatedStateData.accessContractAddr,
            formatedStateData.cancellationDate,
            formatedStateData.endDate,
            formatedStateData.minBidAmount,
            formatedStateData.minFundThreshold,
            formatedStateData.sellAmount,
            formatedStateData.buyAmount,
            formatedStateData.isAccessAuto,
            formatedStateData.accessData,
            0,
          ];
          console.log('data', data);
          console.log(
            'balnce ' + balanceOf,
            'threshold ' + threshold,
            'annAllowance ' + annAllowance,
            'auctionTokenAllowance ' + auctionTokenAllowance,
          );
          await methods.send(auctionContract.methods.initiateAuction, [data], accountId);
          setLoading(false);
          history.push('/auction/live');
        } else {
          console.log('buy ann');
          Swal.fire({
            title: 'Error',
            text: 'Please buy ANN Token',
            icon: 'error',
            showCancelButton: false,
          });
          setLoading(false);
        }
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
  const getTokenAllowance = async (contractMethods, spenderAddr, threshold) => {
    const accountId = props.account;
    let allowance = await methods.call(contractMethods.allowance, [accountId, spenderAddr]);
    if (allowance < threshold) {
      let maxValue = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      await methods.send(contractMethods.approve, [spenderAddr, maxValue], accountId);
      allowance = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    }
    return allowance;
  };
  const getFormState = () => {
    let arr = state.inputs.concat(state.advanceInputs);
    let obj = {};
    let biddingDecimal = 0;
    let biddingIndex = state.inputs.findIndex((x) => x.id === 'biddingToken');
    if (biddingIndex !== -1) {
      biddingDecimal = state.inputs[biddingIndex]['value']['decimal'];
    }
    let emptyAddr = '0x0000000000000000000000000000000000000000';
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element.type === 'select') {
        obj[element.id] = element.value.addr;
      } else if (
        element.id === 'minBidAmount' ||
        element.id === 'minFundThreshold' ||
        element.id === 'buyAmount'
      ) {
        obj[element.id] = enocodeParamToUint(element.value, biddingDecimal);
      } else if (
        (element.id === 'accessData' || element.id === 'accessContractAddr') &&
        element.value === ''
      ) {
        obj[element.id] = emptyAddr;
      } else if (element.id === 'cancellationDate' || element.id === 'endDate') {
        obj[element.id] = moment(element.value).valueOf();
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
    value = toHex(value * Number('1e' + decimal), { addPrefix: true });
    value = web3.eth.abi.encodeParameter('uint256', value);
    return value;
  };
  return (
    <form className="needs-validation" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
        {state.inputs.map((input, index) => {
          return input.type === 'select' ? (
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
              id={index}
              {...input}
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
          );
        })}
      </div>
      <div className="text-right">
        <ArrowDown type="button" onClick={() => setShowDetails((s) => !s)} className={'flex ml-auto'}>
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
            handleSubmit(e);
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit Form'}
        </button>
      </div>
    </form>
  );
}

const Input = ({ index, type, placeholder, value, isAdvance, description, handleInputChange }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <input
        className="border border-solid border-gray bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e, type, index, isAdvance)}
        required
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
      {/* <div className="invalid-feedback">title is required.</div> */}
    </div>
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
    <div className="col-span-6 flex flex-col mt-8">
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

const Checkbox = ({ index, type, description, value, isAdvance, handleInputChange }) => {
  return (
    <div className="col-span-6 flex mt-8 items-center custom-check">
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
    <div className="col-span-6 flex flex-col mt-8">
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

const DateInput = ({ id, type, value, isAdvance, description, handleInputChange }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <Flatpickr
        className="border border-solid border-gray bg-transparent rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
        data-enable-time={true}
        value={value}
        onChange={(e) => handleInputChange(e, type, id, isAdvance)}
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};
