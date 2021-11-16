import { accountActionCreators, connectAccount } from "../core";
import { bindActionCreators, compose } from 'redux';
import { withRouter } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { promisify } from "../utilities";
import BigNumber from "bignumber.js";
import * as constants from "../utilities/constants";
import Layout from "../layouts/MainLayout/MainLayout";
import { useActiveWeb3React } from "../hooks";
import MarketInfo from "../components/Market/MarketInfo";
import MarketDetailsChart from "../components/Market/MarketDetailsChart";
import InterestRateModel from "../components/Market/InterestRateModel";
import MarketSummary from "../components/Market/MarketSummary";
import Loading from "../components/UI/Loading";
import CommingSoon from "./CommingSoon";

let timeStamp = 0;
const MarketDetails = ({
    match,
    settings,
    getMarketHistory
}) => {
    const { account, chainId } = useActiveWeb3React();
    const [marketType, setMarketType] = useState('supply');
    const [currentAsset, setCurrentAsset] = useState('');
    const [data, setData] = useState([]);
    const [marketInfo, setMarketInfo] = useState({});


    useEffect(() => {
        if (match.params && match.params.asset) {
            setCurrentAsset(match.params.asset.toLowerCase());
        }
    }, [match]);

    const getGraphData = useCallback(
        async (asset, type) => {
            const tempData = [];
            await promisify(getMarketHistory, { asset, type }).then(res => {
                res.data.result.forEach(m => {
                    tempData.push({
                        createdAt: m.createdAt,
                        supplyApy: +new BigNumber(m.supplyApy || 0).dp(8, 1).toString(10),
                        borrowApy: +new BigNumber(m.borrowApy || 0).dp(8, 1).toString(10),
                        totalSupply: +new BigNumber(m.totalSupply || 0)
                            .dp(8, 1)
                            .toString(10),
                        totalBorrow: +new BigNumber(m.totalBorrow || 0)
                            .dp(8, 1)
                            .toString(10)
                    });
                });
                setData([...tempData.reverse()]);
            });
        },
        [getMarketHistory]
    );


    const getGovernanceData = useCallback(async () => {
        if (settings.markets && settings.markets.length > 0 && currentAsset) {
            const info = settings.markets.find(
                item => item.underlyingSymbol.toLowerCase() === currentAsset
            );
            setMarketInfo(info || {});
        }
    }, [settings.markets, currentAsset]);

    useEffect(() => {
        getGovernanceData();
    }, [getGovernanceData]);

    useEffect(() => {
        if (timeStamp % 60 === 0 && currentAsset) {
            getGraphData(
                constants.CONTRACT_ABEP_ADDRESS[chainId][currentAsset].address,
                '1day'
            );
        }
        timeStamp = Date.now();
    }, [account, currentAsset, getGraphData]);


    useEffect(() => {
        if (currentAsset) {
            getGraphData(
                constants.CONTRACT_ABEP_ADDRESS[chainId][currentAsset].address,
                '1day'
            );
        }
    }, [currentAsset]);

    if (chainId === 25) {
        return <CommingSoon />
    }

    return (
        <Layout mainClassName="py-8" title={"Market"}>

            {(!account ||
                !settings.markets ||
                !currentAsset) && (
                    <div className="flex items-center justify-center py-16 flex-grow bg-fadeBlack rounded-lg">
                        <Loading size={'48px'} margin={'0'} className={'text-primaryLight'} />
                    </div>
                )}
            {account &&
                settings.markets &&
                settings.decimals &&
                currentAsset && (
                    <>
                        {!!marketInfo.underlyingSymbol && (
                            <div className="flex items-center space-x-4 mt-2 mb-6 2xl:mb-8">
                                <img
                                    className="w-10"
                                    src={
                                        constants.CONTRACT_TOKEN_ADDRESS[chainId][
                                            marketInfo?.underlyingSymbol?.toLowerCase()
                                        ]
                                            ? constants.CONTRACT_TOKEN_ADDRESS[chainId][
                                                marketInfo?.underlyingSymbol?.toLowerCase()
                                            ].asset
                                            : null
                                    }
                                    alt={marketInfo.underlyingSymbol}
                                />
                                <div
                                    className="text-white text-2xl 2xl:text-36 font-bold "
                                >
                                    {marketInfo.underlyingSymbol}
                                </div>
                            </div>
                        )}
                        <MarketInfo
                            marketInfo={marketInfo}
                            marketType={marketType}
                        />
                        <div className="bg-fadeBlack rounded-2xl p-6 mt-10">
                            <div className="flex justify-center">
                                <div className="bg-black rounded-2xl relative" style={{ width: '100%', minHeight: '300px' }}>
                                    <div className="flex items-center space-x-2 absolute top-4 left-4">
                                        <button
                                            className={`${marketType === 'supply' ? "bg-primary" : "text-white bg-blue"} 
                                        text-sm 2xl:text-18 rounded py-2 px-3`}
                                            onClick={() => setMarketType('supply')}
                                        >
                                            SUPPLY
                                        </button>
                                        <button
                                            className={`${marketType === 'borrow' ? "bg-primary" : "text-white bg-blue"}
                                         text-sm 2xl:text-18 rounded py-2 px-3`}
                                            onClick={() => setMarketType('borrow')}
                                        >
                                            BORROW
                                        </button>
                                    </div>
                                    <MarketDetailsChart
                                        data={data}
                                        marketType={marketType}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-4 mt-4">
                                <InterestRateModel
                                    currentAsset={currentAsset}
                                />
                                <MarketSummary
                                    marketInfo={marketInfo}
                                    currentAsset={currentAsset}
                                />
                            </div>
                        </div>
                    </>
                )}
        </Layout>
    )
}


MarketDetails.defaultProps = {
    match: {},
    settings: {}
};

const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

const mapDispatchToProps = dispatch => {
    const { getMarketHistory } = accountActionCreators;

    return bindActionCreators(
        {
            getMarketHistory
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(mapStateToProps, mapDispatchToProps)
)(MarketDetails);
