import {withRouter} from "react-router-dom";
import {accountActionCreators, connectAccount} from "../../core";
import {bindActionCreators, compose} from "redux";
import {useEffect, useState} from "react";
import BigNumber from "bignumber.js";
import {promisify} from "../../utilities";
import Layout from "../../layouts/MainLayout/MainLayout";
import ProposerInfo from "../../components/vote/ProposerDetails/ProposerInfo";
import Holding from "../../components/vote/ProposerDetails/Holding";
import Transactions from "../../components/vote/ProposerDetails/Transactions";
import VotingHistory from "../../components/vote/ProposerDetails/VotingHistory";

const ProposerOverview = ({ match, getVoterDetail, getVoterHistory }) => {
    const [holdingInfo, setHoldingInfo] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [data, setData] = useState({});
    const [current, setCurrent] = useState(1);

    const loadVoterDetail = async () => {
        await promisify(getVoterDetail, { address: match.params.address })
            .then(res => {
                if (res.data) {
                    setHoldingInfo({
                        balance: new BigNumber(res.data.balance)
                            .div(new BigNumber(10).pow(18))
                            .dp(4, 1)
                            .toString(10),
                        delegates: res.data.delegates.toLowerCase(),
                        delegateCount: res.data.delegateCount || 0,
                        votes: new BigNumber(res.data.votes)
                            .div(new BigNumber(10).pow(18))
                            .dp(4, 1)
                            .toString(10)
                    });
                    setTransactions(res.data.txs);
                }
            })
            .catch(() => {
                setHoldingInfo({});
            });
    };

    const loadVoterHistory = async () => {
        await promisify(getVoterHistory, { address: match.params.address })
            .then(res => {
                setData(res.data);
            })
            .catch(() => {});
    };

    const handleChangePage = (pageNumber, offset, limit) => {
        setCurrent(pageNumber);
        promisify(getVoterHistory, {
            address: match.params.address,
            offset,
            limit
        })
            .then(res => {
                setData(res.data);
            })
            .catch(() => {});
    };

    useEffect(() => {
        if (match.params && match.params.address) {
            loadVoterDetail();
            loadVoterHistory();
        }
    }, [match]);


    return (
        <Layout title={'Details'}>
            <div className="pt-8 pb-2">
                <ProposerInfo
                    address={match.params ? match.params.address : ''}
                />
                <div className="grid grid-cols-1 items-start gap-y-4 md:gap-y-0 md:grid-cols-8 md:gap-x-6 mt-8">
                    <Holding
                        address={match.params ? match.params.address : ''}
                        holdingInfo={holdingInfo}
                    />

                    <Transactions
                        address={match.params ? match.params.address : ''}
                        transactions={transactions}
                    />
                </div>

                <VotingHistory
                    data={data.result}
                    pageNumber={current}
                    total={data.total || 0}
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
    const { getVoterDetail, getVoterHistory } = accountActionCreators;

    return bindActionCreators(
        {
            getVoterDetail,
            getVoterHistory
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(mapStateToProps, mapDispatchToProps)
)(ProposerOverview);
