import React, { Fragment } from 'react';
import styled from 'styled-components';
import annCoin from '../../assets/images/coins/ann.png'
import annLogo from '../../assets/icons/logoSolid.svg'
import pancakeLogo from '../../assets/images/pancakeswap-logo.png'
import upArrow from '../../assets/icons/arrowUp.png'
import config from '../../constants/config';
import BigNumber from 'bignumber.js';
import commaNumber from 'comma-number';
import { accountActionCreators, connectAccount } from 'core';
import { bindActionCreators } from 'redux';

const Styles = styled.div`
    width: 100%;
    overflow: auto;
    background-color: #101016;
    border-radius: 1.5rem;
`;


function Cards({ data, addLiquidity, settings }) {


    const getTokenDetails = (symbol) => {
        return settings.assetList.find((obj => obj.symbol === symbol))
    }

    const format = commaNumber.bindWith(',', '.');
    return (
        <Styles>
            <div className="p-4 flex flex-row flex-wrap">
                {/* <div> */}
                {
                    data.map((item, key) => {
                        const token1Details = getTokenDetails(item.token1Name)
                        return (
                            <div key={key} className="text-white text-base py-7 px-6 m-6 rounded-3xl border border-primary">
                                <div className="flex justify-between">
                                    <div className="flex">
                                        <div className="mr-3 relative h-14 w-14">
                                            <img src={annCoin} alt="" className="h-8" />
                                            {token1Details && <img src={token1Details.img} alt="" className="h-10 absolute right-0 bottom-0" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">
                                                {item.token1Name && (item.token1Name + "  Token Wrapped ")}{item.token0Name}
                                            </span>
                                            <span className="mt-2">{item.token0Name}{item.token1Name && ` - ${item.token1Name}`}</span>
                                        </div>
                                    </div>
                                    <div className="mr-4">
                                        {
                                            item.type === 'pancake_lp' ? (
                                                <img src={pancakeLogo} alt="" className="h-8 title-tooltip" title={item.lpName} />
                                            ) : (
                                                <img src={annLogo} alt="" className="h-8 title-tooltip" title={item.lpName} />
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="flex mt-7 justify-between">
                                    <div className="font-bold text-primary text-lg">Yield (per $1,000)</div>
                                    <div className="flex w-6/12">
                                        <img src={annCoin} alt="" className="h-8 mr-4" />
                                        <div className="flex flex-col">
                                            <span className="font-bold">
                                                {format(
                                                    new BigNumber(item.rewardPerDay)
                                                        .dp(2)
                                                        .toString(10)
                                                )} ANN / Day
                                            </span>
                                            <span className="mt-2 text-primary">{item.allocPoint} allocPoint</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex mt-5 justify-between">
                                    <div>
                                        <span className="mb-2 font-bold text-primary text-lg">APY</span>
                                        <span className="font-bold mt-3.5 flex items-center">
                                            <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
                                            {format(
                                                new BigNumber(item.apy)
                                                    .dp(2)
                                                    .toString(10)
                                            )}%
                                        </span>
                                    </div>
                                    <div className="flex flex-col w-2/6">
                                        <span className="font-bold text-primary text-lg">Liquidity</span>
                                        <span className="mt-2 font-bold mt-3.5">
                                            ${format(
                                                new BigNumber(item.liquidity)
                                                    .dp(2)
                                                    .toString(10)
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex mt-5 justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-primary text-lg">Stacked</span>
                                        <span className="mt-2 font-bold mt-3.5">{item.staked}</span>
                                    </div>
                                    <div className="flex self-end w-2/6">
                                        <span className="text-primary">0 ANN / 0 ETH</span>
                                    </div>
                                </div>
                                <div className="flex mt-5 justify-between">
                                    <div>
                                        <span className="font-bold text-primary text-lg">Earned</span>
                                    </div>
                                    <div className="flex w-6/12">
                                        <img src={annCoin} alt="" className="mr-9 h-8" />
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.earned} ANN</span>
                                            <span className="mt-2 text-primary">No Rewards</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    className={`py-2.5 px-28 text-black font-bold 
                                        bgPrimaryGradient rounded-3xl mt-5 w-full 
                                        text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}`}
                                    href={
                                        `${item.type === 'annex_lp' 
                                            ? config.annexAddLiquidityURL 
                                            : config.pcsAddLiquidityURL}/${item.token0}/${item.token1}`
                                        }
                                    target="_new">Add Liquidity</a>
                                {
                                    new BigNumber(item.userData ? item.userData.allowance : 0).isGreaterThan(0) ? (
                                        <div className="flex justify-between">
                                            <button
                                                className={`py-2.5 px-14 text-black font-bold 
                                                    bgPrimaryGradient rounded-3xl mt-5 w-full 
                                                    text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}`}
                                                onClick={() => {

                                                }}>Stake</button>
                                            {
                                                new BigNumber(item.userData.stakedBalance).isGreaterThan(0) && (
                                                    <button
                                                        className={`py-2.5 px-14 text-black font-bold 
                                                            bgPrimaryGradient rounded-3xl mt-5 w-full 
                                                            text-2xl outline-none ${item.token1 === null ? 'invisible' : ''}`}
                                                        onClick={() => {

                                                        }}>UnStake</button>
                                                )
                                            }
                                        </div>
                                    ) : (
                                        <div className="mt-5 flex justify-center text-2xl text-primary cursor-pointer" onClick={() => {
                                            // it should be the transparent button
                                        }}>Approve Staking</div>
                                    )
                                }
                                
                            </div>
                        )
                    })
                }
                {/* </div> */}
            </div>
        </Styles>
    )
}

Cards.defaultProps = {
    settings: {},
};

const mapStateToProps = ({ account }) => ({
    account,
    settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
    const { setSetting, getMarketHistory } = accountActionCreators;

    return bindActionCreators(
        {
            setSetting,
            getMarketHistory,
        },
        dispatch,
    );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Cards);