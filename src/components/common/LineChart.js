import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function Chart({ width, height, data }) {
  console.log(width, height);
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Line type="monotone" dataKey="pv" stroke="rgba(255, 171, 45, 1)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
