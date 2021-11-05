import React, { useEffect, useState, useCallback, Fragment } from 'react';
import styled from 'styled-components';
import {
    CONTRACT_TOKEN_ADDRESS, CONTRACT_ABEP_ABI, CONTRACT_ANN_Vault,
    CONTRACT_Annex_Farm, REACT_APP_ANN_Vault_ADDRESS, REACT_APP_ANNEX_FARM_ADDRESS
} from '../../utilities/constants';
import { useActiveWeb3React } from '../../hooks';
import { getTokenContract, methods } from '../../utilities/ContractService';
import Web3 from 'web3';
const instance = new Web3(window.ethereum);
import StakeModal from './StakeModel'
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
    //     isFinished: false,
    //     isOpen: false
    // },
]

const Styles = styled.div`
    .tooltip-label {
      text-decoration-line: underline;
      text-decoration-style: dotted;
      text-underline-offset: 5px;
    }
  }
 `

function Grid({ settings, onlyStaked, poolState }) {
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
    const { account } = useActiveWeb3React();

    useEffect(async () => {
        fetchPoolData(database.filter(pool => !pool.isFinished))
    }, [loading]);

    const fetchPoolData = useCallback(async (poolData) => {
        const poolMapped = poolData.map(async (pool) => {
            const tokenContract = getTokenContract(pool.name);
            let allowance = await methods.call(tokenContract.methods.allowance, [
                account,
                pool.contract_Address,
            ])

            let balanceOf = await methods.call(tokenContract.methods.balanceOf, [account]);
            const decimal = await methods.call(tokenContract.methods.decimals, []);
            balanceOf = balanceOf / Math.pow(10, decimal)
            let withdrawFee = 0, withdrawFeePeriod = 0, isUserInfo = 0, userInfo, stacked, pendingAnnex, pendingAnnexWithoutDecimal
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
                    isUserInfo = await methods.call(contract.methods.userInfo, [account]);
                    if (isUserInfo.shares > 0) {
                        userInfo = true
                        stacked = isUserInfo.shares / Math.pow(10, decimal)
                    }
                }
            }
            else {
                pendingAnnex = await methods.call(contract.methods.pendingAnnex, [pool._pid, account]);
                pendingAnnex = pendingAnnex / Math.pow(10, decimal)
                pendingAnnexWithoutDecimal = await methods.call(contract.methods.pendingAnnex, [pool._pid, account]);
                if (Number(allowance) > 0) {
                    isUserInfo = await methods.call(contract.methods.userInfo, [pool._pid, account]);
                    if (isUserInfo.amount > 0) {
                        userInfo = true
                        stacked = isUserInfo.amount / Math.pow(10, decimal)
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
                userInfo,
                isUserInfo,
                pendingAnnex,
                pendingAnnexWithoutDecimal
            }
        })
        const resolvedArray = await Promise.all(poolMapped);
        setPoolData(resolvedArray)
        setPoolLoading(false)
    }, [poolData])

    useEffect(() => {
        if (onlyStaked) {
            const filteredPool = poolData.filter(pool => (pool.isUserInfo.shares && pool.isUserInfo.shares > 0)
                || (pool.isUserInfo.amount && pool.isUserInfo.amount > 0))
            fetchPoolData(filteredPool)
        }
        else {
            if (poolState === 'live') {
                fetchPoolData(database.filter(pool => !pool.isFinished))
            }
            else {
                fetchPoolData(database.filter(pool => pool.isFinished))
            }
        }
    }, [onlyStaked])

    useEffect(() => {
        if (poolState === 'live') {
            const filteredPool = database.filter(pool => !pool.isFinished)
            fetchPoolData(filteredPool)
        }
        else {
            const filteredPool = database.filter(pool => pool.isFinished)
            fetchPoolData(filteredPool)
        }
    }, [poolState])

    console.log('database', poolData)

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
                contractArray = [amount * Math.pow(10, selectedPool.decimal)]
            }
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

    const handleToken = () => {
        console.log('Get token called')
    }

    return (
        <Styles>
            <Fragment>
                <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-5 md:gap-y-7 md:grid-cols-12 md:gap-x-5 ">
                    {
                        poolLoading ? (
                            <Loader size="160px" className="m-40" stroke="#ff9800" />
                        ) : poolData.length === 0 ?
                            <div className="text-white text-base p-20 flex justify-center col-span-12">
                                <span className="text-center text-grey text-2xl md:text-3xl 
              text-border title-text">No pools</span>
                            </div> : (
                                poolData.length && poolData.map(item => {
                                    if (item.auto_staking) {
                                        return (
                                            <AutoCard item={item} openModal={openModal} handleEnable={handleEnable}
                                                openDetails={openDetails} addToken={addToken}
                                                annPrice={settings.annPrice}
                                                selectedId={selectedPool.id}
                                                loading={loading}
                                            />
                                        )
                                    }
                                    else {
                                        return (
                                            <ManualCard item={item} openModal={openModal} handleEnable={handleEnable}
                                                openDetails={openDetails} addToken={addToken}
                                                annPrice={settings.annPrice}
                                                selectedId={selectedPool.id}
                                                loading={loading} />
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
                </div>

                {
                    <StakeModal
                        openModal={stakeModal}
                        data={selectedPool}
                        onSetOpen={() => setStakeModal(true)}
                        onCloseModal={() => closeModal()}
                        handleSubmit={handleConfirm}
                        getToken={handleToken}
                        annPrice={settings.annPrice}
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
