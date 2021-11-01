import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import AnnexLogo from '../../assets/images/coins/ann.png';
import ROI from '../../assets/images/roi.png';
import Refresh from '../../assets/images/refresh.png';
import OrangeexpandBox from '../../assets/icons/orange-expandBox.png';
import MetaMask from '../../assets/icons/metaMask.svg';
import ArrowIconOrange from '../../assets/icons/lendingArrowOrange.png';
import SVG from "react-inlinesvg";
import { CONTRACT_ABEP_ADDRESS, CONTRACT_TOKEN_ADDRESS, CONTRACT_ABEP_ABI } from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
import { getTokenContract, methods } from '../../utilities/ContractService';
import Web3 from 'web3';
const instance = new Web3(window.ethereum);



const database = [{
    id: 1,
    name: 'ann',
    token_address: CONTRACT_TOKEN_ADDRESS.ann.address,
    symbol: CONTRACT_TOKEN_ADDRESS.ann.symbol,
    decimal: 18,
    label: 'AUTO ANN',
    sublabel: 'Automatic restaking',
    auto_staking: true,
    contract_Address: process.env.REACT_APP_ENV === 'dev' ? process.env.REACT_APP_ANN_TEST_Vault_ADDRESS
        : process.env.REACT_APP_ANN_MAIN_Vault_ADDRESS,
    logo: CONTRACT_TOKEN_ADDRESS.ann.asset,
    isFinished: false,
    isOpen: false
}, {
    id: 2,
    name: 'ann',
    token_address: CONTRACT_TOKEN_ADDRESS.ann.address,
    symbol: CONTRACT_TOKEN_ADDRESS.ann.symbol,
    decimal: 18,
    label: 'Manual ANN',
    sublabel: 'Earn ANN, stake ANN',
    auto_staking: false,
    contract_Address: process.env.REACT_APP_ENV === 'dev' ? process.env.REACT_APP_TEST_Annex_Farm_ADDRESS
        : process.env.REACT_APP_MAIN_Annex_Farm_ADDRESS,
    logo: CONTRACT_TOKEN_ADDRESS.ann.asset,
    isFinished: false,
    isOpen: false
},
    // {
    //     id: 3,
    //     // eslint-disable-next-line max-len
    //     token_address: CONTRACT_TOKEN_ADDRESS.busd.address,
    //     symbol: CONTRACT_TOKEN_ADDRESS.busd.symbol,
    // decimal: 18,
    //     label: 'Manual USDC',
    //     sublabel: 'Earn USDC, stake USDC',
    //     auto_staking: false,
    //     contract_Address: process.env.REACT_APP_ENV === 'dev' ? process.env.REACT_APP_TEST_Annex_Farm_ADDRESS
    //         : process.env.REACT_APP_MAIN_Annex_Farm_ADDRESS,
    //     logo: CONTRACT_TOKEN_ADDRESS.busd.asset,
    //     isFinished: false,
    //     isOpen: false
    // }
]


function Grid() {
    const ArrowContainer = styled.div`
    transform: ${({ active }) => active ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: 0.3s ease all;
    will-change: transform;
  `
    const [data, setData] = useState(database)
    const [isEnabled, setIsEnabled] = useState(false);

    const { account } = useActiveWeb3React();

    useEffect(async () => {
        const allowanceMapped = data.map(async (item) => {
            const tokenContract = getTokenContract(item.name);
            let allowance = await methods.call(tokenContract.methods.allowance, [
                account,
                item.contract_Address,
            ])
            return {
                ...item,
                allowance: Number(allowance)
            }

        })

        const resolvedArray = await Promise.all(allowanceMapped);
        console.log('resolvedArray', resolvedArray)
        setData(resolvedArray)

    }, [isEnabled]);


    console.log('database', data)

    const handleEnable = (item) => {
        console.log('enabled', item)
        // const tokenContract = getTokenContract(item.name);
        const tokenContract = new instance.eth.Contract(
            JSON.parse(CONTRACT_ABEP_ABI),
            item.token_address,
        );
        setIsEnabled(true);
        console.log('tokenContract', tokenContract)
        methods
            .send(
                tokenContract.methods.approve,
                [item.contract_Address, '115792089237316195423570985008687907853269984665640564039457584007913129639935'],
                account,
            )
            .then((data) => {
                setIsEnabled(false);
                console.log('data', data);
            })
            .catch((error) => {
                console.log('error', error);
            });
    }


    const openDetails = (elem, open) => {
        const element = data.map(item => {
            if (item.id === elem.id) {
                return {
                    ...item,
                    isOpen: open
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

    return (
        <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 ">

            {data.length && data.map(item => {
                return (
                    <div className="bg-black rounded-3xl col-span-4" key={item.id}>
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-white">ANN:</div>
                                <div className="text-white font-bold flex items-center">0 <img src={ROI} className="ml-3" alt="" /></div>
                            </div>
                            <div className="text-white">Recent ANN Profit:</div>
                            <div className="text-white text-sm mt-2 mb-4">0</div>
                            <div className="text-white text-sm">STAKE ANN</div>
                            <div className="text-center mt-2">
                                {/* {isEnabled && <Loader size="20px" className="mr-1.5" stroke="#717579" />} */}
                                <button className="focus:outline-none bg-primary py-2 px-4 rounded-3xl 
                                text-black w-40 text-center text-sm" onClick={() => handleEnable(item)}>{item.allowance === 0 ?
                                        'Enable' : item.allowance > 0 ? 'Stack' : ''}</button>
                            </div>
                        </div>
                        <div className="border-t border-solid border-custom p-5">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <button className="flex items-center focus:outline-none bg-primary py-2 px-4 
                        rounded-3xl text-black text-center text-sm"><img src={Refresh} className="mr-1" alt="" />
                                        {item.auto_staking ? 'Auto' : 'Manual'}</button>
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
                                        <div className="text-white text-sm">0</div>
                                    </div>
                                    <div className="mt-3 flex item-center justify-between">
                                        <div className="text-white text-sm">Performance Fee</div>
                                        <div className="text-white text-sm">0</div>
                                    </div>
                                    <div className="flex flex-col item-center mt-3">
                                        <div className="text-white text-xs text-right
                             flex justify-end">View Project Site <a
                                                href={`https://www.annex.finance/`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img src={OrangeexpandBox} alt="" className="ml-2" />
                                                {/* <img
                                                className="ml-3"
                                                src={require('../../../assets/images/link.svg').default}
                                                alt=""
                                            /> */}
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
            })}

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
    );
}

export default Grid;
