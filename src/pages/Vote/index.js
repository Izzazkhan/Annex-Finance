import React, { useCallback, useEffect, useState } from 'react';
import { promisify } from "../../utilities";
import { checkIsValidNetwork } from "../../utilities/common";
import {
    getAbepContract,
    getComptrollerContract,
    getTokenContract,
    // getXaiControllerContract,
    methods
} from "../../utilities/ContractService";
import BigNumber from "bignumber.js";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { accountActionCreators, connectAccount } from "../../core";
import { useActiveWeb3React } from "../../hooks";
import Layout from "../../layouts/MainLayout/MainLayout";
import * as constants from '../../utilities/constants';
import VotingWallet from "../../components/vote/VotingWallet";
import Proposals from "../../components/vote/Proposals";
import CommingSoon from 'pages/CommingSoon';

let timeStamp = 0;

const Vote = ({ settings, getProposals, setSetting }) => {
    const { account, chainId } = useActiveWeb3React();
    const [balance, setBalance] = useState(0);
    const [votingWeight, setVotingWeight] = useState(0);
    const [proposals, setProposals] = useState({});
    const [current, setCurrent] = useState(1);
    const [isLoadingProposal, setIsLoadingProposal] = useState(false);
    const [earnedBalance, setEarnedBalance] = useState('0.00000000');
    // const [xaiMint, setXaiMint] = useState('0.00000000');
    const [delegateAddress, setDelegateAddress] = useState('');
    const [delegateStatus, setDelegateStatus] = useState('');

    const loadInitialData = useCallback(async () => {
        setIsLoadingProposal(true);
        await promisify(getProposals, {
            offset: 0,
            limit: 3
        })
            .then(res => {
                setIsLoadingProposal(false);
                setProposals(res.data);
            })
            .catch(() => {
                setIsLoadingProposal(false);
            });
    }, [getProposals]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleChangePage = (pageNumber, offset, limit) => {
        setCurrent(pageNumber);
        setIsLoadingProposal(true);
        promisify(getProposals, {
            offset,
            limit
        })
            .then(res => {
                setProposals(res.data);
                setIsLoadingProposal(false);
            })
            .catch(() => {
                setIsLoadingProposal(false);
            });
    };

    const updateBalance = async () => {
        if (account && checkIsValidNetwork()) {
            const annTokenContract = getTokenContract('ann', chainId);
            await methods
                .call(annTokenContract.methods.getCurrentVotes, [
                    account
                ])
                .then(res => {
                    const weight = new BigNumber(res)
                        .div(new BigNumber(10).pow(18))
                        .toString(10);
                    setVotingWeight(weight);
                });
            let temp = await methods.call(annTokenContract.methods.balanceOf, [
                account
            ]);
            temp = new BigNumber(temp)
                .dividedBy(new BigNumber(10).pow(18))
                .dp(4, 1)
                .toString(10);
            setBalance(temp);
        }
    };

    const getVoteInfo = async () => {
        const myAddress = account;
        if (!myAddress) return;
        const appContract = getComptrollerContract(chainId);
        // const xaiContract = getXaiControllerContract();
        const annexInitialIndex = await methods.call(
            appContract.methods.annexInitialIndex,
            []
        );
        let annexEarned = new BigNumber(0);

        let promiseAssetCall = null;
        let assetValues =  [];
        try {
            promiseAssetCall = settings.assetList.map(asset => {
                const aBepContract = getAbepContract(asset.id, chainId);
        
                return Promise.all([
                    methods.call(appContract.methods.annexSupplyState, [
                        asset.atokenAddress,
                    ]),
                    methods.call(appContract.methods.annexSupplierIndex, [
                        asset.atokenAddress,
                        myAddress,
                    ]),
                    methods.call(aBepContract.methods.balanceOf, [myAddress]),
                    methods.call(appContract.methods.annexBorrowState, [
                        asset.atokenAddress,
                    ]),
                    methods.call(appContract.methods.annexBorrowerIndex, [
                        asset.atokenAddress,
                        myAddress,
                    ]),
                    methods.call(aBepContract.methods.borrowBalanceStored, [
                        myAddress,
                    ]),
                    methods.call(aBepContract.methods.borrowIndex, [])
                ])
            });
            assetValues = await Promise.all(promiseAssetCall);
        } catch (err) {
            console.log(err)
        }
        assetValues.forEach(([
            supplyState,
            supplierIndex,
            supplierTokens,
            borrowState,
            borrowerIndex,
            borrowBalanceStored,
            borrowIndex]) => {
            const supplyIndex = supplyState.index;
            if (+supplierIndex === 0 && +supplyIndex > 0) {
                supplierIndex = annexInitialIndex;
            }
            let deltaIndex = new BigNumber(supplyIndex).minus(supplierIndex);
            const supplierDelta = new BigNumber(supplierTokens)
                .multipliedBy(deltaIndex)
                .dividedBy(1e36);
      
            annexEarned = annexEarned.plus(supplierDelta);
            let initBorrowIndex = borrowState.index;
            if (+borrowerIndex > 0) {
                deltaIndex = new BigNumber(initBorrowIndex).minus(borrowerIndex);
                const borrowerAmount = new BigNumber(borrowBalanceStored)
                    .multipliedBy(1e18)
                    .dividedBy(borrowIndex);
                const borrowerDelta = borrowerAmount.times(deltaIndex).dividedBy(1e36);
                annexEarned = annexEarned.plus(borrowerDelta);
            }
        });

        const annexAccrued = await methods.call(appContract.methods.annexAccrued, [
            myAddress
        ]);
        annexEarned = annexEarned
            .plus(annexAccrued)
            .dividedBy(1e18)
            .dp(8, 1)
            .toString(10);

        // const annexXAIState = await methods.call(
        //     xaiContract.methods.annexXAIState,
        //     []
        // );
        // const xaiMintIndex = annexXAIState.index;
        // let xaiMinterIndex = await methods.call(
        //     xaiContract.methods.annexXAIMinterIndex,
        //     [myAddress]
        // );
        // if (+xaiMinterIndex === 0 && +xaiMintIndex > 0) {
        //     xaiMinterIndex = annexInitialIndex;
        // }
        // const deltaIndex = new BigNumber(xaiMintIndex).minus(
        //     new BigNumber(xaiMinterIndex)
        // );
        // const xaiMinterAmount = await methods.call(appContract.methods.mintedXAIs, [
        //     myAddress
        // ]);
        // const xaiMinterDelta = new BigNumber(xaiMinterAmount)
        //     .times(deltaIndex)
        //     .div(1e54)
        //     .dp(8, 1)
        //     .toString(10);
        setEarnedBalance(
            annexEarned && annexEarned !== '0' ? `${annexEarned}` : '0.00000000'
        );
        // setXaiMint(
        //     xaiMinterDelta && xaiMinterDelta !== '0'
        //         ? `${xaiMinterDelta}`
        //         : '0.00000000'
        // );
    };

    const updateDelegate = async () => {
        if (account && timeStamp % 3 === 0) {
            const tokenContract = getTokenContract('ann', chainId);
            methods
                .call(tokenContract.methods.delegates, [account])
                .then(res => {
                    setDelegateAddress(res);
                    if (res !== '0x0000000000000000000000000000000000000000') {
                        setDelegateStatus(
                            res === account ? 'self' : 'delegate'
                        );
                    } else {
                        setDelegateStatus('');
                    }
                })
                .catch(() => {});
        }
        timeStamp = Date.now();
    };

    useEffect(() => {
        getVoteInfo();
        updateBalance();
        updateDelegate();
    }, [settings.markets]);

    const handleAccountChange = async () => {
        await getVoteInfo();
        await updateBalance();
        setSetting({
            accountLoading: false
        });
    };

    useEffect(() => {
        if (account) {
            handleAccountChange();
        }
    }, [account]);

    if (chainId === 25) {
        return <CommingSoon />
    }

    return (
        <Layout title={'Vote'}>
            <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-8 lg:gap-x-6 mt-8">
                <VotingWallet
                    balance={balance !== '0' ? `${balance}` : '0.00000000'}
                    earnedBalance={earnedBalance}
                    // xaiMint={xaiMint}
                    votingWeight={votingWeight}
                    delegateAddress={delegateAddress}
                    delegateStatus={delegateStatus}
                    loading={!account}
                />
                <Proposals
                    isLoadingProposal={isLoadingProposal}
                    pageNumber={current}
                    proposals={proposals.result}
                    total={proposals.total || 0}
                    votingWeight={votingWeight}
                    onChangePage={handleChangePage}
                />
            </div>
        </Layout>
    )

}

const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

const mapDispatchToProps = dispatch => {
    const { getProposals, setSetting } = accountActionCreators;

    return bindActionCreators(
        {
            getProposals,
            setSetting
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(mapStateToProps, mapDispatchToProps)
)(Vote);
