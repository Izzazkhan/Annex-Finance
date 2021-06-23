import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';

import Layout from '../../layouts/MainLayout/MainLayout';

import Live from './Live';
import Past from './Past';
import Upcoming from './Upcoming';

function Auction() {
  const { path } = useRouteMatch();

  return (
    <Layout mainClassName="pt-10 min-h-screen" title={'Auction'}>
      <div className="bg-fadeBlack w-full flex flex-col justify-center items-center rounded-3xl">
        <Switch>
          <Switch>
            <Route exact strict path={`${path}/past`}>
              <Past />
            </Route>
            <Route exact strict path={`${path}/upcoming`}>
              <Upcoming />
            </Route>
            <Route exact strict path={`${path}/live`}>
              <Live />
            </Route>
            <Redirect to={`${path}/past`} />
          </Switch>
        </Switch>
      </div>
    </Layout>
  );
}

export default Auction;
