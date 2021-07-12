import moment from "moment";
import Markdown from 'react-markdown';

const ProposalInfo = ({ proposalInfo }) => {
    const getStatus = proposal => {
        if (proposal.state === 'Executed') {
            return 'Passed';
        }
        if (proposal.state === 'Active') {
            return 'Active';
        }
        if (proposal.state === 'Defeated') {
            return 'Failed';
        }
        return proposal.state;
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


    return (
        <div className="text-white">
            <div className="text-36 text-center md:text-left">
                <Markdown>{proposalInfo.description?.split('\n')[0]}</Markdown>
            </div>
            <div className="flex space-x-8 mt-2">
                <div className="text-gray text-xl">
                    {`${proposalInfo.id} ${getStatus(proposalInfo)} ${moment(
                        proposalInfo.updatedAt
                    ).format('MMMM DD, YYYY')}`}
                </div>
                <div className={`text-${getStatusColor(proposalInfo)} text-xl`}>
                    {getStatus(proposalInfo)}
                </div>
                <div className="text-white text-xl">{getRemainTime(proposalInfo)}</div>
            </div>
        </div>
    )
}

ProposalInfo.defaultProps = {
    proposalInfo: {}
};
export default ProposalInfo;
