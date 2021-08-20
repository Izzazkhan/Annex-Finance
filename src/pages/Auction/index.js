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
      background: rgba(46, 46, 46, 1);
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
      background: rgba(46, 46, 46, 1);
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
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 200px;
    top: calc(50% - 100px);
    background: black;
    border-radius: 50%;
    z-index: 9;
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
    .chart {
      margin-left: -40px;
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
  .create-auction {
    input::placeholder {
      color: #fff;
    }
    input::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
    textarea::placeholder {
      color: #fff;
    }
    .focus-visible {
      border-color: #ff9800;
    }
  }
  .custom-check {
    .container {
      display: block;
      position: relative;
      padding-left: 35px;
      cursor: pointer;
    }
    .container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: -2px;
      left: 0;
      height: 25px;
      width: 25px;
      background-color: #101016;
      border: 1px solid #717579;
      &:hover {
        .text {
          display: block !important;
        }
      }
      .text {
        position: absolute;
        top: -33px;
        background: #3e3d3d;
        padding: 3px 6px;
        right: -18px;
        font-size: 12px;
      }
    }

    .container input:checked ~ .checkmark {
      background-color: #ff9800;
      border: 1px solid #ff9800;
      &.green {
        background-color: #50bf50;
        border: 1px solid #50bf50;
        .text {
          background-color: #50bf50;
        }
      }
      &.red {
        background-color: #f0350e;
        border: 1px solid #f0350e;
        .text {
          background-color: #f0350e;
        }
      }
    }

    .checkmark:after {
      content: '';
      position: absolute;
      display: none;
    }

    .container input:checked ~ .checkmark:after {
      display: block;
    }

    .container .checkmark:after {
      left: 9px;
      top: 5px;
      width: 5px;
      height: 10px;
      border: solid black;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
  }
  td {
    .custom-check {
      .container {
        display: block;
        position: relative;
        padding-left: 0;
        cursor: pointer;
        .checkmark:after {
          left: 7px;
          top: 4px;
        }
      }
      .disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .checkmark {
        height: 20px;
        width: 20px;
        top: -10px;
        right: 0;
        margin: 0 auto;
      }
    }
  }
  .chart {
    span.label.info {
      position: absolute;
      top: 0;
    }
    .label.info.success {
      right: 0;
      /* color: #565656; */
    }
    .info.success span {
      background: #c4c4c4;
      width: 12px;
      height: 12px;
      display: inline-block;
      margin-right: 5px;
    }
    .label.info.unsuccess {
      left: 40px;
      /* color: #c4c4c4; */
    }
    .label.info.unsuccess span {
      background: #565656;
      width: 12px;
      height: 12px;
      display: inline-block;
      margin-right: 5px;
    }
    .recharts-default-tooltip {
      padding: 0 10px !important;
      background: #ffffff !important;
      border-color: #ffffff !important;
      .recharts-tooltip-label {
        display: none;
      }
      .recharts-tooltip-item {
        font-size: 12px;
        color: #ff9800 !important;
      }
    }
  }
  .tooltip {
    margin-bottom: 5px;
    .label {
      display: none;
      position: absolute;
      top: -6px;
      left: 30px;
      color: #e2e2e2;
    }
  }

  .tooltip img:hover + .label {
    display: block;
  }
  .completed-icon {
    background: #04af04;
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
  }
  .upcoming-icon {
    background: #2b98d6;
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
  }
  .inprogress-icon {
    background: #ffab2d;
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
  }
  .form-section {
    border-bottom: 1px solid #696969;
    margin-bottom: 20px;
}
`;

function Auction() {
  const { path } = useRouteMatch();
  return (
    <Layout mainClassName="pt-10 min-h-screen" title={'Auction'}>
      <Styles>
        <Switch>
          <Route exact strict path={`${path}/past`} component={Past} />
          <Route exact strict path={`${path}/upcoming`} component={Upcoming} />
          <Route exact strict path={`${path}/live`} component={Live} />
          <Route exact strict path={`${path}/detail/:id`} component={Detail} />
          <Route exact strict path={`${path}/create`} component={CreateAuction} />
          <Redirect to={`${path}/past`} />
        </Switch>
      </Styles>
    </Layout>
  );
}

export default Auction;
