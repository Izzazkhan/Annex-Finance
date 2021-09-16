import React, { Fragment } from 'react';
import styled from 'styled-components';
import annCoin from '../../assets/images/coins/ann.png'
import ethCoin from '../../assets/images/coins/ceth.png'
import upArrow from '../../assets/icons/arrowUp.png'

const Styles = styled.div`
    width: 100%;
    overflow: auto;
    background-color: #101016;
    border-radius: 1.5rem;
`;

function Cards({ data, addLiquidity }) {

    return (
        <Styles>
            <div className="p-4 flex flex-row flex-wrap">
                {/* <div> */}
                    {
                        data.map((item, key) => {
                            return (
                                <div key={key} className="text-white text-base py-7 px-6 m-6 rounded-3xl border border-primary">
                                    <div className="flex">
                                        <div className="mr-3 relative h-14 w-14">
                                            <img src={annCoin} alt="" className="h-8" />
                                            <img src={ethCoin} alt="" className="h-10 absolute right-0 bottom-0" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.coin} Token Wrapped ANN</span>
                                            <span className="mt-2">ANN - {item.coinAbbr}</span>
                                        </div>
                                    </div>
                                    <div className="flex mt-7 justify-between">
                                        <div className="font-bold text-primary text-lg">Yield (per $1,000)</div>
                                        <div className="flex w-6/12">
                                            <img src={annCoin} alt="" className="h-8 mr-9" />
                                            <div className="flex flex-col">
                                                <span className="font-bold">{item.yield} ANN / Day</span>
                                                <span className="mt-2 text-primary">100 allocPoint</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex mt-5 justify-between">
                                        <div>
                                            <span className="mb-2 font-bold text-primary text-lg">APY</span>
                                            <span className="font-bold mt-3.5 flex items-center">
                                                <img src={upArrow} alt="up" className="mr-3 h-3 md:h-4" />
                                                {item.APY}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col w-2/6">
                                            <span className="font-bold text-primary text-lg">Liquidity</span>
                                            <span className="mt-2 font-bold mt-3.5">{item.liquidity}</span>
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
                                    <button className="py-2.5 px-28 text-black font-bold 
                                    bgPrimaryGradient rounded-3xl mt-5 w-full text-2xl outline-none" onClick={addLiquidity}>Add Liquidity</button>
                                    <div className="mt-5 flex justify-center text-2xl text-primary cursor-pointer">Approve Staking</div>
                                </div>
                            )
                        })
                    }
                {/* </div> */}
            </div>
        </Styles>
    )
}

export default Cards