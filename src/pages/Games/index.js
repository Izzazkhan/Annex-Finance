import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
// import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout';

import { Barbell, CoinFlip, Dice, Roultte } from './containers'

function Games() {
    const { path } = useRouteMatch();
    return (
        <Layout mainClassName="pt-10 min-h-screen" title={'Games'}>
            {/* <Styles> */}
                <Switch>
                    <Route exact strict path={`${path}/barbell`} component={Barbell} />
                    <Route exact strict path={`${path}/roultte`} component={Roultte} />
                    <Route exact strict path={`${path}/coin-flip`} component={CoinFlip} />
                    <Route exact strict path={`${path}/dice`} component={Dice} />
                    <Redirect to={`${path}/barbell`} />
                </Switch>
            {/* </Styles> */}
        </Layout>
    );
}

export default Games;