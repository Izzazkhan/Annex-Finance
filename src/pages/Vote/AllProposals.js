import {useHistory, withRouter} from "react-router-dom";
import Pagination from 'rc-pagination';

import Layout from "../../layouts/MainLayout/MainLayout";
import Progress from "../../components/UI/Progress";
import RouteMap from "../../routes/RouteMap";
import {useCallback, useEffect, useMemo, useState} from "react";
import {getTokenContract, getVoteContract, methods} from "../../utilities/ContractService";
import Web3 from "web3";
import toast from "../../components/UI/Toast";
import rightArrow from '../../assets/icons/rightArrow.svg';
import circleCross from '../../assets/icons/circleCross.svg';
import circleTick from '../../assets/icons/circleTick.svg';
import {accountActionCreators, connectAccount} from "../../core";
import {bindActionCreators, compose} from "redux";
import {useActiveWeb3React} from "../../hooks";
import {promisify} from "../../utilities";
import Loading from "../../components/UI/Loading";
import ProposalOverview from "../../components/vote/ProposalOverview";


const AllProposals = ({
    settings,
    getProposals
}) => {
    const { account: address } = useActiveWeb3React();
    const history = useHistory();

    const [votingWeight, setVotingWeight] = useState(0);
    const [proposals, setProposals] = useState({});
    const [isLoadingProposal, setIsLoadingProposal] = useState(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [proposalModal, setProposalModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [proposalThreshold, setProposalThreshold] = useState(0);
    const [maxOperation, setMaxOperation] = useState(0);
    const [delegateAddress, setDelegateAddress] = useState('');


    const loadInitialData = useCallback(async () => {
        setIsLoadingProposal(true);
        await promisify(getProposals, {
            offset: 0,
            limit: 4
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

    const onChangePage = (pageNumber, offset, limit) => {
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

    const handleChangePage = (page, size) => {
        setCurrent(page);
        setPageSize(size);
        onChangePage(page, (page - 1) * size, size);
    };

    const onNext = () => {
        handleChangePage(current + 1, 5);
    };

    const onPrev = () => {
        handleChangePage(current - 1, 5);
    };

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

    const activeProposals = useMemo(() => {
        if(proposals?.result && proposals?.result?.length === 0) {
            return 0;
        }

        const count = proposals?.result?.reduce((total, item) => {
            if(item.state === 'Active') {
                return total+=1;
            }

            return total;
        }, 0)

        return Math.floor(count / proposals?.result?.length * 100);


    }, [proposals?.result])

    const passedProposals = useMemo(() => {
        if(proposals?.result && proposals?.result?.length === 0) {
            return 0;
        }

        const count = proposals?.result?.reduce((total, item) => {
            if(item.state === 'Executed') {
                return total+=1;
            }

            return total;
        }, 0)

        return Math.floor(count / proposals?.result?.length * 100);
    }, [proposals?.result])

    return (
        <Layout>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 mt-8">
                <div className="text-primary text-2xl font-bold">Governance Proposals</div>
                <div className="flex items-center space-x-4">
                    <Progress
                        className="text-white"
                        type="circle"
                        color="#4FD000"
                        percent={activeProposals}
                        strokeWidth={10}
                        trailColor={"#2E2E2E"}
                        width={110}
                        symbolClassName="flex text-white"
                    />
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-4 text-white">
                            <div className="bg-lighterBlue w-7 h-5 rounded-3xl"/>
                            <div className="">Active</div>
                        </div>
                        <div className="flex items-center space-x-4 text-white">
                            <div className="bg-lightGreen w-7 h-5 rounded-3xl"/>
                            <div className="">Passed</div>
                        </div>
                        <div className="flex items-center space-x-4 text-white">
                            <div className="bg-darkGray w-7 h-5 rounded-3xl"/>
                            <div className="">Failed</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-fadeBlack py-6 px-10 rounded-3xl mt-8">
                <div className="text-white text-2xl font-medium mb-4">All Proposals</div>

                {isLoadingProposal && (
                    <div className="flex items-center justify-center py-16 flex-grow">
                        <Loading size={'36px'} margin={'0'} className={'text-primaryLight'} />
                    </div>
                )}
                {!isLoadingProposal && (
                    <>
                        {proposals?.result && proposals?.result?.length !== 0 ? (
                            proposals.map(item => {
                                return (
                                    <ProposalOverview
                                        proposal={item}
                                        votingWeight={votingWeight}
                                        delegateAddress={delegateAddress}
                                        address={address}
                                        key={item.id}
                                    />
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-16">
                                <span className="text-white font-medium">No Proposals</span>
                            </div>
                        )}
                    </>
                )}
                {
                    proposals?.result && proposals?.result?.length !== 0 && (
                        <div className="flex justify-between mt-6">
                            <Pagination
                                defaultCurrent={1}
                                defaultPageSize={4}
                                current={current}
                                pageSize={pageSize}
                                total={proposals.total}
                                onChange={handleChangePage}
                            />
                            <div className="flex just-between align-center space-x-8">
                                {current * pageSize < proposals.total && (
                                    <div className="flex space-x-4" onClick={onNext}>
                                        <div className="text-lg text-primary">Next</div>
                                        <img src={rightArrow} alt="" />
                                    </div>
                                )}
                                {current > 1 && (
                                    <div className="flex space-x-4" onClick={onPrev}>
                                        <div className="text-lg text-primary">Prev</div>
                                        <img src={rightArrow} alt="" className={'transform rotate-180'} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

            </div>
        </Layout>
    );
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
)(AllProposals);

