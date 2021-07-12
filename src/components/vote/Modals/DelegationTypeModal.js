import {useState} from "react";

import {getTokenContract, methods} from "../../../utilities/ContractService";
import Modal from "../../UI/Modal";

import bigArrowPrimary from '../../../assets/icons/bigArrowPrimary.svg';
import tickGreen from '../../../assets/icons/tickGreen.svg';
import transactionBroadcast from '../../../assets/icons/transactionBroadcast.svg';
import closeWhite from '../../../assets/icons/closeWhite.svg';
import bigArrow from '../../../assets/icons/bigArrow.svg';
import DelegationVoting from "./DelegationVoting";

const DelegationTypeModal = ({
    visible,
    balance,
    delegateStatus,
    address,
    onCancel
}) => {
    const [child, setChild] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [txnHash, setTxnHash] = useState('');

    const handleVoting = dAddress => {
        setIsLoading(true);
        const tokenContract = getTokenContract('ann');
        methods
            .send(tokenContract.methods.delegate, [dAddress || address], address)
            .then((res) => {
                setTxnHash(res.transactionHash);
                setIsLoading(false);
                onCancel();
            })
            .catch(() => {
                setIsLoading(false);
            });
    };


    const getBefore = value => {
        const position = value.indexOf('.');
        return position !== -1 ? value.slice(0, position + 5) : value;
    };

    const getAfter = value => {
        const position = value.indexOf('.');
        return position !== -1 ? value.slice(position + 5) : null;
    };


    let title = (
        <div className="text-center text-36 font-bold mt-10">Choose Delegation Type</div>
    );

    let content = (
        <div className="pt-6 pb-8 mx-4 sm:mx-12 overflow-auto">
            <div className="flex flex-col space-y-8">
                <div
                    className="cursor-pointer py-6"
                    onClick={e => {
                        if (delegateStatus === 'self') {
                            e.preventDefault();
                            return;
                        }
                        setChild('manual');
                        setTxnHash('');
                        handleVoting('');
                    }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-5">
                            <img className="w-8" src={tickGreen} alt="tick" />
                            <div className="text-white text-xl">Manual Voting</div>
                        </div>
                        {delegateStatus !== 'self' ? (
                            <button className="mt-2 focus:outline-none">
                                <img className="" src={bigArrowPrimary} alt="arrow" />
                            </button>
                        ) : (
                            <span className="text-green text-sm font-medium">Active</span>
                        )}
                    </div>
                    <div className="text-white text-xl mt-4">
                        This option allows you to vote on proposals directly from your connected wallet.
                    </div>
                </div>
                <div
                    className="cursor-pointer py-6"
                    onClick={() => {
                        setChild('delegate');
                        setTxnHash('');
                    }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-5">
                            <img className="w-8" src={tickGreen} alt="tick" />
                            <div className="text-white text-xl">Delegate Voting</div>
                        </div>
                        {delegateStatus !== 'delegate' ? (
                            <button className="mt-2 focus:outline-none">
                                <img className="" src={bigArrowPrimary} alt="arrow" />
                            </button>
                        ) : (
                            <span className="text-green text-sm font-medium">Active</span>
                        )}
                    </div>
                    <div className="text-white text-xl mt-4">
                        This option allows you to delegate your votes to another Ethereum address.
                        You never send Venus, only your voting rights, and can undelegate at any time.
                    </div>
                </div>
            </div>
        </div>
    )



    if(child === 'manual') {
        title = (
            <div
                className="flex justify-between items-center mt-4 mx-4 sm:mx-12 py-6
                  border-b border-solid border-lightGray"
            >
                <div className="cursor-pointer" onClick={() => {
                    setChild('')
                    setTxnHash('');
                }}>
                    <img className="transform rotate-180 w-6" src={bigArrow} alt="" />
                </div>
                <div className="text-center text-36 font-bold">Transaction Pending</div>
                <div className="cursor-pointer" onClick={onCancel}>
                    <img src={closeWhite} alt="" />
                </div>
            </div>
        )

        content = (
            <div className="p-6">
                <div className="text-xl font-bold text-center">
                    {getBefore(balance)}
                    <span>{getAfter(balance)}</span>{' '}
                    Votes
                </div>
                <div className="text-lg text-center mt-6">
                    Manual Voting From{' '}
                    {`${address.substr(0, 4)}...${address.substr(address.length - 4, 4)}`}
                </div>
                <div className="flex flex-col items-center mt-5">
                    <img className="w-150px animate-spin" src={transactionBroadcast} alt="transaction broadcast" />
                    <div className="text-xl mt-9">Transaction Broadcast.</div>
                </div>
                <div className="flex justify-center mt-10">
                    <button
                        disabled={!txnHash}
                        className="focus:outline-none bg-primary py-2 px-14 mb-2 rounded-md text-xl text-black"
                        onClick={() => {
                            window.open(
                                `${process.env.REACT_APP_BSC_EXPLORER}/tx/${address}`,
                                '_blank'
                            );
                        }}
                    >
                        View on BscScan
                    </button>
                </div>
            </div>
        )
    } else if(child === 'delegate') {
        title = (
            <div
                className="flex justify-between items-center mt-4 mx-4 sm:mx-12 py-6
                  border-b border-solid border-lightGray"
            >
                <div className="cursor-pointer" onClick={() => {
                    setChild('')
                    setTxnHash('');
                }}>
                    <img className="transform rotate-180 w-6" src={bigArrow} alt="" />
                </div>
                <div className="text-center text-36 font-bold">Delegate Voting</div>
                <div className="cursor-pointer" onClick={onCancel}>
                    <img src={closeWhite} alt="" />
                </div>
            </div>
        )

        content = (
            <DelegationVoting
                isLoading={isLoading}
                onDelegate={handleVoting}
            />
        )
    }

    return (
        <div>
            <Modal
                title={title}
                content={content}
                open={visible}
                onCloseModal={onCancel}
                afterCloseModal={() => {
                    setChild('')
                    setTxnHash('');
                }}
            />
        </div>
    )
}

DelegationTypeModal.defaultProps = {
    address: '',
    balance: '0',
    visible: false,
    delegateStatus: '',
    onCancel: () => {}
};

export default DelegationTypeModal;
