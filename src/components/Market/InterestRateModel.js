import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connectAccount } from "../../core";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart } from "recharts";
import { getAbepContract, getInterestModelContract, methods } from "../../utilities/ContractService";
import BigNumber from "bignumber.js";
import { checkIsValidNetwork } from "../../utilities/common";
import styled from "styled-components";

let flag = false;

const Wrapper = styled.div`
  .percent-wrapper {
    position: relative;
    width: 100%;
    .line {
      width: calc(100% - 60px);
      height: 2px;
      margin-left: 30px;
      background-color: #FFAB2D;
    }

    .current-percent {
      position: absolute;
      font-size: 12px;
      color: #FFAB2D;
      &::before {
        position: absolute;
        content: ' ';
        width: 2px;
        margin-left: 1px;
        height: 20px;
        top: 5px;
        background-color: #FFAB2D;
      }
      p {
        margin-top: 30px;
        margin-left: -20px;
        font-weight: bold;
      }
    }

    .ticker-percent {
      position: absolute;
      top: -25px;
      margin-left: -18px;
      color: #FFAB2D;
      font-size: 14px;
    }

    .ticker-line {
      position: absolute;
      width: 2px;
      height: 100%;
      background-color: #FFF;

      &::before {
        position: absolute;
        content: ' ';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        top: -3px;
        left: -3px;
        z-index: 10;
        background-color: #FFAB2D;
      }
      &::after {
        position: absolute;
        content: ' ';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        top: -5px;
        left: -5px;
        background-color: #FFF;
      }
    }
  }

  .recharts-cartesian-grid {
    opacity: 0;
  }
  .recharts-responsive-container {
    .recharts-surface {
      // margin-top: 40px;
    }
  }
  @media only screen and (max-width: 768px) {
  }
`;
const InterestRateModel = ({ settings, currentAsset }) => {
  const [graphData, setGraphData] = useState([]);
  const [tickerPos, setTickerPos] = useState(null);
  const [percent, setPercent] = useState(null);
  const [currentPercent, setCurrentPercent] = useState(0);
  const [currentPos, setCurrentPos] = useState(30);
  const [maxY, setMaxY] = useState(0);

  const CustomizedAxisTick = ({ x, y }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16}>
        </text>
      </g>
    );
  };

  const getGraphData = async asset => {
    flag = true;
    const abepContract = getAbepContract(asset);
    let [interestRateModel, cash] = await Promise.all([
      methods.call(
        abepContract.methods.interestRateModel,
        []
      ),
      methods.call(abepContract.methods.getCash, []),
    ]);
    const interestModelContract = getInterestModelContract(interestRateModel);
    // const multiplierPerBlock = await methods.call(
    //   interestModelContract.methods.multiplierPerBlock,
    //   []
    // );
    // const baseRatePerBlock = await methods.call(
    //   interestModelContract.methods.baseRatePerBlock,
    //   []
    // );
    const data = [];
    const marketInfo = settings.markets.find(
      item => item.underlyingSymbol.toLowerCase() === asset.toLowerCase()
    );
    // const oneMinusReserveFactor = new BigNumber(1).minus(
    //   new BigNumber(marketInfo.reserveFactor).div(new BigNumber(10).pow(18))
    // );
    // Get Current Utilization Rate
    cash = new BigNumber(cash).div(new BigNumber(10).pow(18));
    const borrows = new BigNumber(marketInfo.totalBorrows2);
    const reserves = new BigNumber(marketInfo.totalReserves || 0).div(
      new BigNumber(10).pow(settings.decimals[asset].token)
    );
    const currentUtilizationRate = borrows.div(
      cash.plus(borrows).minus(reserves)
    );

    const tempCurrentPercent = parseInt(
      +currentUtilizationRate.toString(10) * 100,
      10
    );
    setCurrentPercent(tempCurrentPercent || 0);
    const lineElement = document.getElementById('line');
    if (lineElement) {
      setCurrentPos(30 + (lineElement.clientWidth * tempCurrentPercent) / 100);
    }
    const urArray = [];
    for (let i = 1; i <= 100; i += 1) {
      urArray.push(i / 100);
    }
    const borrowRes = await Promise.all(
      urArray.map(ur =>
        methods.call(interestModelContract.methods.getBorrowRate, [
          new BigNumber(1 / ur - 1)
            .times(1e4)
            .dp(0)
            .toString(10),
          1e4,
          0
        ])
      )
    );
    const supplyRes = await Promise.all(
      urArray.map(ur =>
        methods.call(interestModelContract.methods.getSupplyRate, [
          new BigNumber(1 / ur - 1)
            .times(1e4)
            .dp(0)
            .toString(10),
          1e4,
          0,
          marketInfo.reserveFactor.toString(10)
        ])
      )
    );
    urArray.forEach((ur, index) => {
      // supply apy, borrow apy
      const blocksPerDay = 20 * 50 * 24;
      const daysPerYear = 365;
      const mantissa = 1e18;
      const supplyBase = new BigNumber(supplyRes[index])
        .div(mantissa)
        .times(blocksPerDay)
        .plus(1);
      const borrowBase = new BigNumber(borrowRes[index])
        .div(mantissa)
        .times(blocksPerDay)
        .plus(1);
      const supplyApy = supplyBase
        .pow(daysPerYear - 1)
        .minus(1)
        .times(100);
      const borrowApy = borrowBase
        .pow(daysPerYear - 1)
        .minus(1)
        .times(100);

      data.push({
        percent: ur,
        supplyApy: supplyApy.dp(2, 1).toString(10),
        borrowApy: borrowApy.dp(2, 1).toString(10)
      });
    });

    setMaxY(Number(data.slice(-1)[0].borrowApy) + 1);
    setGraphData(data);
  };

  useEffect(() => {
    if (
      currentAsset &&
      settings.markets &&
      settings.markets.length > 0 &&
      settings.decimals &&
      checkIsValidNetwork(settings.walletType) &&
      !flag
    ) {
      getGraphData(currentAsset);
    }
  }, [settings.markets, currentAsset]);

  useEffect(() => {
    flag = false;
  }, [currentAsset]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length !== 0) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ color: '#de4993', fontWeight: 'bold' }}>
            {`${new BigNumber(payload[0].value).dp(8, 1)}% Borrow APY`}
          </p>
          <p className="label" style={{ color: '#9dd562', fontWeight: 'bold' }}>
            {`${new BigNumber(payload[1].value).dp(8, 1)}% Supply APY`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleMouseMove = e => {
    const graphElement = document.getElementById('percent-wrapper');
    const lineElement = document.getElementById('line');
    if (graphElement && lineElement) {
      const x = e.pageX - graphElement.offsetLeft - 30;
      const tempPercent = (x * 100) / lineElement.clientWidth;
      if (tempPercent >= 0 && tempPercent <= 100) {
        setPercent(parseInt(tempPercent, 10));
        setTickerPos(e.pageX - graphElement.offsetLeft);
      } else if (tempPercent < 0) {
        setPercent(0);
      } else if (tempPercent >= 100) {
        setPercent(100);
      }
      setCurrentPos(30 + (lineElement.clientWidth * currentPercent) / 100);
    }
  };

  return (
    <Wrapper className="bg-black rounded-2xl p-4 col-span-3">
      <div className="text-white font-bold 2xl:text-20">Interest Rate Model</div>
      <div className="text-white text-sm 2xl:text-18 mb-8">Utilization vs. APY</div>
      <div
        id="percent-wrapper"
        className="percent-wrapper"
        onMouseMove={handleMouseMove}
      >
        <div id="line" className="line" />
        {graphData.length !== 0 && (
          <div className="current-percent" style={{ left: currentPos || 30 }}>
            <p>Current</p>
          </div>
        )}
        <div
          className="ticker-percent"
          style={{ left: tickerPos || currentPos }}
        >
          {percent === null ? currentPercent : percent} %
        </div>
        <div
          id="ticker-line"
          className="ticker-line"
          style={{ left: tickerPos || currentPos || 30 }}
        />
        <ResponsiveContainer height={400}>
          <LineChart
            data={graphData}
            height={400}
            margin={{
              top: 40,
              right: 30,
              left: 30,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient id="barRedColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f06517" />
                <stop offset="100%" stopColor="#de4993" />
              </linearGradient>
              <linearGradient id="barGreenColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9dd562" />
                <stop offset="100%" stopColor="#9dd562" />
              </linearGradient>
            </defs>
            <CartesianGrid />
            <XAxis
              dataKey="percent"
              tickLine={false}
              axisLine={false}
              tick={<CustomizedAxisTick />}
            />
            <YAxis domain={[0, maxY]} hide />
            <Tooltip cursor={false} content={<CustomTooltip />} />
            <Line
              type="monotone"
              dot={false}
              dataKey="borrowApy"
              stroke="url(#barRedColor)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dot={false}
              dataKey="supplyApy"
              stroke="url(#barGreenColor)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Wrapper>
  )
}

InterestRateModel.defaultProps = {
  currentAsset: '',
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

export default compose(
  withRouter,
  connectAccount(mapStateToProps, undefined)
)(InterestRateModel);
