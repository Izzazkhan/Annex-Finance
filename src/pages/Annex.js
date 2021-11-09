import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { accountActionCreators, connectAccount } from "../core";
import { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { getTokenContract, methods } from "../utilities/ContractService";
import Layout from "../layouts/MainLayout/MainLayout";
import commaNumber from "comma-number";
import { useActiveWeb3React } from "../hooks";
import Loading from "../components/UI/Loading";
import Progress from "../components/UI/Progress";
import Searchbar from "../components/Annex/Searchbar";
import * as constants from "../utilities/constants";
import APYSparkline from "../components/Annex/APYSparkline";
import AnnexTable from "../components/Annex/AnnexTable";
import { promisify } from "../utilities";


const format = commaNumber.bindWith(',', '.');

const Annex = ({ settings, getMarketHistory }) => {
    const { account, chainId } = useActiveWeb3React()
    const [search, setSearch] = useState("")
    const [markets, setMarkets] = useState([]);
    const [dailyDistribution, setDailyDistribution] = useState('0');
    const [totalDistributed, setTotalDistributed] = useState('0');
    const [remainAmount, setRemainAmount] = useState('0');

    const mintedAmount = '23700000';

    const getGraphData = async (asset, type, limit) => {
        let tempData = [];
        const res = await promisify(getMarketHistory, { asset, type, limit });
        tempData = res?.data?.result
            .map(m => {
                return {
                    blockNumber: m?.blockNumber,
                    createdAt: m.createdAt,
                    borrowAnnexApy: +new BigNumber(m.borrowAnnexApy || 0).dp(8, 1).toFixed(4),
                };
            })
            .reverse();

        return tempData
    };


    const getANNInfo = async () => {
        const tempMarkets = [];
        const sum = (settings.markets || []).reduce((accumulator, market) => {
            return new BigNumber(accumulator).plus(
                new BigNumber(market.totalDistributed)
            );
        }, 0);

        // total info
        // let annexXAIVaultRate = await methods.call(
        //     compContract.methods.annexXAIVaultRate,
        //     []
        // );
        // annexXAIVaultRate = new BigNumber(annexXAIVaultRate)
        //     .div(1e18)
        //     .times(20 * 60 * 24);
        const tokenContract = getTokenContract('ann', chainId);
        const remainedAmount = await methods.call(tokenContract.methods.balanceOf, [
            constants.CONTRACT_COMPTROLLER_ADDRESS[chainId]
        ]);
        setDailyDistribution(
            new BigNumber(settings.dailyAnnex)
                .div(new BigNumber(10).pow(18))
                .dp(2, 1)
                .toString(10)
        );
        setTotalDistributed(settings.totalAnnexDistributed);
        setRemainAmount(
            new BigNumber(remainedAmount)
                .div(new BigNumber(10).pow(18))
                .dp(2, 1)
                .toString(10)
        );
        for (let i = 0; i < settings.markets.length; i += 1) {
            const borrowGraph = await getGraphData(
                constants.CONTRACT_ABEP_ADDRESS[chainId][settings.markets[i].underlyingSymbol?.toLowerCase()].address,
                process.env.REACT_APP_GRAPH_TICKER || null,
                60
            )
            tempMarkets.push({
                underlyingSymbol: settings.markets[i].underlyingSymbol,
                perDay: +new BigNumber(settings.markets[i].supplierDailyAnnex)
                    .plus(new BigNumber(settings.markets[i].borrowerDailyAnnex))
                    .div(new BigNumber(10).pow(18))
                    .dp(2, 1)
                    .toString(10),
                supplyAPY: +(new BigNumber(
                    settings.markets[i].supplyAnnexApy
                ).isLessThan(0.01)
                    ? '0.01'
                    : new BigNumber(settings.markets[i].supplyAnnexApy)
                        .dp(2, 1)
                        .toString(10)),
                borrowAPY: +(new BigNumber(
                    settings.markets[i].borrowAnnexApy
                ).isLessThan(0.01)
                    ? '0.01'
                    : new BigNumber(settings.markets[i].borrowAnnexApy)
                        .dp(2, 1)
                        .toString(10)),
                borrowAnnexAPY: borrowGraph
            });
        }
        setMarkets(tempMarkets);
    };

    const searchHandler = useCallback((e) => {
        setSearch(e.target.value);
    }, [])

    useEffect(() => {
        if (settings.markets && settings.markets.length > 0 && settings.dailyAnnex) {
            getANNInfo();
        }
    }, [settings.markets]);

    const filteredMarkets = useMemo(() => {
        if(!markets) {
            return []
        }

        if(search === '') {
            return markets;
        } else {
            return markets
                .map(market => JSON.stringify(market))
                .filter(stringMarket => stringMarket.toLowerCase().indexOf(search.toLowerCase()) > -1)
                .map(filteredMarket => JSON.parse(filteredMarket));
        }
    }, [search, markets])

    const columns = useMemo(() => {
        return [{
            Header: "Name",
            columns: [
                {
                    Header: 'Rank',
                    accessor: 'rank',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: (props) => {
                        return (
                            <div className={`font-bold ${props?.row?.index < 3 ? 'text-midBlue' : 'text-gray'}`}>
                                #{props.row?.index + 1}
                            </div>
                        );
                    },
                },
                {
                    Header: "Coin Market",
                    accessor: "underlyingSymbol",
                    // eslint-disable-next-line react/display-name
                    Cell: ({value}) => {
                        return (
                            <div className="flex justify-start items-center space-x-2">
                                <img
                                    className={'w-10 h-10'}
                                    src={
                                        constants.CONTRACT_TOKEN_ADDRESS[chainId][
                                            value.toLowerCase()
                                        ].asset
                                    }
                                    alt={value}
                                />
                                <div className="font-semibold">{value}</div>
                            </div>
                        )
                    }
                },
                {
                    Header: 'Per Day',
                    accessor: 'perDay',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({value}) => {
                        return (
                            <div className="font-semibold">{value}</div>
                        )
                    }
                },
                {
                    Header: 'Supply ANN APY',
                    accessor: 'supplyAPY',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({value}) => {
                        return (
                            <div className={`font-semibold ${value > 0 ? "text-green" : value === 0 ? "text-white" : "text-red"}`}>
                                {value}%
                            </div>
                        )
                    }
                },
                {
                    Header: 'Borrow APY',
                    accessor: 'borrowAPY',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({value}) => {
                        return (
                            <div className={`font-semibold ${value > 0 ? "text-green" : value === 0 ? "text-white" : "text-red"}`}>
                                {value}%
                            </div>
                        )
                    }
                },
                {
                    Header: 'Borrow ANN APY',
                    accessor: 'borrowAnnexAPY',
                    disableFilters: true,
                    // eslint-disable-next-line react/display-name
                    Cell: ({value}) => {
                        return (
                            <div className="w-full flex flex-row items-center justify-end">
                                <div className="w-60 md:w-72" style={{ height: 75 }}>
                                    <APYSparkline
                                        color={value[0].borrowAnnexApy >= 0 ? "green" : "red"}
                                        data={value}
                                    />
                                </div>
                            </div>
                        )
                    }
                }
            ]
        }]
    }, [])



    return (
        <Layout mainClassName="pt-4 pb-6" title={'Annex'}>
            {!account ? (
                <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                    <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                </div>
            ) : (
                <>
                    <div className="flex flex-col items-center space-y-6 md:space-y-6 md:flex-row md:justify-between">
                        <div className="flex space-x-2 items-center">
                            <div className="text-primary text-2xl lg:text-3xl">Market Distribution</div>
                        </div>

                        <div className="bg-fadeBlack rounded-lg p-6">
                            <div className="flex space-x-8">
                                <div className="text-white">
                                    <div className="text-base">Daily Distribution</div>
                                    <div className="text-2xl 2xl:mt-4">{format(dailyDistribution)}</div>
                                </div>
                                <div className="text-white">
                                    <div className="text-base">Total Distribution</div>
                                    <div className="text-2xl 2xl:mt-4">{format(totalDistributed)}</div>
                                </div>
                                <div className="text-white">
                                    <div className="text-base">Remaining</div>
                                    <div className="text-2xl 2xl:mt-4">{format(remainAmount)}</div>
                                </div>
                            </div>
                            <Progress
                                wrapperClassName="mt-4"
                                percent={new BigNumber(totalDistributed)
                                    .dividedBy(new BigNumber(mintedAmount))
                                    .multipliedBy(100)
                                    .toNumber()
                                }
                                trailColor={"#2E2E2E"}
                            />
                        </div>
                    </div>
                    <div className="bg-fadeBlack rounded-xl p-6 mt-6 w-full">
                        <div className="w-full">
                            <div className="relative w-full mt-2">
                                <div className="flex flex-row items-center justify-between space-x-10 md:space-x-0">
                                <Searchbar
                                    value={search}
                                    onChange={searchHandler}
                                />
                                </div>
                            </div>
                        </div>
                        {(!markets || markets.length === 0) ? (
                            <div className="flex items-center justify-center py-16 flex-grow">
                                <Loading size={'36px'} margin={'0'} className={'text-primaryLight'} />
                            </div>
                        ) : (
                            <AnnexTable
                                columns={columns}
                                data={filteredMarkets}
                            />
                        )}
                    </div>
                </>
            )}
        </Layout>
    )
}

Annex.defaultProps = {
    settings: {}
}


const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

const mapDispatchToProps = dispatch => {
    const { getVoterAccounts, getMarketHistory } = accountActionCreators;

    return bindActionCreators(
        {
            getVoterAccounts,
            getMarketHistory
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(mapStateToProps, mapDispatchToProps)
)(Annex);
