import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../layouts/MainLayout/MainLayout';

import Live from './List/Live';
import Past from './List/Past';
import Upcoming from './List/Upcoming';
import Detail from './Detail';
import CreateAuction from './Create';

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
    position: absolute;
    left: 0;
    height: 100%;
    .border {
      color: rgba(46, 46, 46, 1);
      margin-right: 15px;
      position: relative;
      width: 1px;
      margin: 0;
      height: calc(50% - 31px);
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
  .timer {
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 250px;
    top: calc(50% - 125px);
    background: black;
    border-radius: 50%;
  }
  .upcoming-icon {
    color: rgba(255, 152, 0, 1);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    background: rgba(255, 152, 0, 1);
    border: 1px solid #fff;
    z-index: 1;
  }
  .live-icon {
    color: #3dc01c;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    background: #3dc01c;
    z-index: 9;
    border: 1px solid #fff;
    z-index: 1;
  }
  .past-icon {
    color: #2b98d6;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    background: #2b98d6;
    z-index: 9;
    border: 1px solid #fff;
    z-index: 1;
  }
  .border-lightprimary {
    border-color: rgba(255, 185, 81, 1);
  }
  .text-blue {
    color: rgba(43, 152, 214, 1);
  }
  table {
    &.text-left {
      tr {
        th,
        td {
          text-align: left;
          padding-left: 20px;
        }
      }
    }
  }
  .graph {
    canvas {
      max-width: 100%;
    }
  }
  .input-with-button {
    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    button {
      right: 0;
      margin-left: -7px;
    }
  }
  .text-icon {
    .upcoming-icon {
      width: 9px;
      height: 9px;
      margin-right: 3px;
    }
  }
  .rangeslider {
    background: #343435;
  }
  .rangeslider-horizontal {
    height: 5px;
    border-radius: 20px;
  }
  .rangeslider-horizontal .rangeslider__fill {
    background-color: #ff9800;
  }
  .rangeslider-horizontal .rangeslider__handle {
    width: 14px;
    height: 14px;
    border-radius: 30px;
    background-color: #ff9800;
  }
  .rangeslider-horizontal .rangeslider__handle::after {
    display: none;
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
          <Route exact strict path={`${path}/create`}>
            <CreateAuction />
          </Route>
          <Redirect to={`${path}/past`} />
        </Switch>
      </Styles>
    </Layout>
  );
}

export default Auction;
