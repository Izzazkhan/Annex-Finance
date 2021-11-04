import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import {
    CONTRACT_TOKEN_ADDRESS, CONTRACT_ABEP_ABI, CONTRACT_ANN_Vault,
    CONTRACT_Annex_Farm, REACT_APP_ANN_Vault_ADDRESS, REACT_APP_ANNEX_FARM_ADDRESS
} from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
import { getTokenContract, methods } from '../../utilities/ContractService';
import Web3 from 'web3';
const instance = new Web3(window.ethereum);
import Modal from './StakeModel'
import AutoCard from './AutoCard';
import ManualCard from './ManualCard';
import CollectModal from './CollectModal';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import Loader from 'components/UI/Loader';


const database = [{
    id: 1,
    _pid: 0,
    name: 'ann',
    token_address: CONTRACT_TOKEN_ADDRESS.ann.address,
    symbol: CONTRACT_TOKEN_ADDRESS.ann.symbol,
    decimal: 18,
    label: 'AUTO ANN',
    sublabel: 'Automatic restaking',
    auto_staking: true,
    contract_Address: REACT_APP_ANN_Vault_ADDRESS,
    contract_Abi: CONTRACT_ANN_Vault,
    logo: CONTRACT_TOKEN_ADDRESS.ann.asset,
    isFinished: false,
    isOpen: false,
}, {
    id: 2,
    _pid: 0,
    name: 'ann',
    token_address: CONTRACT_TOKEN_ADDRESS.ann.address,
    symbol: CONTRACT_TOKEN_ADDRESS.ann.symbol,
    decimal: 18,
    label: 'Manual ANN',
    sublabel: 'Earn ANN, stake ANN',
    auto_staking: false,
    contract_Address: REACT_APP_ANNEX_FARM_ADDRESS,
    contract_Abi: CONTRACT_Annex_Farm,
    logo: CONTRACT_TOKEN_ADDRESS.ann.asset,
    isFinished: false,
    isOpen: false
},
    // {
    //     id: 3,
    //     _pid: 0,
    //     token_address: CONTRACT_TOKEN_ADDRESS.busd.address,
    //     symbol: CONTRACT_TOKEN_ADDRESS.busd.symbol,
    //     decimal: 18,
    //     label: 'Manual USDC',
    //     sublabel: 'Earn USDC, stake USDC',
    //     auto_staking: false,
    //     contract_Address: REACT_APP_ANNEX_FARM_ADDRESS,
    //     contract_Abi: CONTRACT_Annex_Farm,
    //     logo: CONTRACT_TOKEN_ADDRESS.busd.asset,
    //     isFinished: false,
    //     isOpen: false
    // }
]

const Styles = styled.div`
    .tooltip-label {
      text-decoration-line: underline;
      text-decoration-style: dotted;
      text-underline-offset: 5px;
    }
  }
 `

function Grid({ settings }) {
    const [data, setData] = useState(database)
    const [loading, setLoading] = useState(false);
    const [stakeModal, setStakeModal] = useState(false);
    const [collectModal, setCollectModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState('');
    const [buttonName, setButtonName] = useState('');
    const [modalError, setModalError] = useState({
        message: '',
        type: '',
    });
    const [cardsLoading, setcardsLoading] = useState(true)
    const { account } = useActiveWeb3React();

    useEffect(async () => {
        const allowanceMapped = data.map(async (item) => {
            const tokenContract = getTokenContract(item.name);
            let allowance = await methods.call(tokenContract.methods.allowance, [
                account,
                item.contract_Address,
            ])

            let balanceOf = await methods.call(tokenContract.methods.balanceOf, [account]);
            const decimal = await methods.call(tokenContract.methods.decimals, []);
            balanceOf = balanceOf / Math.pow(10, decimal)
            let withdrawFee = 0, withdrawFeePeriod = 0, isUserInfo = 0, userInfo, stacked, pendingAnnex, pendingAnnexWithoutDecimal
            const contract = new instance.eth.Contract(
                JSON.parse(item.contract_Abi),
                item.contract_Address,
            );
            console.log('methods', contract.methods)

            if (item.auto_staking === true) {
                withdrawFee = await methods.call(contract.methods.withdrawFee, []);
                withdrawFee = (withdrawFee / 10000) * 100
                withdrawFeePeriod = await methods.call(contract.methods.withdrawFeePeriod, []);
                withdrawFeePeriod = withdrawFeePeriod / 3600
                if (Number(allowance) > 0) {
                    isUserInfo = await methods.call(contract.methods.userInfo, [account]);
                    if (isUserInfo.shares > 0) {
                        userInfo = true
                        stacked = isUserInfo.shares / Math.pow(10, decimal)
                    }
                }
            }
            else {
                pendingAnnex = await methods.call(contract.methods.pendingAnnex, [item._pid, account]);
                pendingAnnex = pendingAnnex / Math.pow(10, decimal)
                console.log('pendingAnnexWithoutDecimal', pendingAnnex)
                pendingAnnexWithoutDecimal = await methods.call(contract.methods.pendingAnnex, [item._pid, account]);
                if (Number(allowance) > 0) {
                    isUserInfo = await methods.call(contract.methods.userInfo, [item._pid, account]);

                    if (isUserInfo.amount > 0) {
                        userInfo = true
                        stacked = isUserInfo.amount / Math.pow(10, decimal)
                    }
                }
            }

            return {
                ...item,
                allowance: Number(allowance),
                decimal: Number(decimal),
                tokenBalance: balanceOf,
                stacked,
                withdrawFee,
                withdrawFeePeriod,
                userInfo,
                pendingAnnex,
                pendingAnnexWithoutDecimal
            }
        })
        const resolvedArray = await Promise.all(allowanceMapped);
        setData(resolvedArray)
        setcardsLoading(false)
    }, [loading]);


    console.log('database', data)

    const handleEnable = (item) => {
        const tokenContract = new instance.eth.Contract(
            JSON.parse(CONTRACT_ABEP_ABI),
            item.token_address,
        );
        setLoading(true);
        methods
            .send(
                tokenContract.methods.approve,
                [item.contract_Address, '115792089237316195423570985008687907853269984665640564039457584007913129639935'],
                account,
            )
            .then((data) => {
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log('error', error);
            });
    }


    const openDetails = async (elem, open) => {
        let totalStacked, performanceFee
        if (elem.id !== 2) {
            const contract = new instance.eth.Contract(
                JSON.parse(elem.contract_Abi),
                elem.contract_Address,
            );
            let balanceOf = await methods.call(contract.methods.balanceOf, []);
            totalStacked = balanceOf / Math.pow(10, elem.decimal)
            performanceFee = await methods.call(contract.methods.performanceFee, []);
            performanceFee = (performanceFee / 10000) * 100
        }

        const element = data.map(item => {
            if (item.id === elem.id && item.id !== 2) {
                return {
                    ...item,
                    isOpen: open,
                    totalStacked,
                    performanceFee: performanceFee
                }
            }
            else if (item.id === elem.id) {
                return {
                    ...item,
                    isOpen: open,
                }
            }
            else {
                return {
                    ...item,
                }
            }
        })
        setData(element)
    }


    const addToken = async (item) => {
        const tokenAddress = item.token_address;
        const tokenSymbol = item.symbol;
        const tokenDecimals = item.decimal;
        const tokenImage = item.logo;
        try {
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage,
                    },
                },
            });

            if (wasAdded) {
                console.log('Token added');
            } else {
                console.log('Please check here');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const openModal = (item, buttonValue) => {
        if (buttonValue === 'collect') {
            setCollectModal(true)
        }
        else {
            setStakeModal(true);
        }
        setSelectedCard(item)
        setButtonName(buttonValue)
    }

    const closeModal = () => {
        setStakeModal(false);
        setCollectModal(false)
        setModalError({
            message: '',
            type: '',
        });
    };

    const handleConfirm = (amount, buttonValue) => {
        if (amount > 0) {
            const contract = new instance.eth.Contract(
                JSON.parse(selectedCard.contract_Abi),
                selectedCard.contract_Address,
            );
            const methodName = buttonValue === 'minus' || buttonValue === 'harvest' ? contract.methods.withdraw : contract.methods.deposit
            setLoading(true);
            let contractArray
            if (selectedCard.id === 2) {
                if (buttonValue === 'harvest' || buttonValue === 'compound') {
                    contractArray = [selectedCard._pid, amount]
                }
                else {
                    contractArray = [selectedCard._pid, amount * Math.pow(10, selectedCard.decimal)]
                }
            }
            else {
                contractArray = [amount * Math.pow(10, selectedCard.decimal)]
            }
            methods
                .send(
                    methodName,
                    contractArray,
                    account,
                )
                .then((data) => {
                    setLoading(false);
                    setStakeModal(false)
                    setCollectModal(false)
                    console.log('data', data);
                    setModalError({
                        message: '',
                        type: '',
                    });
                })
                .catch((error) => {
                    console.log('error', error);
                    setModalError({
                        ...modalError,
                        message: error.message,
                    });
                    setLoading(false);
                });
        }
        else {
            setModalError({
                ...modalError,
                message: 'Amount should be greater than 0',
            });
        }
    }

    const handleToken = () => {
        console.log('token')
    }

    return (
        <Styles>
            <Fragment>
                <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 ">
                    {
                        cardsLoading ? (
                            <Loader size="160px" className="m-40" stroke="#ff9800" />
                        ) : (
                            data.length && data.map(item => {
                                if (item.auto_staking) {
                                    return (
                                        <AutoCard item={item} openModal={openModal} handleEnable={handleEnable}
                                            openDetails={openDetails} addToken={addToken}
                                            annPrice={settings.annPrice} />
                                    )
                                }
                                else {
                                    return (
                                        <ManualCard item={item} openModal={openModal} handleEnable={handleEnable}
                                            openDetails={openDetails} addToken={addToken}
                                            annPrice={settings.annPrice} />
                                    )
                                }
                            })
                        )
                    }





                    {/* <div className="bg-black rounded-3xl col-span-4">
                <div className={`${live ? 'bgPrimaryGradient' : finished ? 'bg-gray relative overflow-hidden' : ''}
                 py-3 md:py-7 px-5 rounded-t-3xl flex items-center w-full justify-between`}>
                    <div className="flex flex-col">
                        <div className="text-white font-bold text-xl">Auto ANN</div>
                        <div className="text-white">Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                    {finished ? <div className="finished-label bgPrimaryGradient text-xl font-bold px-10 py-2 text-center">Finished</div> : ''}

                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white">ANN:</div>
                        <div className="text-white font-bold flex items-center">143.94% <img src={ROI} className="ml-3" alt="" /></div>
                    </div>

                    {finished ? <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <div className="text-white text-sm">ANN Earned:</div>
                            <div className="text-white text-sm font-bold">0</div>
                            <div className="text-white text-sm">~0 USD</div>
                        </div>
                        <div className="text-white font-bold flex items-center">
                            <button className="flex items-center focus:outline-none bg-gray py-2 px-4 
                        rounded-lg text-black text-center font-bold text-sm"> Harvest</button></div>
                    </div> : live ? <><div className="text-white">Recent ANN Profit:</div>
                        <div className="text-white text-sm mt-2 mb-4">0.1% unstaking fee if withdrawn within 72h</div></> : ''}


                    <div className="text-white text-sm">STACK ANN</div>
                    <div className="text-center mt-2">
                        <button className={` ${live ? 'bg-primary' : finished ? 'bg-gray' : ''}
                         focus:outline-none  py-2 px-4 rounded-3xl text-black w-40 text-center text-sm`}>Enable</button>
                    </div>
                </div>
                <div className="border-t border-solid border-custom p-5">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <button className={`${live ? 'bg-primary' : finished ? 'bg-gray' : ''}
                             flex items-center focus:outline-none py-2 px-4 rounded-3xl text-black text-center text-sm`}>
                                <img src={Refresh} className="mr-1" alt="" /> {live ? 'Auto' : finished ? 'Manual' : ''}</button>
                        </div>
                        <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm flex items-center cursor-pointer" >Details
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
            </div> */}

                    {/* <div className="bg-black rounded-3xl col-span-4">
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
                        <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm flex items-center cursor-pointer" >Details
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
                        <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm flex items-center cursor-pointer" >Details
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
                        <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm flex items-center cursor-pointer" >Details
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
                        <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm flex items-center cursor-pointer" >Details
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
            </div> */}
                    {/* <div className="text-white">grid</div> */}
                </div>

                {
                    <Modal
                        // close={() => { setShowDepositeWithdrawModal(false) }}
                        // afterCloseModal={() => { }}
                        openModal={stakeModal}
                        data={selectedCard}
                        onSetOpen={() => setStakeModal(true)}
                        onCloseModal={() => closeModal()}
                        handleSubmit={handleConfirm}
                        getToken={handleToken}
                        modalError={modalError}
                        buttonText={buttonName}
                        loading={loading}
                    />
                }

                {
                    <CollectModal
                        // close={() => { setShowDepositeWithdrawModal(false) }}
                        // afterCloseModal={() => { }}
                        openModal={collectModal}
                        data={selectedCard}
                        onSetOpen={() => setCollectModal(true)}
                        onCloseModal={() => closeModal()}
                        handleSubmit={handleConfirm}
                        getToken={handleToken}
                        buttonText={buttonName}
                        loading={loading}
                        annPrice={settings.annPrice}
                    />
                }
            </Fragment>
        </Styles>
    );
}

const mapStateToProps = ({ account }) => ({
    settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
    const { setSetting } = accountActionCreators;

    return bindActionCreators(
        {
            setSetting,
        },
        dispatch,
    );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Grid);
