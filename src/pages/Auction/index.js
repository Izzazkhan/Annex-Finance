import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout';

import Live from './Live';
import Past from './Past';
import Upcoming from './Upcoming';

const Styles = styled.div`

`;

function Auction() {
  const { path } = useRouteMatch();

  return (
    <Layout mainClassName="pt-10 min-h-screen" title={'Auction'}>
        <Styles>
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
        </Styles>
    </Layout>
  );
}

export default Auction;
