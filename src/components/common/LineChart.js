import React from 'react';
// import { Line } from 'react-chartjs-2';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// const data = {
//   labels: ['1', '2'],
//   datasets: [
//     {
//       label: '',
//       data: [19, 2],
//       fill: false,
//       backgroundColor: 'rgba(255, 171, 45, 1)',
//       borderColor: 'rgba(255, 152, 0, 1)',
//     },
//   ],
// };

// const options = {
//   legend: {
//     display: false,
//   },
//   scales: {
//     yAxes: [
//       {
//         display: false,
//         scaleShowLabels: false,
//         gridLines: {
//           drawBorder: false,
//         },
//       },
//     ],
//     xAxes: [
//       {
//         gridLines: {
//           drawBorder: false,
//         },
//       },
//     ],
//   },
//   tooltips: {
//     callbacks: {
//       label: function (tooltipItem) {
//         return tooltipItem.yLabel;
//       },
//     },
//   },
// };
const data = [
  {
    name: '',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: '',
    uv: 3000,
    pv: 398,
    amt: 2210,
  },
];
// const LineChart = () => <Line data={data} options={options} />;
// export default LineChart;
export default function Chart({ width, height }) {
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
