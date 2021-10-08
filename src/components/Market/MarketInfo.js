import {compose} from "redux";
import {withRouter} from "react-router-dom";
import MarketSummaryCard from "./MarketSummaryCard";
import BigNumber from "bignumber.js";
import commaNumber from "comma-number";

const format = commaNumber.bindWith(',', '.');

const MarketInfo = ({
    marketInfo,
    marketType
}) => {
    if (!marketInfo.underlyingSymbol) return null;

    return (
        <div className={'bg-fadeBlack p-6 rounded-2xl'}>
            <div className="grid grid-cols-1 gap-y-4 md:gap-y-0 md:grid-cols-4 md:gap-x-4 px-10 md:px-0">
                <MarketSummaryCard
                    title={"Net Rate"}
                >
                    {marketType === 'supply'
                        ? new BigNumber(
                            +marketInfo.supplyApy < 0.01 ? 0.01 : marketInfo.supplyApy
                        )
                            .plus(
                                new BigNumber(
                                    +marketInfo.supplyAnnexApy < 0.01
                                        ? 0.01
                                        : marketInfo.supplyAnnexApy
                                )
                            )
                            .dp(2, 1)
                            .toString(10)
                        : new BigNumber(
                            marketInfo.borrowAnnexApy < 0.01
                                ? 0.01
                                : marketInfo.borrowAnnexApy
                        )
                            .minus(
                                +marketInfo.borrowApy < 0.01 ? 0.01 : marketInfo.borrowApy
                            )
                            .dp(2, 1)
                            .toString(10)}
                    %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={marketType === 'supply' ? "Supply APY" : "Borrow APY"}
                >
                    {marketType === 'supply'
                        ? new BigNumber(
                            +marketInfo.supplyApy < 0.01 ? 0.01 : marketInfo.supplyApy
                        )
                            .dp(2, 1)
                            .toString(10)
                        : new BigNumber(
                            +marketInfo.borrowApy < 0.01 ? 0.01 : marketInfo.borrowApy
                        )
                            .dp(2, 1)
                            .toString(10)}
                    %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={"Distribution APY"}
                >
                    {marketType === 'supply'
                        ? new BigNumber(
                            +marketInfo.supplyAnnexApy < 0.01
                                ? 0.01
                                : marketInfo.supplyAnnexApy
                        )
                            .dp(2, 1)
                            .toString(10)
                        : new BigNumber(
                            marketInfo.borrowAnnexApy < 0.01
                                ? 0.01
                                : marketInfo.borrowAnnexApy
                        )
                            .dp(2, 1)
                            .toString(10)}
                    %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={marketType === 'supply' ? "Total Supply" : "Total Borrow"}
                >
                    $
                    {format(
                        new BigNumber(
                            marketType === 'supply'
                                ? marketInfo.totalSupplyUsd
                                : marketInfo.totalBorrowsUsd
                        )
                            .dp(2, 1)
                            .toString(10)
                    )}
                </MarketSummaryCard>
            </div>
        </div>
    )

}

MarketInfo.defaultProps = {
    marketInfo: {},
    marketType: 'supply'
};
export default compose(withRouter)(MarketInfo);
