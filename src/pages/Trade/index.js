import React, {useState} from 'react';
import {Switch, Route, useRouteMatch, Redirect, useHistory} from 'react-router-dom';

import Layout from '../../layouts/MainLayout/MainLayout';
import SettingsModal from '../../components/common/SettingsModal';
import HistoryModal from '../../components/common/HistoryModal';
import Swap from './Swap';
import Liquidity from './Liquidity';
import AddLiquidity from "./AddLiquidity";
import {RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure} from "./redirects/addLiquidity";

function Trade() {
    const { path } = useRouteMatch();
    const history = useHistory();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [tab, setTab] = useState('swap');

    const buttons = [
        { key: 1, title: 'Swap', tab: 'swap', route: `${path}/swap` },
        { key: 2, title: 'Liquidity', tab: 'liquidity', route: `${path}/liquidity` },
    ];

    return (
        <Layout mainClassName="pt-10" title={'LIQUIDITY'}>
            <SettingsModal open={settingsOpen} onCloseModal={() => setSettingsOpen(false)} />
            <HistoryModal open={historyOpen} onCloseModal={() => setHistoryOpen(false)} />
            <div className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl">
                <div className="flex space-x-3 mt-14">
                    {buttons?.map((b) => (
                        <button
                            key={b.key}
                            className={`focus:outline-none py-2 px-12 rounded-3xl text-xl ${
                                b.tab === tab
                                    ? 'text-black font-bold bgPrimaryGradient'
                                    : 'text-white bg-black border border-solid border-gray'
                            }`}
                            onClick={() => {
                                setTab(b.tab);
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
                        {/*<Route exact strict path={`${path}/remove`} component={RemoveLiquidity} />*/}
                        {/*<Route*/}
                        {/*    exact*/}
                        {/*    strict*/}
                        {/*    path={`${path}/remove/:tokens`}*/}
                        {/*    component={RedirectOldRemoveLiquidityPathStructure}*/}
                        {/*/>*/}
                        <Route exact path={`${path}/liquidity/add`} component={AddLiquidity} />
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
        </Layout>
    );
}

export default Trade;
