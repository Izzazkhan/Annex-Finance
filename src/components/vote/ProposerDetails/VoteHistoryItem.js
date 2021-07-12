import {withRouter} from "react-router-dom";
import {compose} from "redux";
import BigNumber from "bignumber.js";
import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import moment from "moment";

import circleCross from '../../../assets/icons/circleCross.svg';
import circleTick from '../../../assets/icons/circleTick.svg';
import Progress from "../../UI/Progress";

const VoteHistoryItem = ({ proposal, support, history }) => {
    const [forPercent, setForPercent] = useState(0);
    const [againstPercent, setAgainstPercent] = useState(0);

    useEffect(() => {
        const total = new BigNumber(proposal.forVotes).plus(
            new BigNumber(proposal.againstVotes)
        );
        setForPercent(
            new BigNumber(proposal.forVotes * 100).div(total).isNaN()
                ? '0'
                : new BigNumber(proposal.forVotes * 100).div(total).toString()
        );
        setAgainstPercent(
            new BigNumber(proposal.againstVotes * 100).div(total).isNaN()
                ? '0'
                : new BigNumber(proposal.againstVotes * 100).div(total).toString()
        );
    }, [proposal]);

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
            return 'lightGreen';
        }
        if (p.state === 'Active') {
            return 'primaryLight';
        }
        if (p.state === 'Defeated') {
            return 'red';
        }
        return 'lightGray';
    };

    return (
        <div
            className="mt-6"
            onClick={() => history.push(`/vote/proposal/${proposal.id}`)}
        >
            <div
                className="flex flex-col space-y-4 md:space-y-0 md:flex-row items-center md:justify-between
                            border-b border-solid border-darkBlue2 py-4 cursor-pointer"
            >
                <div className="">
                    <div className="text-white text-xl">
                        <ReactMarkdown>
                            {proposal.description.split('\n')[0]}
                        </ReactMarkdown>
                    </div>
                    <div className="flex space-x-3 text-white text-base mt-2">
                        <div>{proposal.id}</div>
                        <div>{proposal.state}</div>
                        <div>
                            {moment(proposal.createdAt).format('MMMM Do, YYYY')}
                        </div>
                        <div className={`text-${getStatusColor(proposal)}`}>
                            {getStatus(proposal)}
                        </div>
                    </div>
                </div>
                <Progress
                    wrapperClassName="w-72"
                    percent={
                        support ? Number(forPercent) : Number(againstPercent)
                    }
                    color={
                        support ? "#4FD000" : "#fd5353"
                    }
                />
                {support ? (
                    <img className="" src={circleTick} alt="" />
                ) : (
                    <img className="" src={circleCross} alt="" />
                )}
                <div className="font-bold text-white text-xl md:pr-8">
                    {support ? 'For' : 'Against'}
                </div>
            </div>
        </div>
    )
}

export default compose(withRouter)(VoteHistoryItem);
