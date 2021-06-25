import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout';

import Live from './List/Live';
import Past from './List/Past';
import Upcoming from './List/Upcoming';
import Detail from './Detail';

const Styles = styled.div`
  .graph-bottom-label {
    .border {
      height: 1px;
      color: rgba(46, 46, 46, 1);
      margin-right: 15px;
      position: relative;
      width: 60px;
      &.first {
        &::before {
          content: '';
          position: absolute;
          left: -1px;
          height: 20px;
          width: 2px;
          color: rgba(46, 46, 46, 1);
          background: rgba(46, 46, 46, 1);
          top: -9px;
        }
      }
      &.last {
        &::before {
          content: '';
          position: absolute;
          right: -1px;
          height: 20px;
          width: 2px;
          color: rgba(46, 46, 46, 1);
          background: rgba(46, 46, 46, 1);
          top: -9px;
        }
      }
    }
    .label {
      font-size: 12px;
      text-align: center;
    }
  }
  .graph-left-label {
    float: left;
    width: 40px;
    .border {
      height: 105px;
      color: rgba(46, 46, 46, 1);
      margin-right: 15px;
      position: relative;
      width: 1px;
      margin: 0;
      &.first {
        &::before {
          content: '';
          position: absolute;
          left: -9px;
          height: 2px;
          width: 20px;
          color: rgba(46, 46, 46, 1);
          background: rgba(46, 46, 46, 1);
          top: -1px;
        }
      }
      &.last {
        &::before {
          content: '';
          position: absolute;
          left: -9px;
          height: 2px;
          width: 20px;
          color: rgba(46, 46, 46, 1);
          background: rgba(46, 46, 46, 1);
          bottom: -1px;
        }
      }
    }
    .label {
      font-size: 12px;
      text-align: center;
      b {
        font-size: 18px;
      }
    }
  }
  .timer{
    border-radius: 50%;
    width: 235px;
    height: 235px;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    top: 0;
    bottom: 0;
    border: 10px solid #1c1c21;
    &::before{
      content: '';
      position:absolute;
      right:0;

    }
  }
  .upcoming-icon {
    color: rgba(255, 152, 0, 1);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    background: rgba(255, 152, 0, 1);
}
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
          <Route exact strict path={`${path}/detail`}>
            <Detail />
          </Route>
          <Redirect to={`${path}/past`} />
        </Switch>
      </Styles>
    </Layout>
  );
}

export default Auction;
