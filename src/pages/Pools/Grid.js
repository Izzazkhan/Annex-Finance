import React, { useEffect, useState, useCallback, Fragment } from 'react';
import styled from 'styled-components';
import {
    CONTRACT_TOKEN_ADDRESS, CONTRACT_ABEP_ABI, CONTRACT_ANN_Vault,
    CONTRACT_Annex_Farm, REACT_APP_ANN_Vault_ADDRESS, REACT_APP_ANNEX_FARM_ADDRESS,
    CONTRACT_ANN_TOKEN_ABI,
    BLOCK
} from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
import { getTokenContract, methods } from '../../utilities/ContractService';
import Web3 from 'web3';
const instance = new Web3(window.ethereum);
import StakeModal from './StakeModel'
import AutoCard from './AutoCard';
import ManualCard from './ManualCard';
import CollectModal from './CollectModal';
import Loader from 'components/UI/Loader';
import BigNumber from 'bignumber.js';

const AUTO_VAULT_COMPOUND_FREQUENCY = 5000

const Styles = styled.div`
    .tooltip-label {
      text-decoration-line: underline;
      text-decoration-style: dotted;
      text-underline-offset: 5px;
    }
  }
 `

function Grid({ annPrice, onlyStaked, poolState }) {

    const { account, chainId } = useActiveWeb3React();

    const database = [{
        id: 1,
        _pid: 0,
        name: 'ann',
        token_address: CONTRACT_TOKEN_ADDRESS[chainId].ann.address,
        symbol: CONTRACT_TOKEN_ADDRESS[chainId].ann.symbol,
        decimal: 18,
        label: 'AUTO ANN',
        sublabel: 'Automatic restaking',
        auto_staking: true,
        contract_Address: REACT_APP_ANN_Vault_ADDRESS[chainId],
        contract_Abi: CONTRACT_ANN_Vault,
        logo: CONTRACT_TOKEN_ADDRESS[chainId].ann.asset,
        isFinished: false,
        isOpen: false,
        apr: 50
    },
        // {
        //     id: 2,
        //     _pid: 0,
        //     name: 'ann',
        //     token_address: CONTRACT_TOKEN_ADDRESS.ann.address,
        //     symbol: CONTRACT_TOKEN_ADDRESS.ann.symbol,
        //     decimal: 18,
        //     label: 'Manual ANN',
        //     sublabel: 'Earn ANN, stake ANN',
        //     auto_staking: false,
        //     contract_Address: REACT_APP_ANNEX_FARM_ADDRESS,
        //     contract_Abi: CONTRACT_Annex_Farm,
        //     logo: CONTRACT_TOKEN_ADDRESS.ann.asset,
        //     isFinished: true,
        //     isOpen: false
        // },
    ]

    const [poolData, setPoolData] = useState([])
    const [loading, setLoading] = useState(false);
    const [stakeModal, setStakeModal] = useState(false);
    const [collectModal, setCollectModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState('');
    const [buttonName, setButtonName] = useState('');
    const [modalError, setModalError] = useState({
        message: '',
        type: '',
    });
    const [poolLoading, setPoolLoading] = useState(true)

    useEffect(() => {
        fetchPoolData(database.filter(pool => !pool.isFinished))
        let interval;
        if (account) {
            interval = setInterval(fetchPoolData, 30 * 1000, database.filter(pool => !pool.isFinished));
        }
        return () => {
            clearInterval(interval);
        };
    }, [loading, account, onlyStaked, poolState]);

    const farmContract = new instance.eth.Contract(
        JSON.parse(CONTRACT_Annex_Farm),
        REACT_APP_ANNEX_FARM_ADDRESS[chainId],
    );

    const getApy = (apr, compoundFrequency = 1, performanceFee = 0, days = 365) => {
        const daysAsDecimalOfYear = days / 365
        const aprAsDecimal = apr / 100
        const timesCompounded = 365 * compoundFrequency
        let apyAsDecimal = (apr / 100) * daysAsDecimalOfYear
        if (timesCompounded > 0) {
            apyAsDecimal = (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear) - 1
        }
        if (performanceFee) {
            const performanceFeeAsDecimal = performanceFee / 100
            const takenAsPerformanceFee = apyAsDecimal * performanceFeeAsDecimal
            apyAsDecimal -= takenAsPerformanceFee
        }

        return apyAsDecimal * 100
    }

    const fetchPoolData = useCallback(async (poolData) => {
        console.log('hello', poolData)
        const poolMapped = poolData.map(async (pool) => {
            // const tokenContract = getTokenContract(pool.name);
            const tokenContract = new instance.eth.Contract(
                JSON.parse(CONTRACT_ANN_TOKEN_ABI),
                pool.token_address,
            );
            let allowance = await methods.call(tokenContract.methods.allowance, [
                account,
                pool.contract_Address,
            ])

            let balanceOf = await methods.call(tokenContract.methods.balanceOf, [account]);
            const decimal = await methods.call(tokenContract.methods.decimals, []);
            balanceOf = balanceOf / Math.pow(10, decimal)
            let withdrawFee = 0, withdrawFeePeriod = 0, userInfo = 0, isUserInfo = false, stacked = 0, pendingAnnex, pendingAnnexWithoutDecimal,
                apyValue = 0, recentAnnProfit = 0
            const contract = new instance.eth.Contract(
                JSON.parse(pool.contract_Abi),
                pool.contract_Address,
            );

            if (pool.auto_staking === true) {
                withdrawFee = await methods.call(contract.methods.withdrawFee, []);
                withdrawFee = (withdrawFee / 10000) * 100
                withdrawFeePeriod = await methods.call(contract.methods.withdrawFeePeriod, []);
                withdrawFeePeriod = withdrawFeePeriod / 3600
                if (Number(allowance) > 0) {
                    userInfo = await methods.call(contract.methods.userInfo, [account]);
                    if (userInfo.shares > 0) {
                        isUserInfo = true
                        stacked = convertExponentToNum(userInfo.shares / Math.pow(10, decimal))
                    }
                }
                const rewardTokenPrice = annPrice
                const stakingTokenPrice = annPrice
                const BSC_BLOCK_TIME = BLOCK[chainId].time
                const BLOCKS_PER_YEAR = (60 / BSC_BLOCK_TIME) * 60 * 24 * 365 // 10512000
                const tokenPerBlock = await methods.call(farmContract.methods.annexPerBlock, [])
                let totalStaked = await methods.call(contract.methods.balanceOf, []);
                const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
                const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
                let apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)
                let performanceFee = await methods.call(contract.methods.performanceFee, []);
                performanceFee = (performanceFee / 10000) * 100
                apyValue = getApy(apr, AUTO_VAULT_COMPOUND_FREQUENCY, performanceFee)

                /*ANN RECENT PROFIT*/
                recentAnnProfit = await methods.call(farmContract.methods.pendingAnnex, [pool._pid, account])
                recentAnnProfit = recentAnnProfit ? recentAnnProfit / Math.pow(10, decimal) : 0
                recentAnnProfit = recentAnnProfit.toFixed(5);
            }
            else {
                pendingAnnex = await methods.call(contract.methods.pendingAnnex, [pool._pid, account]);
                pendingAnnex = pendingAnnex / Math.pow(10, decimal)
                pendingAnnexWithoutDecimal = await methods.call(contract.methods.pendingAnnex, [pool._pid, account]);
                if (Number(allowance) > 0) {
                    userInfo = await methods.call(contract.methods.userInfo, [pool._pid, account]);
                    if (userInfo.amount > 0) {
                        isUserInfo = true
                        stacked = (userInfo.amount / Math.pow(10, decimal))
                    }
                }
            }


            return {
                ...pool,
                allowance: Number(allowance),
                decimal: Number(decimal),
                tokenBalance: balanceOf,
                stacked,
                withdrawFee,
                withdrawFeePeriod,
                isUserInfo,
                userInfo,
                pendingAnnex,
                apyValue,
                recentAnnProfit,
                pendingAnnexWithoutDecimal
            }
        })
        const resolvedArray = await Promise.all(poolMapped);
        if (onlyStaked) {
            const filteredPool = resolvedArray.filter(pool => (pool.userInfo.shares && pool.userInfo.shares > 0)
                || (pool.userInfo.amount && pool.userInfo.amount > 0))
            sortPoolData(poolState, filteredPool)
        }
        else {
            sortPoolData(poolState, resolvedArray)
        }
        setPoolLoading(false)
    }, [poolData, account, onlyStaked, poolState])

    const sortPoolData = (poolState, sortedData) => {
        if (poolState === 'live') {
            setPoolData(sortedData.filter(pool => !pool.isFinished))
        }
        else {
            setPoolData(sortedData.filter(pool => pool.isFinished))
        }
    }

    const handleEnable = (item) => {
        setSelectedPool(item)
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
            .then((response) => {
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log(error);
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

        const poolElement = poolData.map(pool => {
            if (pool.id === elem.id && pool.id !== 2) {
                return {
                    ...pool,
                    isOpen: open,
                    totalStacked,
                    performanceFee: performanceFee
                }
            }
            else if (pool.id === elem.id) {
                return {
                    ...pool,
                    isOpen: open,
                }
            }
            else {
                return {
                    ...pool,
                }
            }
        })
        setPoolData(poolElement)
    }

    const addToken = async (token) => {
        const tokenAddress = token.token_address;
        const tokenSymbol = token.symbol;
        const tokenDecimals = token.decimal;
        const tokenImage = token.logo;
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
        setSelectedPool(item)
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
            let returnedValue;
            const contract = new instance.eth.Contract(
                JSON.parse(selectedPool.contract_Abi),
                selectedPool.contract_Address,
            );
            const methodName = buttonValue === 'minus' || buttonValue === 'harvest' ? contract.methods.withdraw : contract.methods.deposit
            setLoading(true);
            let contractArray
            if (selectedPool.id === 2) {
                if (buttonValue === 'harvest' || buttonValue === 'compound') {
                    contractArray = [selectedPool._pid, amount]
                }
                else {
                    contractArray = [selectedPool._pid, amount * Math.pow(10, selectedPool.decimal)]
                }
            }
            else {
                returnedValue = convertExponentToNum(amount * Math.pow(10, selectedPool.decimal))
                contractArray = [returnedValue.toString()]
            }
            console.log('contractArray', returnedValue)
            methods
                .send(
                    methodName,
                    contractArray,
                    account,
                )
                .then((response) => {
                    setLoading(false);
                    setStakeModal(false)
                    setCollectModal(false)
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

    const convertExponentToNum = (x) => {
        if (Math.abs(x) < 1.0) {
            let e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + new Array(e).join('0') + x.toString().substring(2);
            }
        } else {
            let e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }
        return x;
    };

    const handleToken = () => {
        console.log('Get token called')
    }

    return (
        <Styles>
            <Fragment>
                {/* <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 "> */}
                {
                    poolLoading ? (
                        <div className="flex justify-center">
                            <Loader size="160px" className="m-40" stroke="#ff9800" />
                        </div>
                    ) : poolData.length === 0 ?

                        <div className="text-white text-base p-20 flex justify-center col-span-12">
                            <span className="text-center text-grey text-2xl md:text-3xl 
                      text-border title-text">No pools</span>
                        </div> : (
                            <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 ">
                                {poolData.length && poolData.map(item => {
                                    if (item.auto_staking) {
                                        return (
                                            <AutoCard item={item} openModal={openModal} handleEnable={handleEnable}
                                                openDetails={openDetails} addToken={addToken}
                                                annPrice={annPrice}
                                                selectedId={selectedPool.id}
                                                loading={loading}
                                                chainId={chainId}
                                            />
                                        )
                                    }
                                    else {
                                        return (
                                            <ManualCard item={item} openModal={openModal} handleEnable={handleEnable}
                                                openDetails={openDetails} addToken={addToken}
                                                annPrice={annPrice}
                                                selectedId={selectedPool.id}
                                                loading={loading}
                                                chainId={chainId}
                                            />
                                        )
                                    }
                                })}
                            </div>
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
                            {finished ? <div className="finished-label bgPrimaryGradient text-xl font-bold 
                            px-10 py-2 text-center">Finished</div> : ''}

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
                                <div onClick={() => setShowDetails(s => !s)} className="text-primary text-sm 
                                flex items-center cursor-pointer" >Details
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
                {/* </div> */}

                {
                    <StakeModal
                        openModal={stakeModal}
                        data={selectedPool}
                        onSetOpen={() => setStakeModal(true)}
                        onCloseModal={() => closeModal()}
                        handleSubmit={handleConfirm}
                        getToken={handleToken}
                        annPrice={annPrice}
                        modalError={modalError}
                        buttonText={buttonName}
                        loading={loading}
                    />
                }

                {
                    <CollectModal
                        openModal={collectModal}
                        data={selectedPool}
                        onSetOpen={() => setCollectModal(true)}
                        onCloseModal={() => closeModal()}
                        handleSubmit={handleConfirm}
                        getToken={handleToken}
                        buttonText={buttonName}
                        loading={loading}
                        annPrice={annPrice}
                    />
                }
            </Fragment>
        </Styles>
    );
}
export default Grid
