import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import AnnexLogo from '../../assets/images/coins/ann.png';
import ROI from '../../assets/images/roi.png';
import Refresh from '../../assets/images/refresh.png';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import MetaMask from '../../assets/icons/metaMask.svg';
import ArrowIconOrange from '../../assets/icons/lendingArrowOrange.png';
import SVG from "react-inlinesvg";


function Grid() {
  
  const ArrowContainer = styled.div`
    transform: ${({ active }) => active ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: 0.3s ease all;
    will-change: transform;
  `
  

    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 ">
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black rounded-3xl col-span-4">
                <div className="bgPrimaryGradient py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>
                    <div className="text-white">Recent ANN Profit:</div>
                    <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div>
                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl text-black w-40 text-center text-sm">Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" /> Auto</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)}  className="text-primary text-sm flex items-center cursor-pointer" >Details
                            <div className="ml-2 order-4 hidden sm:flex">
                                <ArrowContainer active={showDetails}>
                                    <img src={ArrowIconOrange} alt="" />
                                </ArrowContainer>
                            </div>
                        </div>
                    </div>
                    {showDetails && (
                        <div className="mt-5">
                            <div className="flex item-center justify-between">
                                <div className="text-white font-bold text-sm">Total Staked:</div>
                                <div className="text-white text-sm">18,916,290.331 ANN</div>
                            </div>
                            <div className="mt-3 flex item-center justify-between">
                                <div className="text-white text-sm">Performance Fee</div>
                                <div className="text-white text-sm">2%</div>
                            </div>
                            <div className="flex flex-col item-center mt-3">
                                <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="my-2 text-white text-xs text-right
                             flex justify-end">View Contract<img src={OrangeexpandBox} alt="" className="ml-2" /></div>
                                <div className="text-white text-xs text-right
                             flex justify-end">Add to Metamask <img src={MetaMask} alt="" className="ml-2" width="16" /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="text-white">grid</div> */}
        </div>
    );
}

export default Grid;
