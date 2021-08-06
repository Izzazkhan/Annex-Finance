import React, { useState } from 'react';
import { Switch, Route, useRouteMatch, Redirect, useHistory, useLocation } from 'react-router-dom';

import Layout from '../../layouts/MainLayout/MainLayout';
import SettingsModal from '../../components/common/SettingsModal';
import HistoryModal from '../../components/common/HistoryModal';
import Swap from './Swap';
import Liquidity from './Liquidity';
import AddLiquidity from "./AddLiquidity";
import PoolFinder from "./PoolFinder";
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from "./redirects/addLiquidity";
import RedirectOldRemoveLiquidityPathStructure from "./redirects/removeLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import ANN from '../../assets/images/coins/ann-new.png';
import BTC from '../../assets/images/coins/btc-new.png';
import BTCB from '../../assets/images/coins/btcb-new.png';
import UpArrow from '../../assets/images/up-arrow.png';
import DownArrow from '../../assets/images/down-arrow.png';
import coins from '../../assets/icons/coins.svg';
import styled from 'styled-components';


const Styles = styled.div`
  .sidebar{
      .scroll{
          height: 750px;
          overflow: hidden;
          overflow-y: auto;
          &::-webkit-scrollbar {
            width: 10px;
          }
            &::-webkit-scrollbar-track {
            background: #000; 
            border: 0.5px solid #282525;
            box-shadow: none;
          }
          &::-webkit-scrollbar-thumb {
            background-color: #282525;    
            border-radius: 20px;     
            border: 0.5px solid #FF9800;  
          }
        }
        &.right{
            .scroll{
                direction: rtl;
                >div{
                    direction: ltr;
                }
            }
        }
    }
`;


function Trade() {
    const { pathname, search } = useLocation();
    const { path } = useRouteMatch();
    const history = useHistory();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const buttons = [
        { key: 1, title: 'Swap', tab: 'swap', route: `${path}/swap` },
        { key: 2, title: 'Liquidity', tab: 'liquidity', route: `${path}/liquidity` },
    ];

    return (
        <Styles>
            <Layout mainClassName="pt-10" title={'LIQUIDITY'}>
                <SettingsModal open={settingsOpen} onCloseModal={() => setSettingsOpen(false)} />
                <HistoryModal open={historyOpen} onCloseModal={() => setHistoryOpen(false)} />
                <div className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl 
            grid grid-cols-1 gap-y-6 lg:grid-cols-8 lg:gap-x-6 mt-8 p-5">
                    <div className="col-span-2 py-8 px-5 bg-black rounded-3xl sidebar">
                        <div className="text-white text-xl font-bold p-5 pt-6">Liquidity By </div>
                        <div className=" scroll pr-2">
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className="col-span-4">
                        <div className="flex space-x-3 mt-14 justify-center">
                            {buttons?.map((b) => (
                                <button
                                    key={b.key}
                                    className={`focus:outline-none py-2 px-12 rounded-3xl text-xl ${pathname.includes(b.route)
                                        ? 'text-black font-bold bgPrimaryGradient'
                                        : 'text-white bg-black border border-solid border-gray'
                                        }`}
                                    onClick={() => {
                                        history.push(b.route);
                                    }}
                                >
                                    {b.title}
                                </button>
                            ))}
                        </div>
                        <Switch>
                            <Switch>
                                <Route exact strict path={`${path}/swap`}>
                                    <Swap
                                        onSettingsOpen={() => setSettingsOpen(true)}
                                        onHistoryOpen={() => setHistoryOpen(true)}
                                    />
                                </Route>
                                <Route exact strict path={`${path}/liquidity`}>
                                    <Liquidity
                                        onSettingsOpen={() => setSettingsOpen(true)}
                                        onHistoryOpen={() => setHistoryOpen(true)}
                                    />
                                </Route>
                                <Route exact strict path={`${path}/liquidity/remove`} component={RemoveLiquidity} />
                                <Route
                                    exact
                                    strict
                                    path={`${path}/liquidity/remove/:tokens`}
                                    component={RedirectOldRemoveLiquidityPathStructure}
                                />
                                <Route exact path={`${path}/liquidity/add`} component={AddLiquidity} />
                                <Route exact path={`${path}/liquidity/find`} component={PoolFinder} />
                                <Route
                                    exact
                                    path={`${path}/liquidity/add/:currencyIdA`}
                                    component={RedirectOldAddLiquidityPathStructure}
                                />
                                <Route
                                    exact
                                    path={`${path}/liquidity/add/:currencyIdA/:currencyIdB`}
                                    component={RedirectDuplicateTokenIds}
                                />
                                <Redirect to={`${path}/swap`} />
                            </Switch>
                        </Switch>

                    </div>
                    <div className="col-span-2 py-8 px-5 bg-black rounded-3xl sidebar right ">
                        <div className="text-white text-xl font-bold p-5 pt-6">24hrs Change</div>
                        <div className=" scroll pl-2">
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-t border-b border-white
                            text-white text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTC} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={DownArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white mb-4">
                                <div className="flex items-center justify-center py-3 px-3">
                                    <img width="14px" src={BTC} alt="" />
                                    <div className="text-white font-bold text-sm mx-5">BTC - ANN</div>
                                    <img width="14px" src={ANN} alt="" />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 bgPrimaryGradient
                            text-black text-xs" style={{ 'borderColor': '#2E2E2E' }}>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={BTCB} alt="" /> 1 BTC = 4.11 ANN
                                    </div>
                                    <div className="flex items-center">
                                        <img className="mr-1" width="14px" src={ANN} alt="" /> 1 ANN = 0.001 BTC
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 px-3 text-white text-xs">
                                    <div className="flex flex-col  font-bold">
                                        <div className="flex ">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                            </div>Liquity</div>
                                        <div className="flex items-center my-2">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={coins} alt="" />
                                            </div>$511.843M</div>
                                        <div className="flex items-center">
                                            <div className="mr-2" style={{ 'width': '14px' }}>
                                                <img className="" src={UpArrow} alt="" />
                                            </div>143.94%</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className=" font-bold">LP Reward APR</div>
                                        <div className="flex text-white font-bold my-2">143.94%</div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                </div>
            </Layout >
        </Styles>
    );
}

export default Trade;
