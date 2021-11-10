import commaNumber from "comma-number";
import {compose} from "redux";
import {withRouter} from "react-router-dom";
import {connectAccount} from "../../core";
import BigNumber from "bignumber.js";

const format = commaNumber.bindWith(',', '.');


const MarketSummary = ({ marketInfo, currentAsset, settings }) => {

    if (!settings.decimals?.[currentAsset]?.token) return null;

    return (
        <div className="col-span-5 bg-black rounded-2xl text-white py-4 px-6">

            {/* Price */}
            <div className="flex justify-between py-2">
                <div className="font-bold 2xl:text-20">Price</div>
                <div className="font-bold 2xl:text-20 mt-1">
                    {`$${new BigNumber(marketInfo.underlyingPrice || 0)
                        .div(
                            new BigNumber(10).pow(
                                18 + 18 - parseInt(settings.decimals[currentAsset].token, 10)
                            )
                        )
                        .dp(8, 1)
                        .toString(10)}`}
                </div>
            </div>

            {/* Market Liquidity */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Market Liquidity</div>
                <div className="text-xs 2xl:text-14">
                    {`${format(
                        new BigNumber(marketInfo.cash || 0)
                            .div(new BigNumber(10).pow(settings.decimals[currentAsset].token))
                            .dp(8, 1)
                            .toString(10)
                    )} ${marketInfo.underlyingSymbol || ''}`}
                </div>
            </div>

            {/* # of Suppliers */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14"># of Suppliers</div>
                <div className="text-xs 2xl:text-14">
                    {format(marketInfo.supplierCount)}
                </div>
            </div>

            {/* # of Borrowers */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14"># of Borrowers</div>
                <div className="text-xs 2xl:text-14">
                    {format(marketInfo.borrowerCount)}
                </div>
            </div>

            {/* Borrow Cap */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Borrow Cap</div>
                <div className="text-xs 2xl:text-14">
                    $
                    {format(
                        new BigNumber(marketInfo.totalBorrowsUsd).dp(2, 1).toString(10)
                    )}
                </div>
            </div>

            {/* Interest Paid/Day */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Interest Paid/Day</div>
                <div className="text-xs 2xl:text-14">
                    $
                    {format(
                        new BigNumber(marketInfo.supplierDailyAnnex)
                            .plus(new BigNumber(marketInfo.borrowerDailyAnnex))
                            .div(new BigNumber(10).pow(18))
                            .multipliedBy(marketInfo.tokenPrice)
                            .dp(2, 1)
                            .toString(10)
                    )}
                </div>
            </div>

            {/* Reserves */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Reserves</div>
                <div className="text-xs 2xl:text-14">
                    {`${new BigNumber(marketInfo.totalReserves || 0)
                        .div(new BigNumber(10).pow(settings.decimals[currentAsset].token))
                        .dp(8, 1)
                        .toString(10)} ${marketInfo.underlyingSymbol || ''}`}
                </div>
            </div>

            {/* Reserve Factor */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Reserve Factor</div>
                <div className="text-xs 2xl:text-14">
                    {`${new BigNumber(marketInfo.reserveFactor || 0)
                        .div(new BigNumber(10).pow(18))
                        .multipliedBy(100)
                        .dp(8, 1)
                        .toString(10)}%`}
                </div>
            </div>

            {/* Collateral Factor */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Collateral Factor</div>
                <div className="text-xs 2xl:text-14">
                    {`${new BigNumber(marketInfo.collateralFactor || 0)
                        .div(new BigNumber(10).pow(18))
                        .times(100)
                        .dp(2, 1)
                        .toString(10)}%`}
                </div>
            </div>

            {/* Total Supply */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Total Supply</div>
                <div className="text-xs 2xl:text-14">
                    {`$${format(
                        new BigNumber(marketInfo.totalSupplyUsd || 0).dp(2, 1).toString(10)
                    )}`}
                </div>
            </div>

            {/* Total Borrow */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Total Borrow</div>
                <div className="text-xs 2xl:text-14">
                    {`$${format(
                        new BigNumber(marketInfo.totalBorrowsUsd || 0).dp(2, 1).toString(10)
                    )}`}
                </div>
            </div>

            {/* Minted */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">a{marketInfo.underlyingSymbol} Minted</div>
                <div className="text-xs 2xl:text-14">
                    {format(marketInfo.totalSupply2)}
                </div>
            </div>

            {/* Exchange Rate */}
            <div
                className="flex justify-between py-3
                                   border-t border-solid border-lightGray"
            >
                <div className="text-xs 2xl:text-14">Exchange Rate</div>
                <div className="text-xs 2xl:text-14">
                    {`1 ${marketInfo.underlyingSymbol || ''} = ${Number(
                        new BigNumber(1)
                            .div(
                                new BigNumber(marketInfo.exchangeRate).div(
                                    new BigNumber(10).pow(
                                        18 +
                                        +parseInt(
                                            settings.decimals[currentAsset || 'usdt'].token,
                                            10
                                        ) -
                                        +parseInt(
                                            settings.decimals[currentAsset || 'usdt'].atoken,
                                            10
                                        )
                                    )
                                )
                            )
                            .toString(10)
                    ).toFixed(6)} ${marketInfo.symbol || ''}`}
                </div>
            </div>
        </div>
    )
}

MarketSummary.defaultProps = {
    marketInfo: {},
    settings: {},
    currentAsset: ''
};

const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

export default compose(
    withRouter,
    connectAccount(mapStateToProps, undefined)
)(MarketSummary);
