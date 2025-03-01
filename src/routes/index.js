import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Route, Redirect, BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';

import routes from './RouteMap';
import Dashboard from '../pages/Dashboard';
import Annex from '../pages/Annex';
import Auction from '../pages/Auction';
import Farms from '../pages/Farms';
import Market from '../pages/Market';
import MarketDetails from '../pages/MarketDetails';
import Vote from '../pages/Vote';
import AllProposals from '../pages/Vote/AllProposals';
import VoteOverview from '../pages/Vote/VoteOverview';
import ProposerOverview from '../pages/Vote/ProposerOverview';
import Leaderboard from '../pages/Vote/Leaderboard';
import Pools from '../pages/Pools/index';
import Trade from '../pages/Trade';
import NotFound from '../pages/NotFound';
import Web3ReactManager from '../components/common/Web3ReactManager';
import ApplicationUpdater from '../core/modules/application/updater';
import MulticallUpdater from '../core/modules/multicall/updater';
import TransactionUpdater from '../core/modules/transactions/updater';
import ListsUpdater from '../core/modules/lists/updater';
import Games from 'pages/Games';
import { useActiveWeb3React, useDetectChainChange } from 'hooks';
import Faucet from 'pages/Faucet';
import CommingSoon from 'pages/CommingSoon';

const Routes = () => {
  const { chainId } = useActiveWeb3React();
  const history = useHistory();

  const [isInDev, setIsInDev] = useState(false)
  useDetectChainChange((chainId) => {
    if (chainId == 25) {
      setIsInDev(true)
    } else {
      setIsInDev(false)
    }
    if ((window.location.pathname.includes(routes.auction) || window.location.pathname.includes(routes.games)) && ['339', '25'].includes(chainId)) {
      history.push(routes.dashboard)
      location.reload()
    }
    if ((window.location.pathname.includes(routes.faucet)) && !['339'].includes(chainId)) {
      history.push(routes.dashboard)
      location.reload()
    }
  })
  return (
    <Web3ReactManager>
      <ListsUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <Router>
        <Switch>
          <Route exact path="/" render={() => <Redirect to={routes.dashboard} />} />
          <Route exact path={routes.farms} component={Farms} />
          <Route path={routes.trade} component={Trade} />
          {[339].includes(chainId) && (
            <Route path={`${routes.faucet}`} component={Faucet} />
          )}
          <Route exact path={routes.dashboard} component={Dashboard} />
          <Route exact path={routes.annex} component={Annex} />
          <Route exact path={routes.market.index} component={Market} />
          <Route exact path={routes.market.marketDetails} component={MarketDetails} />
          <Route exact path={routes.pools} component={Pools} />
          <Route exact path={routes.vote.index} component={Vote} />
          <Route exact path={routes.vote.allProposals} component={AllProposals} />
          <Route exact path={routes.vote.voteOverview} component={VoteOverview} />
          <Route exact path={routes.vote.proposerOverview} component={ProposerOverview} />
          <Route exact path={routes.vote.leaderboard} component={Leaderboard} />
          {![339, 25].includes(chainId) && (
            <>
              <Route path={routes.games} component={Games} />
              <Route path={`${routes.auction}`} component={Auction} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </Router>
    </Web3ReactManager>
  );
};

export default Routes;
