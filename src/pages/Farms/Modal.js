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
import BigNumber from 'bignumber.js';
import toast from 'components/UI/Toast';
import useStakeFarms from 'hooks/farms/useStakeFarms'
import useUnstakeFarms from 'hooks/farms/useUnstakeFarms'
import Loader from 'components/UI/Loader';

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
            width: 100%;
            min-width: 40rem;
            input.input {
                // color: #5F5F5F;
            }
        }
    }
`;

export const DepositWithdrawModal = ({ close, item, type, stakeType }) => {
    const { onStake } = useStakeFarms(item.pid)
    const { onUnstake } = useUnstakeFarms(item.pid)
    const [pendingTx, setPendingTx] = useState(false)

    const [inputAmount, setInputAmount] = useState(0)
    const handleFocus = (event) => event.target.select();
    const onConfirm = async () => {
        if (stakeType === 'stake') {
            console.log(stakeType, item)
            if (inputAmount <= 0) {
                toast.error({
                    title: `Invalid amount`
                });
                return
            } else if (item.userData?.tokenBalance && new BigNumber(inputAmount).comparedTo(new BigNumber(item.userData.tokenBalance)) > 0) {
                toast.error({
                    title: `Insufficient funds`
                });
                return
            }

            setPendingTx(true)
            await onStake(inputAmount)
            setPendingTx(false)
        } else {
            if (inputAmount <= 0) {
                toast.error({
                    title: `Invalid amount`
                });
                return
            } else if (item.userData?.stakedBalance && new BigNumber(inputAmount).comparedTo(new BigNumber(item.userData.stakedBalance)) > 0) {
                toast.error({
                    title: `Insufficient funds`
                });
                return
            }

            setPendingTx(true)
            await onUnstake(inputAmount)
            setPendingTx(false)
        }
        toast.success({
            title: `Success`
        });
        close()
    }
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
                            value={inputAmount}
                            onChange={(e) => { setInputAmount(e.target.value) }}
                        />
                        <span className="cursor-pointer select-none" onClick={() => {
                            if (stakeType === 'stake') {
                                setInputAmount(item.userData?.tokenBalance
                                    ? new BigNumber(item.userData.tokenBalance).div(1e18).toString(10)
                                    : 0.00000000)
                            } else {
                                setInputAmount(item.userData?.stakedBalance
                                    ? new BigNumber(item.userData.stakedBalance).div(1e18).toString(10)
                                    : 0.00000000)
                            }
                        }}>MAX</span>
                    </div>
                    <div className="flex w-full justify-between mt-10">
                        <span>Available Balance</span>
                        <span className="ml-4">
                            {stakeType === 'stake' ? (
                                item.userData?.tokenBalance
                                    ? new BigNumber(item.userData.tokenBalance).div(1e18).toString(10)
                                    : "0.00000000"
                            ) : (
                                item.userData?.stakedBalance
                                    ? new BigNumber(item.userData.stakedBalance).div(1e18).toString(10)
                                    : "0.00000000"
                            )}
                            {"\t"}
                            {item.lpSymbol}
                        </span>
                    </div>
                    <button
                        className={`rounded-xl flex justify-center items-center 
                            font-bold mt-20 py-4 px-28
                            ${pendingTx ? " bg-lightGray text-gray pointer-events-none " : " bg-primary text-black "}`}
                        onClick={onConfirm}
                    >
                        {pendingTx && <Loader size="20px" className="mr-4" stroke="#717579" />}
                        Confirm
                    </button>
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