import { Fragment, useState, useEffect } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';
import ArrowIcon from '../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import Select from '../../components/UI/Select';
import {
    getANNTokenContract,
    getAuctionContract,
    getTokenContractWithDynamicAbi,
    methods,
} from '../../utilities/ContractService';
import { CONTRACT_ANNEX_AUCTION } from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
// import Modal from './modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';
import moment from 'moment';
import toHex from 'to-hex';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { AVAILABLE_NETWORKS } from '../../utilities/constants';
import { restService } from 'utilities';
import toast from '../../components/UI/Toast';

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
    const { chainId } = useActiveWeb3React();
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({ contractAddress: '', contractName: '' })
    const [eventArray, setEventArray] = useState([])
    const [checkboxArray, setCheckboxArray] = useState([]);

    const handleChange = (event) => {
        if (event.target.name === 'contractABI') {
            let parsedABI = JSON.parse(event.target.value).filter(item => item.type === 'event')
            if (parsedABI.length) {
                setEventArray(parsedABI)
            }
            else {
                setEventArray([])
            }
        }
        else {
            setState({
                ...state,
                [event.target.name]: event.target.value,
            });
        }
    }

    // console.log('stateeeee', state, eventArray, checkboxArray, chainId)
    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;
        let errorMessage = '';
        const obj = { ...state }
        Object.keys(obj).map(function (key, index) {
            const element = state[key];
            if (element === '') {
                isValid = false;
                errorMessage = `${key} required`;
                // break;
            }
        });
        if (!isValid) {
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                showCancelButton: false,
            });
        }
        else {
            try {
                const response = await restService({
                    third_party: true,
                    api: 'http://192.168.99.197:3070/api/v1/contract',
                    method: 'POST',
                    params: {
                        ...state,
                        providerType: chainId === 97 ? 'testnet' : 'mainnet',
                        providerUrl: AVAILABLE_NETWORKS[chainId].rpcUrls[0]
                    }
                })
                console.log('submitData', response)
                toast.success({
                    title: 'Data has been added Successfully'
                });

            } catch (error) {
                console.log(error);
                // if (response.status !== 200) {
                toast.error({
                    title: 'Failed'
                });
                return
                // }

            }
        }
    };

    const handleCheckboxChange = event => {
        let newArray = [...checkboxArray, event.target.id];
        if (checkboxArray.includes(event.target.id)) {
            newArray = newArray.filter(item => item !== event.target.id);
        }
        setCheckboxArray(newArray)
    };

    return (
        <Fragment>
            <form className="needs-validation" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
                    <Fragment>
                        <div
                            className="col-span-12 flex flex-col text-primary  text-3xl pb-2
                  font-normal my-5 form-section-title border-b border-solid border-lightGray mt-10"
                        >
                            {'Token Information'}
                        </div>
                        <div className={`col-span-12 md:col-span-12  flex flex-col mt-4 md:mt-8`}>
                            <input
                                className="border border-solid border-gray bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
                                type="text"
                                name='contractAddress'
                                placeholder='Contract Address'
                                value={state.contractAddress} onChange={handleChange}
                                required
                            />
                            <div className="text-gray text-sm font-normal mt-3">{'Contract Address'}</div>
                        </div>

                        <div
                            className="col-span-12 flex flex-col text-primary  text-3xl pb-2
                  font-normal my-5 form-section-title border-b border-solid border-lightGray mt-10"
                        >
                            {'Contract Name'}
                        </div>
                        <div className={`col-span-12 md:col-span-12  flex flex-col mt-4 md:mt-8`}>
                            <input
                                className="border border-solid border-gray bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
                                type="text"
                                name='contractName'
                                placeholder='Contract Name'
                                value={state.contractName} onChange={handleChange}
                                required
                            />
                            <div className="text-gray text-sm font-normal mt-3">{'Contract Name'}</div>
                        </div>

                        <div
                            className="col-span-12 flex flex-col text-primary  text-3xl pb-2
                  font-normal my-5 form-section-title border-b border-solid border-lightGray mt-10"
                        >
                            {'Contract ABI'}
                        </div>

                        <div className={`col-span-12 flex flex-col mt-8`}>
                            <textarea
                                className="border border-solid border-gray bg-transparent
               rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-20 text-white text-lg"
                                type="textarea"
                                name='contractABI'
                                placeholder='Paste Contract ABI Here'
                                row="8"
                                onChange={handleChange}
                            ></textarea>
                            <div className="text-gray text-sm font-normal mt-3">{'Contract ABI'}</div>
                        </div>

                    </Fragment>
                    {eventArray.length ? eventArray.map(item => {
                        return (
                            <Fragment key={item.name}>
                                <div className={`col-span-12 md:col-span-3 flex mt-4 md:mt-8 items-center custom-check`}>
                                    <label className="container text-base ml-2 font-normal">
                                        <input type="checkbox"
                                            id={item.name}
                                            onChange={handleCheckboxChange}
                                        />

                                        <span className="checkmark"></span>{item.name}
                                    </label>
                                </div>
                            </Fragment>

                        )
                    }) : undefined
                    }
                </div>
                <div className="text-right mt-10">
                    <button
                        className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
     h-14 bg-primary rounded-lg"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Submit Form'}
                    </button>
                </div>
            </form>
            {/* <Modal
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
                auctionType={props.activeTab}
            /> */}
        </Fragment>
    );
}
