import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import Loader from 'components/UI/Loader';
import Refresh from '../../assets/images/refresh.png';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import MetaMask from '../../assets/icons/metaMask.svg';
import ArrowIconOrange from '../../assets/icons/lendingArrowOrange.png';
export default function AutoCard({ item, openModal, handleEnable, openDetails, addToken, cardLoading }) {
    console.log('itemmm', item)
    const ArrowContainer = styled.div`
    transform: ${({ active }) => active ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: 0.3s ease all;
    will-change: transform;
  `
    return (
        <div className="bg-black rounded-3xl col-span-4" key={item.id} style={{ height: 'fit-content' }}>
            <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl 
                        flex items-center w-full justify-between">
                <div className="flex flex-col">
                    <div className="text-white font-bold text-xl">{item.label}</div>
                    <div className="text-white">{item.sublabel}</div>
                </div>
                <div className="bg-blue rounded-full relative w-9 h-9 ">
                    <img src={item.logo} alt="" className="" />
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-center font-bold text-primary justify-between mb-4">
                    <div className="tooltip relative">
                        <div className="tooltip-label">
                            APY:<span className=""></span>
                        </div>
                        <span className="label">
                            For Information Purposes
                        </span>
                    </div>
                    <div className="text-white font-bold flex items-center">0%
                    </div>
                </div>
                <div className="text-white">Recent {item.symbol} Profit:</div>
                <div className="text-white text-sm mt-2 mb-4">{`${`${item.withdrawFee}% unstaking 
                                fee if withdrawn within ${item.withdrawFeePeriod}h`}`}</div>
                {cardLoading ? <Loader size="20px" className="mr-4" stroke="#717579" /> : item.userInfo ?
                    <div>
                        <div className="text-white text-sm">{item.symbol} Staked (Compounding)</div>
                        <div className="text-center mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-white">0.0000</div>
                                <div className="text-white font-bold flex items-center  gap-2">
                                    <button className="focus:outline-none bg-primary py-3 px-4 rounded-2xl 
                                text-black w-12 text-center text-sm" onClick={() => openModal(item, 'minus')}>
                                        -
                                    </button>
                                    <button className="focus:outline-none bg-primary py-3 px-4 rounded-2xl 
                                text-black w-12 text-center text-sm" onClick={() => openModal(item, 'plus')}>
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> : <div>
                        <div className="text-white text-sm">Stake {item.symbol}</div>
                        <div className="text-center mt-2">
                            <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl 
                                text-black w-40 text-center text-sm" onClick={item.allowance === 0 ? () => handleEnable(item) :
                                    () => openModal(item, 'stake')}>{item.allowance === 0 ?
                                        'Enable' : item.allowance > 0 ? 'Stake' : ''}
                            </button>
                        </div>
                    </div>}
            </div>
            <div className="border-t border-solid border-custom p-5">
                <div className="flex items-center justify-between">
                    <div className="">
                        <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" />
                            {'Auto'}</button>
                    </div>
                    <div onClick={() => openDetails(item, !item.isOpen)} className="text-primary text-sm flex 
                                items-center cursor-pointer" >Details
                        <div className="ml-2 order-4 hidden sm:flex">
                            <ArrowContainer active={item.isOpen}>
                                <img src={ArrowIconOrange} alt="" />
                            </ArrowContainer>
                        </div>
                    </div>
                </div>
                {item.isOpen === true ? (
                    <div className="mt-5">
                        <div className="flex item-center justify-between">
                            <div className="text-white font-bold text-sm">Total Staked:</div>
                            <div className="text-white text-sm">{`${item.totalStacked} ${item.symbol}`}</div>
                        </div>
                        <div className="mt-3 flex item-center justify-between">
                            <div className="text-white text-sm">Performance Fee</div>
                            <div className="text-white text-sm">{`${item.performanceFee}%`}</div>
                        </div>
                        <div className="flex flex-col item-center mt-3">
                            <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <a
                                    href={`https://www.annex.finance/`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src={OrangeexpandBox} alt="" className="ml-2" />
                                </a> </div>
                            <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract
                                <a
                                    href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${item.contract_Address
                                        }`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src={OrangeexpandBox} alt="" className="ml-2" />
                                </a>
                            </div>
                            <div className="text-white text-xs text-right
                             flex justify-end" onClick={() => addToken(item)}>Add to Metamask
                                <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                        </div>
                    </div>
                ) : undefined}
            </div>
        </div>
    )
}
