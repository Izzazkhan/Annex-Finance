import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function Chart({ width, height, data, biddingSymbol }) {
  return (
    <div
      className="relative pt-10"
      style={{ width: '100%', height, border: '1px solid #2E2E2E', borderTop: 'none' }}
    >
      {/* <div className="absolute left-2 top-0 left-top flex flex-col">
        <div className="text-xs font-normal">Starting Price</div>
        <div className="text-base font-bold">
          {data[0].value} {biddingSymbol}
        </div>
      </div>
      <div className="absolute right-2 top-0 right-top flex flex-col text-right">
        <div className="text-xs font-normal">Reserve Price</div>
        <div className="text-base font-bold">
          {data[1].value} {biddingSymbol}
        </div>
      </div> */}
      <div className="absolute left-2 bottom-2 right-top flex flex-col text-left">
        <div className="text-xs font-normal text-icon">
          <span className="upcoming-icon"></span>Current Token Price
        </div>
        <div className="text-base font-bold">0 {biddingSymbol}</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* <XAxis dataKey="name" /> */}
          {/* <YAxis /> */}
          {/* <Tooltip /> */}
          <Line type="monotone" dataKey="value" stroke="rgba(255, 171, 45, 1)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
