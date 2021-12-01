import React, {useEffect, useState} from "react";
import { getComptrollerContract, methods } from "../../utilities/ContractService";
import { compose } from "redux";
import { connectAccount } from "../../core";
import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from "../../hooks";
import commaNumber from "comma-number";
import DelegationTypeModal from "./Modals/DelegationTypeModal";
import { getBigNumber } from '../../utilities/common';

const format = commaNumber.bindWith(',', '.');

const VotingWallet = ({
    balance,
    settings,
    earnedBalance,
    // xaiMint,
    delegateAddress,
    delegateStatus,
    loading,
    votingWeight
}) => {
    const { chainId, account } = useActiveWeb3React();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEarn, setIsLoadingEarn] = useState(false);

    const tempArr = [];
    settings.assetList.forEach((item) => {
        const temp = {
            ...item,
            supplyApy: getBigNumber(item.supplyApy),
            borrowApy: getBigNumber(item.borrowApy),
            walletBalance: getBigNumber(item.walletBalance),
            supplyBalance: getBigNumber(item.supplyBalance),
            aTokenBalance: getBigNumber(item.aTokenBalance),
            borrowBalance: getBigNumber(item.borrowBalance),
            collateralFactor: getBigNumber(item.collateralFactor),
            tokenPrice: getBigNumber(item.tokenPrice),
            liquidity: getBigNumber(item.liquidity),
        };
        tempArr.push(temp);
    });

    const marketAddresses = [];
    tempArr.forEach((element) => {
        if (!element.supplyBalance.isZero()) {
            marketAddresses.push(element.atokenAddress);
        }

        if (!element.borrowBalance.isZero()) {
            marketAddresses.push(element.atokenAddress);
        }
    });
    const atokenAddresses = [...new Set(marketAddresses)]

    useEffect(() => {
        if (!earnedBalance) {
            setIsLoadingEarn(true);
            return;
        }
        setIsLoadingEarn(false);
    }, [earnedBalance]);

    const getBefore = value => {
        const position = value.indexOf('.');
        return position !== -1 ? value.slice(0, position + 5) : value;
    };

    const getAfter = value => {
        const position = value.indexOf('.');
        return position !== -1 ? value.slice(position + 5) : null;
    };

    const handleCollect = () => {
        if (+earnedBalance !== 0) {
            setIsLoading(true);
            const appContract = getComptrollerContract(chainId);
            methods
                .send(
                    appContract.methods.claimAnnex,
                    [account],
                    account
                )
                .then(() => {
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    };


    return (
        <div className="col-span-3 bg-fadeBlack p-1 rounded-3xl">
            <div className="text-white text-xl font-bold p-5 pt-6">Voting Wallet</div>
            <div className="border-t border-solid border-lightGray p-6">
                <div className="text-gray text-xl">ANN Balance</div>
                <div className="text-red text-xl">{
                    loading ? (
                        <div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>
                    ) : (
                        <>
                            {getBefore(format(balance))}
                            <span>{getAfter(format(balance))}</span>
                        </>
                    )
                }</div>
            </div>
            <div className="border-t border-solid border-lightGray p-6">
                <div className="flex align-center just-between">
                    <div className="align-center">
                        <div className="text-gray text-xl">ANN Earned</div>
                        <div className="text-red text-xl">{
                            loading ? (
                                <div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>
                            ) : (
                                <>
                                    {getBefore(format(earnedBalance))}
                                    <span>{getAfter(format(earnedBalance))}</span>
                                </>
                            )
                        }</div>
                    </div>
                    <div className="align-center">
                        <button
                            className="focus:outline-none bg-primary text-black py-3 px-6 rounded-lg text-sm mr-6"
                            onClick={handleCollect}
                        >Claim ANN</button>
                    </div>
                </div>
            </div>
            <div className="border-t border-solid border-lightGray p-6">
                <div className="text-gray text-xl">Voting Weight</div>
                <div className="text-red text-xl">{
                    loading ? (
                        <div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>
                    ) : (
                        <>
                            {getBefore(format(votingWeight))}
                            <span>{getAfter(format(votingWeight))}</span>
                        </>
                    )
                }</div>
            </div>
            {delegateStatus && (
                <div className="border-t border-solid border-lightGray p-6">
                    <div className="text-gray text-xl">Delegating To</div>
                    <div className="text-white text-xl flex flex-row items-center justify-between">{
                        loading ? (
                            <div className="animate-pulse w-36 h-6 bg-lightGray rounded-lg inline-block"/>
                        ) : (
                            <>
                                <a
                                    className="text-white no-underline focus:outline-none"
                                    href={getEtherscanLink(chainId, delegateAddress, 'address')}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {delegateStatus === 'self'
                                        ? 'Self'
                                        : `${delegateAddress.substr(
                                            0,
                                            4
                                        )}...${delegateAddress.substr(
                                            delegateAddress.length - 4,
                                            4
                                        )}`}
                                </a>
                                <button
                                    className="focus:outline-none bg-primary text-black py-3 px-10 rounded text-sm"
                                    onClick={() => setIsOpenModal(true)}
                                >
                                    Change
                                </button>
                            </>
                        )
                    }</div>
                </div>
            )}
            {account && !delegateStatus && (
                <div className="border-t border-solid border-lightGray p-6">
                    <div className="text-white text-2xl font-bold mt-3">Setup Voting</div>
                    <div className="text-white text-base mt-4">
                        You can either vote on each proposal yourself or delegate your votes to a third party.
                        Annex Governance puts you in charge of the future of Annex.
                    </div>
                    <div className="flex justify-center mt-8">
                        <button
                            className="focus:outline-none bg-primary text-black py-3 px-24 rounded text-xl"
                            onClick={() => setIsOpenModal(true)}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}

            <DelegationTypeModal
                visible={isOpenModal}
                balance={balance}
                delegateStatus={delegateStatus}
                address={account ? account : ''}
                onCancel={() => setIsOpenModal(false)}
            />
        </div>
    )
}

const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

export default compose(connectAccount(mapStateToProps, undefined))(
    VotingWallet
);

// @todo: connect delegate modal
