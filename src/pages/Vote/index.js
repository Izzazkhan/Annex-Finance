import React, {useCallback, useEffect, useState} from 'react';
import {promisify} from "../../utilities";
import {checkIsValidNetwork} from "../../utilities/common";
import {
    getAbepContract,
    getComptrollerContract,
    getTokenContract,
    getXaiControllerContract,
    methods
} from "../../utilities/ContractService";
import BigNumber from "bignumber.js";
import {withRouter} from "react-router-dom";
import {bindActionCreators, compose} from "redux";
import {accountActionCreators, connectAccount} from "../../core";
import {useActiveWeb3React} from "../../hooks";
import Layout from "../../layouts/MainLayout/MainLayout";
import * as constants from '../../utilities/constants';
import VotingWallet from "../../components/vote/VotingWallet";
import Proposals from "../../components/vote/Proposals";

let timeStamp = 0;

const Vote = ({ settings, getProposals, setSetting }) => {
    const { account } = useActiveWeb3React();
    const [balance, setBalance] = useState(0);
    const [votingWeight, setVotingWeight] = useState(0);
    const [proposals, setProposals] = useState({});
    const [current, setCurrent] = useState(1);
    const [isLoadingProposal, setIsLoadingProposal] = useState(false);
    const [earnedBalance, setEarnedBalance] = useState('0.00000000');
    const [xaiMint, setXaiMint] = useState('0.00000000');
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
            const annTokenContract = getTokenContract('ann');
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
        const appContract = getComptrollerContract();
        const xaiContract = getXaiControllerContract();
        const annexInitialIndex = await methods.call(
            appContract.methods.annexInitialIndex,
            []
        );
        let annexEarned = new BigNumber(0);
        for (
            let index = 0;
            index < Object.values(constants.CONTRACT_ABEP_ADDRESS).length;
            index += 1
        ) {
            const item = Object.values(constants.CONTRACT_ABEP_ADDRESS)[index];

            const aBepContract = getAbepContract(item.id);
            const supplyState = await methods.call(
                appContract.methods.annexSupplyState,
                [item.address]
            );
            const supplyIndex = supplyState.index;
            let supplierIndex = await methods.call(
                appContract.methods.annexSupplierIndex,
                [item.address, myAddress]
            );
            if (+supplierIndex === 0 && +supplyIndex > 0) {
                supplierIndex = annexInitialIndex;
            }
            let deltaIndex = new BigNumber(supplyIndex).minus(supplierIndex);

            const supplierTokens = await methods.call(
                aBepContract.methods.balanceOf,
                [myAddress]
            );
            const supplierDelta = new BigNumber(supplierTokens)
                .multipliedBy(deltaIndex)
                .dividedBy(1e36);

            annexEarned = annexEarned.plus(supplierDelta);

            const borrowState = await methods.call(
                appContract.methods.annexBorrowState,
                [item.address]
            );
            let borrowIndex = borrowState.index;
            const borrowerIndex = await methods.call(
                appContract.methods.annexBorrowerIndex,
                [item.address, myAddress]
            );
            if (+borrowerIndex > 0) {
                deltaIndex = new BigNumber(borrowIndex).minus(borrowerIndex);
                const borrowBalanceStored = await methods.call(
                    aBepContract.methods.borrowBalanceStored,
                    [myAddress]
                );
                borrowIndex = await methods.call(aBepContract.methods.borrowIndex, []);
                const borrowerAmount = new BigNumber(borrowBalanceStored)
                    .multipliedBy(1e18)
                    .dividedBy(borrowIndex);
                const borrowerDelta = borrowerAmount.times(deltaIndex).dividedBy(1e36);
                annexEarned = annexEarned.plus(borrowerDelta);
            }
        }

        const annexAccrued = await methods.call(appContract.methods.annexAccrued, [
            myAddress
        ]);
        annexEarned = annexEarned
            .plus(annexAccrued)
            .dividedBy(1e18)
            .dp(8, 1)
            .toString(10);

        const annexXAIState = await methods.call(
            xaiContract.methods.annexXAIState,
            []
        );
        const xaiMintIndex = annexXAIState.index;
        let xaiMinterIndex = await methods.call(
            xaiContract.methods.annexXAIMinterIndex,
            [myAddress]
        );
        if (+xaiMinterIndex === 0 && +xaiMintIndex > 0) {
            xaiMinterIndex = annexInitialIndex;
        }
        const deltaIndex = new BigNumber(xaiMintIndex).minus(
            new BigNumber(xaiMinterIndex)
        );
        const xaiMinterAmount = await methods.call(appContract.methods.mintedXAIs, [
            myAddress
        ]);
        const xaiMinterDelta = new BigNumber(xaiMinterAmount)
            .times(deltaIndex)
            .div(1e54)
            .dp(8, 1)
            .toString(10);
        setEarnedBalance(
            annexEarned && annexEarned !== '0' ? `${annexEarned}` : '0.00000000'
        );
        setXaiMint(
            xaiMinterDelta && xaiMinterDelta !== '0'
                ? `${xaiMinterDelta}`
                : '0.00000000'
        );
    };

    const updateDelegate = async () => {
        if (account && timeStamp % 3 === 0) {
            const tokenContract = getTokenContract('ann');
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

    return (
        <Layout title={'Vote'}>
            <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-8 lg:gap-x-6 mt-8">
                <VotingWallet
                    balance={balance !== '0' ? `${balance}` : '0.00000000'}
                    earnedBalance={earnedBalance}
                    xaiMint={xaiMint}
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
