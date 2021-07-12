import RouteMap from "../../routes/RouteMap";
import circleTick from "../../assets/icons/circleTick.svg";
import circleCross from "../../assets/icons/circleCross.svg";
import {compose} from "redux";
import {withRouter} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import * as moment from "moment";
import {getVoteContract, methods} from "../../utilities/ContractService";
import ReactMarkdown from "react-markdown";

const ProposalOverview = ({
    address,
    delegateAddress,
    proposal,
    votingWeight,
    history
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [voteType, setVoteType] = useState('like');
    const [voteStatus, setVoteStatus] = useState('');

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
        return 'lightGray';
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

    return (
        <div className="mt-2">
            <div
                className="flex justify-between border-b border-solid border-lightGray py-4 cursor-pointer"
                onClick={() => history.push(RouteMap.vote.voteOverview.replace(":id", proposal.id))}
            >
                <div className="">
                    <div className="text-white text-xl">
                        <ReactMarkdown>{getTitle(proposal.description?.split('\n'))}</ReactMarkdown>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                        <button
                            className={`focus:outline-none text-${getStatusColor(proposal)} py-1 px-2 rounded text-xs
                                 border border-solid ${getStatusColor(proposal)}`}
                        >
                            {getStatus(proposal)}
                        </button>
                        <div className="text-gray">
                            {proposal.id} - {proposal.state} {moment(proposal.createdAt).format('MMMM Do, YYYY')}
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <div className="flex flex-col items-center space-y-2">
                        {proposal.state !== 'Defeated' ? <img src={circleTick} alt="" /> : <img src={circleCross} alt="" />}
                    </div>
                    <div className={`text-white text-base ${proposal.state !== 'Defeated' ? '' : 'text-secondary'}`}>
                        {getStatus(proposal)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default compose(withRouter)(ProposalOverview);
