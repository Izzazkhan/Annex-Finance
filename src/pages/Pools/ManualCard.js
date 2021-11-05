import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import AnnexLogo from '../../assets/images/coins/ann.png';
import ROI from '../../assets/images/roi.png';
import Reload from '../../assets/images/reload.png';
import Loader from 'components/UI/Loader';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import MetaMask from '../../assets/icons/metaMask.svg';
import ArrowIconOrange from '../../assets/icons/lendingArrowOrange.png';
import SVG from "react-inlinesvg";

function ManualCard({ item, openModal, handleEnable, openDetails, addToken, annPrice, selectedId, loading }) {

    const ArrowContainer = styled.div`
    transform: ${({ active }) => active ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: 0.3s ease all;
    will-change: transform;
  `
    return (
        <div className="bg-black rounded-3xl col-span-4 box-hover-color" key={item.id} style={{ height: 'fit-content' }}>
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
                <div className="flex items-center font-bold text-primary justify-between mb-4
                open mb-2  text-lg">
                    <div className="tooltip relative">
                        <div className="tooltip-label">
                            APR:<span className=""></span>
                        </div>
                        <span className="label">
                            {`This pool’s rewards aren’t compounded automatically, so we show APR`}
                        </span>
                    </div>
                    <div className="text-white font-bold flex items-center">0%
                    </div>
                    {/* <img src={ROI} className="ml-3" alt="" /> */}
                </div>
                <div className="text-white text-sm font-bold">{item.symbol} EARNED</div>
                {/* <div className="text-white text-sm mt-2 mb-4">{`${'ddd'}`}</div> */}
                <div className="text-center mt-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <div className={`${item.isUserInfo.amount > 0 ? 'text-white' : 'text-gray pointer-events-none'} 
                            text-left text-lg font-bold`}>
                                {item.isUserInfo.amount > 0 ? Number(item.pendingAnnex).toFixed(5) : '0'}</div>
                            <div className={`${item.isUserInfo.amount > 0 ? 'text-white' : 'text-gray pointer-events-none'} 
                            text-white text-xs text-left`}>
                                {`${item.isUserInfo.amount > 0 ? `~${Number(item.pendingAnnex * annPrice).toFixed(5)} USD` : '0 USD'}`}
                            </div>
                        </div>
                        <div className="text-white font-bold flex items-center">
                            <button className={`focus:outline-none bg-primary py-3 px-4 rounded-2xl 
                                text-black w-28 text-center text-sm font-bold 
                                ${item.isUserInfo.amount > 0 ? `bg-primary` : `bg-lightGray text-gray pointer-events-none`}`}
                                onClick={() => openModal(item, 'collect')}>
                                Collect
                            </button>
                        </div>
                    </div>
                </div>

                {item.userInfo ?
                    <div>
                        <div className="text-white text-sm font-bold">{item.symbol} Staked</div>
                        <div className="text-center mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <div className="text-white text-left text-lg font-bold">{Number(item.stacked).toFixed(5)}</div>
                                    <div className="text-white text-xs text-left">
                                        {`~${Number(item.stacked * annPrice).toFixed(5)} USD`}
                                    </div>
                                </div>

                                <div className="text-white font-bold flex items-center gap-2">
                                    <button className="focus:outline-none bg-primary py-3 px-4 rounded-2xl 
                                text-black w-12 text-center text-sm font-bold" onClick={() => openModal(item, 'minus')}>
                                        -
                                    </button>
                                    <button className="focus:outline-none bg-primary py-3 px-4 rounded-2xl 
                                text-black w-12 text-center text-sm font-bold" onClick={() => openModal(item, 'plus')}>
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> : <div>
                        <div className="text-white text-sm font-bold">Stake {item.symbol}</div>
                        <div className="text-center mt-2">
                            {/* <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl 
                                text-black w-40 text-center text-sm font-bold" 
                                onClick={item.allowance === 0 ? () => handleEnable(item) :
                                    () => openModal(item, 'stake')}>{item.allowance === 0 ?
                                        'Enable' : item.allowance > 0 ? 'Stake' : ''}
                            </button> */}
                            <button className={`focus:outline-none ${loading && selectedId === item.id ?
                                " bg-lightGray text-gray pointer-events-none " :
                                " bgPrimaryGradient text-black "} py-2 px-4 rounded-3xl
                                text-black w-40 text-center text-sm font-bold`}
                                onClick={item.allowance === 0 ? () => handleEnable(item) :
                                    () => openModal(item, 'stake')}>
                                {loading && selectedId === item.id && <Loader size="20px" className="mr-4" stroke="#717579" />}
                                {item.allowance === 0 ?
                                    'Enable' : item.allowance > 0 ? 'Stake' : ''}
                            </button>
                        </div>
                    </div>}
            </div>
            <div className="border-t border-solid border-custom p-5">
                <div className="flex items-center justify-between">
                    <div className="">
                        <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm font-bold"><img src={Reload} className="mr-1" alt="" />
                            {'Manual'}</button>
                    </div>
                    <div onClick={() => openDetails(item, !item.isOpen)} className="text-primary text-sm flex 
                                items-center cursor-pointer font-bold" >Details
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
                            <div className="text-white text-sm">{0}</div>
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

export default ManualCard