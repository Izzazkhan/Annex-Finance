import {withRouter} from "react-router-dom";
import {compose} from "redux";
import {useCallback, useEffect, useMemo, useState} from "react";
import ReactMarkdown from 'react-markdown';
import * as moment from "moment";

import {getVoteContract, methods} from "../../utilities/ContractService";
import VoteActionDetails from "./VoteActionDetails";
import BigNumber from "bignumber.js";
import ActionModal from "./Modals/ActionModal";
import toast from "../UI/Toast";
import {useActiveWeb3React} from "../../hooks";
import Loading from "../UI/Loading";

const Proposal = ({
    address,
    delegateAddress,
    proposal,
    votingWeight,
    history
}) => {
    const { account } = useActiveWeb3React();
    const [isLoading, setIsLoading] = useState(false);
    const [voteType, setVoteType] = useState('like');
    const [voteStatus, setVoteStatus] = useState('');
    const [showActionModal, setShowActionModal] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);
    const [status, setStatus] = useState('pending');

    const getStatus = p => {
        if (p.state === 'Executed') {
            return 'Passed';
        }
        if (p.state === 'Active') {
            return 'Active';
        }
        if (p.state === 'Defeated') {
            return 'Failed';
        }
        return p.state;
    };

    const getStatusColor = p => {
        if (p.state === 'Executed') {
            return 'green';
        }
        if (p.state === 'Active') {
            return 'primaryLight';
        }
        if (p.state === 'Defeated') {
            return 'red';
        }
        return 'primary';
    };

    const getRemainTime = item => {
        if (item.state === 'Active') {
            const diffBlock = item.endBlock - item.blockNumber;
            const duration = moment.duration(
                diffBlock < 0 ? 0 : diffBlock * 3,
                'seconds'
            );
            const days = Math.floor(duration.asDays());
            const hours = Math.floor(duration.asHours()) - days * 24;
            const minutes =
                Math.floor(duration.asMinutes()) - days * 24 * 60 - hours * 60;
            return `${
                days > 0 ? `${days} ${days > 1 ? 'days' : 'day'},` : ''
            } ${hours} ${hours > 1 ? 'hrs' : 'hr'} ${
                days === 0 ? `, ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}` : ''
            } left`;
        }
        if (item.state === 'Pending') {
            return `${moment(item.createdTimestamp * 1000).format('MMMM DD, YYYY')}`;
        }
        if (item.state === 'Active') {
            return `${moment(item.startTimestamp * 1000).format('MMMM DD, YYYY')}`;
        }
        if (item.state === 'Canceled' || item.state === 'Defeated') {
            return `${moment(item.endTimestamp * 1000).format('MMMM DD, YYYY')}`;
        }
        if (item.state === 'Queued') {
            return `${moment(item.queuedTimestamp * 1000).format('MMMM DD, YYYY')}`;
        }
        if (item.state === 'Expired' || item.state === 'Executed') {
            return `${moment(item.executedTimestamp * 1000).format('MMMM DD, YYYY')}`;
        }
        return `${moment(item.updatedAt).format('MMMM DD, YYYY')}`;
    };


    const getIsHasVoted = useCallback(async () => {
        const voteContract = getVoteContract();
        await methods
            .call(voteContract.methods.getReceipt, [proposal.id, address])
            .then(res => {
                setVoteStatus(res.hasVoted ? 'voted' : 'novoted');
            });
    }, [address, proposal]);

    useEffect(() => {
        if (address && proposal.id) {
            getIsHasVoted();
        }
    }, [address, proposal, getIsHasVoted]);

    const handleVote = support => {
        setIsLoading(true);
        setVoteType(support);
        const appContract = getVoteContract();
        methods
            .send(
                appContract.methods.castVote,
                [proposal.id, support === 'like'],
                address
            )
            .then(() => {
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    };

    const getTitle = descs => {
        const index = descs.findIndex(d => d !== '');
        if (index !== -1) {
            return descs[index];
        }
        return '';
    };

    const votePercents = useMemo(() => {
        if(!proposal) {
            return {
                forVotes: 0,
                againstVotes: 0,
            }
        }

        const forVotes = new BigNumber(proposal?.forVotes);
        const againstVotes = new BigNumber(proposal?.againstVotes);
        const totalVotes = new BigNumber(proposal?.forVotes).plus(proposal?.againstVotes)

        if(totalVotes?.toNumber() === 0) {
            return {
                forVotes: 0,
                againstVotes: 0,
            }
        }

        return {
            forVotes: forVotes.dividedBy(totalVotes).times(100).toNumber(),
            againstVotes: againstVotes.dividedBy(totalVotes).times(100).toNumber(),
        }

    }, [proposal])


    const handleUpdateProposal = statusType => {
        const appContract = getVoteContract();
        if (statusType === 'Queue') {
            setExecuteLoading(true);
            methods
                .send(
                    appContract.methods.queue,
                    [proposal.id],
                    account
                )
                .then(() => {
                    setExecuteLoading(false);
                    setStatus('success');
                    toast.success({
                        title: `Proposal list will be updated within a few seconds`
                    });
                })
                .catch(() => {
                    setExecuteLoading(false);
                    setStatus('failure');
                });
        } else if (statusType === 'Execute') {
            setExecuteLoading(true);
            methods
                .send(
                    appContract.methods.execute,
                    [proposal.id],
                    account
                )
                .then(() => {
                    setExecuteLoading(false);
                    setStatus('success');
                    toast.success({
                        title: `Proposal list will be updated within a few seconds`
                    });
                })
                .catch(() => {
                    setExecuteLoading(false);
                    setStatus('failure');
                });
        }
    };

    return (
        <div
            className="border-t border-solid border-lightGray p-6"
        >
            <div
                className="text-white text-xl cursor-pointer"
                onClick={() => history.push(`/vote/proposal/${proposal.id}`)}
            >
                <ReactMarkdown>{getTitle(proposal.description?.split('\n'))}</ReactMarkdown>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex space-x-6 mt-4">
                    <button
                        className={`focus:outline-none text-${getStatusColor(proposal)} px-2 rounded text-14
                            border border-solid border-${getStatusColor(proposal)}`}
                    >
                        {getStatus(proposal)}
                    </button>
                    <div className="text-gray text-14">
                        {proposal.id} - {proposal.state} {moment(proposal.createdAt).format('MMMM Do, YYYY')}
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        className="focus:outline-none bg-primary text-black px-5 py-0.5 rounded text-xl"
                        onClick={() => setShowActionModal(true)}
                    >
                        Actions
                    </button>
                    {proposal.state !== 'Executed' &&
                    proposal.state !== 'Defeated' &&
                    proposal.state !== 'Canceled' && (
                        <div className="flex align-center just-center update-proposal-status">
                            {proposal.state === 'Succeeded' && (
                                <button
                                    className="focus:outline-none bg-primary text-black px-5 py-0.5 rounded text-xl flex items-center justify-center"
                                    disabled={isLoading || status === 'success'}
                                    onClick={() => handleUpdateProposal('Queue')}
                                >
                                    {executeLoading && <Loading size={'18px'} margin={'8px'}/>}
                                    {status === 'pending' || status === 'failure'
                                        ? 'Queue'
                                        : 'Queued'}
                                </button>
                            )}
                            {proposal.state === 'Queued' && (
                                <button
                                    className="focus:outline-none bg-primary text-black px-5 py-0.5 rounded text-xl flex items-center justify-center"
                                    disabled={
                                        isLoading ||
                                        status === 'success'
                                    }
                                    onClick={() => handleUpdateProposal('Execute')}
                                >
                                    {executeLoading && <Loading size={'18px'} margin={'8px'}/>}
                                    {status === 'pending' || status === 'failure'
                                        ? 'Execute'
                                        : 'Executed'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 mt-4">
                {voteStatus &&
                voteStatus === 'novoted' &&
                proposal.state === 'Active' &&
                delegateAddress !==
                '0x0000000000000000000000000000000000000000' && (
                    <>
                        <VoteActionDetails
                            title="For"
                            percent={votePercents?.forVotes}
                            disabled={
                                votingWeight === '0' ||
                                !proposal ||
                                (proposal && proposal.state !== 'Active')
                            }
                            loading={isLoading && voteType === 'like'}
                            onVote={() => {
                                handleVote('like')
                            }} />
                        <VoteActionDetails
                            title="Against"
                            percent={votePercents?.againstVotes}
                            size="sm"
                            disabled={
                                votingWeight === '0' ||
                                !proposal ||
                                (proposal && proposal.state !== 'Active')
                            }
                            loading={isLoading && voteType === 'dislike'}
                            onVote={() => {
                                handleVote('dislike')
                            }} />
                    </>
                )}
            </div>

            <ActionModal
                proposal={proposal}
                visible={showActionModal}
                onClose={() => setShowActionModal(false)}
            />
        </div>
    )
}

export default compose(withRouter)(Proposal);
