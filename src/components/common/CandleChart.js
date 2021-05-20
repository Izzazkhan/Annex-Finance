import React, {useMemo} from 'react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const colors = [
  '#2ca02c',
  '#d62728',
];
const Candlestick = (props) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    low,
    high,
    openClose: [open, close],
  } = props;
  const isGrowing = open < close;
  const color = isGrowing ? 'green' : 'red';
  const ratio = Math.abs(height / (open - close));
  return (
    <g stroke={color} fill={color} strokeWidth="2">
      <path
        d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
      />
      {/* bottom line */}
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - low) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - low) * ratio}
          `}
        />
      )}
      {/* top line */}
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - high) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - high) * ratio}
          `}
        />
      )}
    </g>
  );
};

const CustomShapeBarChart = ({rawData}) => {
  const data = useMemo(() => {
    return rawData || []
  }, [rawData])
  const minValue = data.reduce((minValue, { borrowApy, supplyApy }) => {
    const currentMin = Math.min(borrowApy, supplyApy);
    return minValue === null || currentMin < minValue ? currentMin : minValue;
  }, null);
  const maxValue = data.reduce((maxValue, { borrowApy, supplyApy }) => {
    const currentMax = Math.max(borrowApy, supplyApy);
    return currentMax > maxValue ? currentMax : maxValue;
  }, minValue);


  const CustomizedAxisTick = (props) => {
    const { x, y, stroke, payload } = props;

    return (
      <g className="hidden" transform={`scale(0)`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          width={600}
          height={300}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d62728" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#d62728" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ca02c" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2ca02c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <Area
            dataKey="borrowApy"
            fill="url(#colorPv)"
            stroke={'#2ca02c'}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 2]} />
            ))}
          </Area>
          <Area
            dataKey="supplyApy"
            fill="url(#colorUv)"
            stroke={'#d62728'}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 2]} />
            ))}
          </Area>
          <YAxis domain={[minValue, maxValue]} orientation="right" />
          <XAxis dataKey="ts" tick={<CustomizedAxisTick />} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomShapeBarChart;
