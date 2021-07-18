import React, {useState} from 'react';
import {Switch, Route, useRouteMatch, Redirect, useHistory, useLocation} from 'react-router-dom';

import Layout from '../../layouts/MainLayout/MainLayout';
import SettingsModal from '../../components/common/SettingsModal';
import HistoryModal from '../../components/common/HistoryModal';
import Swap from './Swap';
import Liquidity from './Liquidity';
import AddLiquidity from "./AddLiquidity";
import PoolFinder from "./PoolFinder";
import {RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure} from "./redirects/addLiquidity";
import RedirectOldRemoveLiquidityPathStructure from "./redirects/removeLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";

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
        <Layout mainClassName="pt-10" title={'LIQUIDITY'}>
            <SettingsModal open={settingsOpen} onCloseModal={() => setSettingsOpen(false)} />
            <HistoryModal open={historyOpen} onCloseModal={() => setHistoryOpen(false)} />
            <div className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl">
                <div className="flex space-x-3 mt-14">
                    {buttons?.map((b) => (
                        <button
                            key={b.key}
                            className={`focus:outline-none py-2 px-12 rounded-3xl text-xl ${
                                pathname.includes(b.route)
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
        </Layout>
    );
}

export default Trade;
