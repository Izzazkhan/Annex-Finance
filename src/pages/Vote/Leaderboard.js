import {withRouter} from "react-router-dom";
import {accountActionCreators, connectAccount} from "../../core";
import {bindActionCreators, compose} from "redux";
import commaNumber from "comma-number";
import React, {useEffect, useState} from "react";
import {promisify} from "../../utilities";
import avatar from '../../assets/icons/avatar.svg';

import Layout from "../../layouts/MainLayout/MainLayout";
import LeaderboardTable from "../../components/vote/LeaderboardTable";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import RouteMap from "../../routes/RouteMap";
import { useActiveWeb3React } from "hooks";
import CommingSoon from "pages/CommingSoon";

const format = commaNumber.bindWith(',', '.');

const Leaderboard = ({ history, getVoterAccounts }) => {
    const { chainId } = useActiveWeb3React();
    const [voterAccounts, setVoterAccounts] = useState([]);


    const columns = [
        {
            Header: 'Name',
            columns: [
                {
                    Header: 'Rank',
                    accessor: 'rank',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value }) => {
                        return <div className="text-base font-bold">{value}</div>;
                    },
                },
                {
                    Header: '',
                    accessor: 'address',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value }) => {
                        return (
                            <div
                                className="flex justify-start items-center space-x-8"
                            >
                                <div className="relative">
                                    <img className="w-8" src={avatar} alt="avatar" />
                                    <div className="w-2 h-2 rounded-full bg-green absolute bottom-0 right-0"/>
                                </div>
                                <div className="text-white text-base">{ value }</div>
                            </div>
                        );
                    },
                },
                {
                    Header: 'Votes',
                    accessor: 'votes',
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value }) => {
                        return (
                            <div className="text-base">
                                {format(
                                    new BigNumber(Web3.utils.fromWei(value, 'ether'))
                                        .dp(8, 1)
                                        .toString(10)
                                )}
                            </div>
                        );
                    },
                },
                {
                    Header: 'Vote Weight',
                    accessor: 'voteWeight',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value }) => {
                        return <div className="text-base">{parseFloat(value * 100).toFixed(2)}%</div>;
                    },
                },
                {
                    Header: 'Proposals Voted',
                    accessor: 'proposalsVoted',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value }) => {
                        return <div className="text-base">{value}</div>;
                    },
                },
            ],
        },
    ];

    useEffect(() => {
        promisify(getVoterAccounts, { limit: 100, offset: 0 })
            .then(res => {
                const results = res?.data?.result?.map((item, _i) => {
                    return {
                        ...item,
                        rank: _i
                    }
                })
                setVoterAccounts(results || []);
            })
            .catch(() => {
                setVoterAccounts([]);
            });
    }, []);

    if (chainId === 25) {
        return <CommingSoon />
    }
    return (
        <Layout title="LEADERBOARD" mainClassName="py-8">
            <LeaderboardTable
                columns={columns}
                data={voterAccounts}
                onRowClick={(row, i) => {
                    history.push(RouteMap.vote.proposerOverview.replace(":address", row?.original?.address))
                }}
            />

            {(!voterAccounts ||
                (voterAccounts && voterAccounts.length === 0)) && (
                <div className="flex w-full rounded-lg items-center justify-center pt-8 pb-16 bg-fadeBlack">
                    <span className="font-bold text-white text-xl">No voters</span>
                </div>
            )}
        </Layout>
    )


}

const mapDispatchToProps = dispatch => {
    const { getVoterAccounts } = accountActionCreators;

    return bindActionCreators(
        {
            getVoterAccounts
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(undefined, mapDispatchToProps)
)(Leaderboard);
