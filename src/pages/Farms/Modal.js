import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import Select from '../../components/UI/Select';

import arrowBack from '../../assets/icons/arrow_back.svg'
import annCoinImg from '../../assets/images/coins/ann.png'
import bnbCoinImg from '../../assets/images/coins/bnb.png'
import arrowDown from '../../assets/icons/keyboard_arrow_down.svg'
import { ReactComponent as HelpIcon } from "../../assets/icons/helpOutline.svg";
import { ReactComponent as PlusCircle } from "../../assets/icons/plusCircle.svg";
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg'

const Styles = styled.div`
    width: 100%;
    overflow: auto;
    background-color: #101016;
    border-radius: 1.5rem;
    div.card {
        background: #0A0A0E;
    }
    svg.helpIcon {
        path {
            fill: #FF9800;
        }
    }
    span.span-toggle {
        color: #5F5F5F;
        background: #959595;
    }
    svg.circleIcon {
        path {
            fill: #C4C4C4;
        }
    }
    button.select-btn-mini {
        padding-left: 0;
    }
    button.select-btn {
        border-radius: 0.75rem;
        span.select-text {
            color: #000000;
            font-weight: normal;
        }
        svg.select-dropdown {
            margin-right: -0.5rem;
        }
        svg.select-dropdown-margin-offset {
            margin-right: -0.5rem;
            path {
                fill: #000000;
            }
        }
    }

    div.deposit-modal, div.withdraw-modal {
        svg.close {
            path {
                fill: white;
            }
        }
        div.input-container {
            width: 40rem;
            input.input {
                // color: #5F5F5F;
            }
        }
    }
`;

export const LiquidityModal = ({ data, back }) => {
    const [slippageTolerance, setSlippageTolerance] = useState(0.5)

    const handleFocus = (event) => event.target.select();

    return (
        <Styles>
            <div className="py-10 flex justify-center text-white">
                <div className="border border-primary rounded-xl py-12 px-10 card flex flex-col items-center">
                    <div className="flex justify-center relative w-full">
                        {
                            // eslint-disable-next-line
                            <img src={arrowBack} alt={'Back'} className="absolute left-0 top-0.5" onClick={back} />
                        }
                        <span className="text-2xl font-bold">Add Liquidity</span>
                    </div>
                    <div className="bg-primary p-6 text-black max-w-sm mt-10 rounded-xl">
                        <span><b>Tip:</b><br /><br />When you add liquidity,
                            you will receive pool tokens representing your position.
                            These tokens automatically earn fees proportional to your share of the pool,
                            and can be redeemed at any time.</span>
                    </div>
                    <div className="flex justify-between mt-12 w-full">
                        <div>
                            <div className="flex items-center">
                                <span className="text-lg font-thin">Slippage Tolerance</span>
                                <HelpIcon className="ml-1.5 helpIcon" />
                            </div>
                            <div className="flex justify-between mt-3.5">
                                <span className={
                                    "p-1 text-lg rounded-xl w-14 text-center cursor-pointer "
                                    +
                                    ((slippageTolerance === 0.1) ? "bg-primary text-black" : "span-toggle")
                                }
                                    onClick={() => setSlippageTolerance(0.1)}
                                >
                                    0.1%
                                </span>
                                <span className={
                                    "p-1 text-lg rounded-xl w-14 text-center cursor-pointer "
                                    +
                                    ((slippageTolerance === 0.5) ? 'bg-primary text-black' : "span-toggle")
                                }
                                    onClick={() => setSlippageTolerance(0.5)}
                                >
                                    0.5%
                                </span>
                                <span className={
                                    "p-1 text-lg rounded-xl w-14 text-center cursor-pointer "
                                    +
                                    ((slippageTolerance === 1) ? 'bg-primary text-black' : "span-toggle")
                                }
                                    onClick={() => setSlippageTolerance(1)}
                                >
                                    1%
                                </span>
                            </div>
                        </div>
                        <div className="ml-16">
                            <div className="flex items-center">
                                <span className="text-lg font-thin">Transaction Deadline</span>
                                <HelpIcon className="ml-1.5 helpIcon" />
                            </div>
                            <div className="flex justify-between items-center mt-3.5">
                                <input
                                    onFocus={handleFocus}
                                    className="border border-solid border-primary bg-transparent w-32
                                        rounded-xl focus:outline-none font-normal px-5 py-1 text-white"
                                    type="number"
                                    defaultValue={20}
                                />
                                <span className="text-lg font-thin">minutes</span>
                            </div>
                        </div>
                    </div>
                    <div className="border border-solid border-primary rounded-xl px-5 py-3 mt-11 w-full flex justify-between">
                        <div className="flex flex-col">
                            <span className="font-thin">Input</span>
                            <input
                                onFocus={handleFocus}
                                className="bg-transparent focus:outline-none font-normal px-0 py-1 text-white font-bold mt-2"
                                type="number"
                                defaultValue={0.00}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <span className="font-thin">Balance </span><span className="mr-2 text-primary">-</span>
                            </div>
                            <div className="flex items-center mt-2 w-32">
                                {/* <img src={annCoinImg} alt="ANN" className="w-8" />
                                <span className="mx-2 my-0">ANN</span>
                                <img src={arrowDown} alt="Dropdown" className="" /> */}
                                <Select
                                    selectedClassName="py-1 pr-1 select-btn select-btn-mini"
                                    selectedTextClassName="text-base"
                                    type={'mini'}
                                    dropDownClass="select-dropdown"
                                    options={[{ name: 'ANN', logo: annCoinImg }, { name: 'BNB', logo: bnbCoinImg }]}
                                />
                            </div>
                        </div>
                    </div>
                    <PlusCircle className="w-8 self-start mt-6 circleIcon" />
                    <div className="border border-solid border-primary rounded-xl px-5 py-3 mt-6 w-full flex justify-between">
                        <div className="flex flex-col">
                            <span className="font-thin">Input</span>
                            <input
                                onFocus={handleFocus}
                                className="bg-transparent focus:outline-none font-normal px-0 py-1 text-white font-bold mt-2"
                                type="number"
                                defaultValue={0.00}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <span className="font-thin">Balance </span><span className="mr-2 text-primary">-</span>
                            </div>
                            <div className="flex mt-2 w-40">
                                <Select
                                    selectedClassName="bg-primary py-1 pr-1 pl-4 select-btn"
                                    selectedTextClassName="select-text"
                                    dropDownClass="select-dropdown-margin-offset"
                                    options={[{ name: 'Select A Token' }, { name: 'ETH' }, { name: 'BNB' }]}
                                />
                            </div>
                        </div>
                    </div>
                    <button className="py-4 px-20 rounded-xl text-black bg-primary font-bold text-2xl mt-16" onClick={() => {
                        back()
                    }}>Approve ANN</button>
                </div>
            </div>
        </Styles>
    )
}


export const DepositWithdrawModal = ({ close, item, type, stakeType }) => {

    const handleFocus = (event) => event.target.select();

    return (
        <Styles>
            <div className="py-10 flex flex-col items-center justify-center text-white">
                <div className="border border-primary rounded-xl py-16 px-12 card flex flex-col items-center text-2xl deposit-modal">
                    <div className="flex w-full justify-center items-center relative">
                        <span className="font-bold">Deposit</span>
                        <a href="#" className="absolute right-0 top-0 h-full" onClick={close}>
                            <CloseIcon className="close h-full" />
                        </a>
                    </div>
                    <div className="border border-primary rounded-xl flex justify-between items-center py-2.5 px-3.5 mt-10 input-container">
                        <input
                            onFocus={handleFocus}
                            className="bg-transparent focus:outline-none font-normal px-0 py-1 text-white font-bold m-0 flex input"
                            type="number"
                            defaultValue={0.00}
                        />
                        <span>MAX</span>
                    </div>
                    <div className="flex w-full justify-between mt-10">
                        <span>Available Balance</span>
                        <span>1234567.87654321{"\t"}SWORD</span>
                    </div>
                    <button className="bg-primary rounded-xl text-black font-bold mt-20 py-4 px-28">Confirm</button>
                </div>


                {/* <div className="border border-primary rounded-xl py-16 px-12 card flex flex-col items-center text-2xl withdraw-modal mt-36">
                    <div className="flex w-full justify-center items-center relative">
                        <span className="font-bold">Withdraw</span>
                        <a href="#" className="absolute right-0 top-0 h-full" onClick={close}>
                            <CloseIcon className="close h-full" />
                        </a>
                    </div>
                    <div className="border border-primary rounded-xl flex justify-between items-center py-2.5 px-3.5 mt-10 input-container">
                        <input
                            onFocus={handleFocus}
                            className="bg-transparent focus:outline-none font-normal px-0 py-1 text-white font-bold m-0 flex input"
                            type="number"
                            defaultValue={0.00}
                        />
                        <span>MAX</span>
                    </div>
                    <div className="flex w-full justify-between mt-10">
                        <span>Available Balance</span>
                        <span>10000.87654321{"\t"}SWORD</span>
                    </div>
                    <button className="bg-primary rounded-xl text-black font-bold mt-20 py-4 px-28">Confirm</button>
                </div> */}
            </div>
        </Styles>
    )
}

export default {}