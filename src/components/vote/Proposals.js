import {useActiveWeb3React} from "../../hooks";
import {compose} from "redux";
import {connectAccount} from "../../core";
import {useEffect, useState} from "react";
import {getTokenContract, getVoteContract, methods} from "../../utilities/ContractService";
import Web3 from "web3";
import toast from "../UI/Toast";
import RouteMap from "../../routes/RouteMap";
import Loading from "../UI/Loading";
import Proposal from "./Proposal";
import {useHistory} from "react-router-dom";
import {buttons} from "polished";
import ProposalModal from "./Modals/ProposalModal";

const Proposals = ({
    isLoadingProposal,
    settings,
    votingWeight,
    pageNumber,
    proposals,
    total,
    onChangePage
}) => {
    const { account: address } = useActiveWeb3React();
    const [proposalModal, setProposalModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [proposalThreshold, setProposalThreshold] = useState(0);
    const [maxOperation, setMaxOperation] = useState(0);
    const [delegateAddress, setDelegateAddress] = useState('');
    const history = useHistory();


    useEffect(() => {
        if (address) {
            const voteContract = getVoteContract();
            methods.call(voteContract.methods.proposalThreshold, []).then(res => {
                setProposalThreshold(+Web3.utils.fromWei(res, 'ether'));
            });
            methods.call(voteContract.methods.proposalMaxOperations, []).then(res => {
                setMaxOperation(res);
            });
        }
    }, [address]);

    useEffect(() => {
        if (
            address &&
            (delegateAddress === '' ||
                delegateAddress === '0x0000000000000000000000000000000000000000')
        ) {
            const tokenContract = getTokenContract('ann');
            methods
                .call(tokenContract.methods.delegates, [address])
                .then(res => {
                    setDelegateAddress(res);
                })
                .catch(() => {});
        }
    }, [address, address, delegateAddress]);

    const handleShowProposalModal = () => {
        if (+votingWeight < +proposalThreshold) {
            toast.error({
                title: `You can't create proposal. Your voting power should be ${proposalThreshold} ANN at least`
            });
            return;
        }
        const voteContract = getVoteContract();
        setIsLoading(true);
        methods
            .call(voteContract.methods.latestProposalIds, [address])
            .then(pId => {
                if (pId !== '0') {
                    methods.call(voteContract.methods.state, [pId]).then(status => {
                        if (status === '0' || status === '1') {
                            toast.error({
                                title: `You can't create proposal. there is proposal in progress!`
                            });
                        } else {
                            setProposalModal(true);
                        }
                        setIsLoading(false);
                    });
                } else {
                    setProposalModal(true);
                    setIsLoading(false);
                }
            });
    };

    return (
        <div className="col-span-5 bg-fadeBlack p-1 rounded-3xl flex flex-col items-stretch">
            <div className="flex items-center justify-between">

                <div className="text-white text-xl font-bold p-6">Active Proposals</div>
                {address && (
                    <button
                        className="focus:outline-none bg-primary text-black py-3 px-6 rounded-lg text-sm mr-6"
                        onClick={handleShowProposalModal}
                    >
                        Create Proposal
                    </button>
                )}
            </div>
            <div className="flex flex-col items-stretch flex-grow">
                {isLoadingProposal && (
                    <div className="flex items-center justify-center py-16 flex-grow">
                        <Loading size={'36px'} margin={'0'} className={'text-primaryLight'} />
                    </div>
                )}
                {!isLoadingProposal && (
                    <>
                        {proposals &&  proposals.length !== 0 ? (
                            proposals.map(item => {
                                return (
                                    <Proposal
                                        proposal={item}
                                        votingWeight={votingWeight}
                                        delegateAddress={delegateAddress}
                                        address={address}
                                        key={item.id}
                                    />
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-16 flex-grow">
                                <span className="text-white font-medium">No Proposals</span>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="border-t border-solid border-lightGray p-6 mt-9">
                <div className="flex justify-center mt-4">
                    <button
                        className="focus:outline-none bg-primary text-black py-3 px-22 rounded text-xl"
                        onClick={() => history.push(RouteMap.vote.allProposals)}
                    >
                        All Proposals
                    </button>
                </div>
            </div>

            <ProposalModal
                address={address}
                visible={proposalModal}
                maxOperation={maxOperation}
                onCancel={() => setProposalModal(false)}
            />
        </div>
    )

}


const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

export default compose(connectAccount(mapStateToProps, undefined))(Proposals);

