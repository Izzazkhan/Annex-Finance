import React from 'react';
// import { Line } from 'react-chartjs-2';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 398,
    amt: 2210,
  }
];
// const LineChart = () => <Line data={data} options={options} />;
// export default LineChart;
export default function Chart({ width, height }) {
  console.log( width, height)
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="pv" stroke="rgba(255, 171, 45, 1)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
