import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import routes from './RouteMap';
import Demo from '../pages/Demo';
import Dashboard from '../pages/Dashboard';
import Annex from '../pages/Annex';
import Farms from '../pages/Farms';
import Market from '../pages/Market';
import Pools from '../pages/Pools';
import Trade from '../pages/Trade';
import Auction from '../pages/Auction';
import Vault from '../pages/Vault';
import Vote from '../pages/Vote';
import NotFound from '../pages/NotFound';
import Web3ReactManager from '../components/common/Web3ReactManager';
import ApplicationUpdater from '../core/modules/application/updater';
import MulticallUpdater from '../core/modules/multicall/updater';
import TransactionUpdater from '../core/modules/transactions/updater';
import ListsUpdater from '../core/modules/lists/updater';

const Routes = () => {
  return (
    <Web3ReactManager>
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <Switch>
        <Route exact path="/" render={() => <Redirect to={routes.dashboard} />} />
        <Route exact path={routes.dashboard} component={Dashboard} />
        <Route exact path={routes.annex} component={Annex} />
        <Route exact path={routes.farms} component={Farms} />
        <Route exact path={routes.market} component={Market} />
        <Route exact path={routes.pools} component={Pools} />
        <Route path={routes.trade} component={Trade} />
        <Route path={routes.auction} component={Auction} />
        <Route exact path={routes.vault} component={Vault} />
        <Route exact path={routes.vote} component={Vote} />
        <Route exact path={routes.demo} component={Demo} />
        <Route component={NotFound} />
      </Switch>
    </Web3ReactManager>
  );
};

export default Routes;
