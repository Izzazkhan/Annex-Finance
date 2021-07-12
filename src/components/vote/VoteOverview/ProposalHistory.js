import tickGreen from '../../../assets/icons/tickGreen.svg';
import tickGray from '../../../assets/icons/tickGray.svg';
import moment from "moment";

const ProposalHistory = ({ proposalInfo }) => {
    return (
        <div className="col-span-3 bg-fadeBlack rounded-2xl py-10 px-6">
            <div className="text-primary text-xl font-bold">Proposal History</div>
            <div className="mt-8">
                <div className="grid grid-cols-2 gap-y-6">
                    <div
                        className="col-start-2 flex items-start space-x-2
                                border-l-6 border-solid border-lightGreen pl-4"
                    >
                        <img className="w-5 mt-2" src={tickGreen} alt="" />
                        <div className="">
                            <div className="text-white text-xl">Created</div>
                            <div className="text-gray text-base">
                                {
                                    proposalInfo.createdTimestamp
                                        ? moment(proposalInfo.createdTimestamp * 1000).format('LLL')
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div
                        className="col-start-1 flex justify-end items-start space-x-2
                                border-r-6 border-solid border-lightGreen pr-4 -mr-1.5"
                    >
                        <div className="text-right">
                            <div className="text-white text-xl">Active</div>
                            <div className="text-gray text-base">
                                {
                                    proposalInfo.startTimestamp
                                        ? moment(proposalInfo.startTimestamp * 1000).format('LLL')
                                        : ''
                                }
                            </div>
                        </div>
                        <img className="w-5 mt-2" src={tickGreen} alt="" />
                    </div>
                    <div/>
                    <div
                        className="col-start-2 flex items-start space-x-2
                                border-l-6 border-solid border-gray pl-4"
                    >
                        {

                            proposalInfo.state === 'Canceled' ||
                            proposalInfo.state === 'Defeated'
                                ? <img className="w-5 mt-2" src={tickGray} alt="" />
                                : <img className="w-5 mt-2" src={tickGreen} alt="" />
                        }
                        <div className="">
                            <div className="text-white text-xl">
                                {
                                    proposalInfo.state === 'Canceled' ||
                                    proposalInfo.state === 'Defeated'
                                        ? `${
                                            proposalInfo.state === 'Defeated' ? 'Failed' : 'Canceled'
                                        }`
                                        : `${
                                            proposalInfo.state === 'Succeeded'
                                                ? 'Succeeded'
                                                : 'Succeed'
                                        }`
                                }
                            </div>
                            <div className="text-gray text-base">
                                {
                                    proposalInfo.endTimestamp
                                        ? moment(proposalInfo.endTimestamp * 1000).format('LLL')
                                        : `${
                                            proposalInfo.cancelTimestamp
                                                ? moment(proposalInfo.cancelTimestamp * 1000).format(
                                                'LLL'
                                                )
                                                : ''
                                        }`
                                }
                            </div>
                        </div>
                    </div>
                    {
                        proposalInfo.state !== 'Defeated' &&
                        proposalInfo.state !== 'Canceled' && (
                            <>
                                <div
                                    className="col-start-1 flex justify-end items-start space-x-2
                                border-r-6 border-solid border-gray pr-4 -mr-1.5"
                                >

                                    <div className="text-right">
                                        <div className="text-white text-xl">
                                            {proposalInfo.state === 'Queued' ? 'Queued' : 'Queue'}
                                        </div>
                                        <div className="text-gray text-base">
                                            {
                                                proposalInfo.queuedTimestamp
                                                    ? moment(proposalInfo.queuedTimestamp * 1000).format(
                                                    'LLL'
                                                    )
                                                    : ''
                                            }
                                        </div>
                                    </div>
                                    <img className="mt-2" src={tickGreen} alt="" />
                                </div>
                                <div/>
                            </>
                        )
                    }
                    {
                        proposalInfo.state !== 'Defeated' &&
                        proposalInfo.state !== 'Canceled' && (
                            <>
                                <div
                                    className="col-start-2 flex items-start space-x-2
                                border-l-6 border-solid border-gray pl-4"
                                >
                                    <img className="mt-2" src={tickGreen} alt="" />
                                    <div className="">
                                        <div className="text-white text-xl">
                                            {
                                                proposalInfo.state === 'Expired'
                                                    ? proposalInfo.state
                                                    : `${
                                                        proposalInfo.state === 'Executed'
                                                            ? 'Executed'
                                                            : 'Execute'
                                                    }`
                                            }
                                        </div>
                                        <div className="text-gray text-base">
                                            {
                                                proposalInfo.executedTimestamp
                                                    ? moment(proposalInfo.executedTimestamp * 1000).format(
                                                    'LLL'
                                                    )
                                                    : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="h-0"/>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )

}

ProposalHistory.defaultProps = {
    proposalInfo: {}
}

export default ProposalHistory;
