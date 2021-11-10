import { compose } from "redux";
import { withRouter } from "react-router-dom";
import MarketSummaryCard from "./MarketSummaryCard";
import BigNumber from "bignumber.js";
import commaNumber from "comma-number";
import { useMemo } from "react";

const format = commaNumber.bindWith(',', '.');

const MarketInfo = ({
    marketInfo,
    marketType
}) => {
    if (!marketInfo.underlyingSymbol) return null;

    const netRate = useMemo(() => {
        let value = 0
        if (marketType === 'supply') {
            value = new BigNumber(
                +marketInfo.supplyApy < 0.01 ? 0.01 : marketInfo.supplyApy)
                .plus(
                    new BigNumber(
                        +marketInfo.supplyAnnexApy < 0.01
                            ? 0.01
                            : marketInfo.supplyAnnexApy
                    ))
        } else {
            value = new BigNumber(
                marketInfo.borrowAnnexApy < 0.01
                    ? 0.01
                    : marketInfo.borrowAnnexApy)
                .minus(
                    +marketInfo.borrowApy < 0.01 ? 0.01 : marketInfo.borrowApy
                )
        }
        if (value.isGreaterThan(10000)) {
            return 'Infinity'
        }
        return value.dp(2, 1).toString(10)
    }, [marketInfo, marketType])

    const supplyApy = useMemo(() => {
        let value = 0
        if (marketType === 'supply') {
            value = new BigNumber(
                +marketInfo.supplyApy < 0.01 ? 0.01 : marketInfo.supplyApy
            )
        } else {
            value = new BigNumber(
                +marketInfo.borrowApy < 0.01 ? 0.01 : marketInfo.borrowApy
            )
        }
        if (value.isGreaterThan(10000)) {
            return 'Infinity'
        }
        return value.dp(2, 1).toString(10)
    }, [marketInfo, marketType])

    const distributionApy = useMemo(() => {
        let value = 0
        if (marketType === 'supply') {
            value = new BigNumber(
                +marketInfo.supplyAnnexApy < 0.01
                    ? 0.01
                    : marketInfo.supplyAnnexApy
            )
        } else {
            value = new BigNumber(
                marketInfo.borrowAnnexApy < 0.01
                    ? 0.01
                    : marketInfo.borrowAnnexApy
            )
        }
        if (value.isGreaterThan(10000)) {
            return 'Infinity'
        }
        return value.dp(2, 1).toString(10)
    }, [marketInfo, marketType])

    const totalSupply = useMemo(() => {
        let value = new BigNumber(
            marketType === 'supply'
                ? marketInfo.totalSupplyUsd
                : marketInfo.totalBorrowsUsd
        )

        if (value.isGreaterThan(10000)) {
            return 'Infinity'
        }
        return value.dp(2, 1).toString(10)
    }, [marketInfo, marketType])

    return (
        <div className={'bg-fadeBlack p-6 rounded-2xl'}>
            <div className="grid grid-cols-1 gap-y-4 md:gap-y-0 md:grid-cols-4 md:gap-x-4 px-10 md:px-0">
                <MarketSummaryCard
                    title={"Net Rate"}
                >
                    {netRate} %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={marketType === 'supply' ? "Supply APY" : "Borrow APY"}
                >
                    {supplyApy} %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={"Distribution APY"}
                >
                    {distributionApy} %
                </MarketSummaryCard>
                <MarketSummaryCard
                    title={marketType === 'supply' ? "Total Supply" : "Total Borrow"}
                >
                    $ {format(totalSupply)}
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
