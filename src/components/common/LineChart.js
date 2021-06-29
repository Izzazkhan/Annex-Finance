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
    <div className="relative pt-10" style={{ 'width': '100%', height,'border' : '1px solid #2E2E2E', 'border-top': 'none' }}>
      <div className="absolute left-2 top-0 left-top flex flex-col">
        <div className="text-xs font-normal">Starting Price</div>
        <div className="text-base font-bold">2 ETH</div>
      </div>
      <div className="absolute right-2 top-0 right-top flex flex-col text-right">
        <div className="text-xs font-normal">Reserve Price</div>
        <div className="text-base font-bold">2 ETH</div>
      </div>
      <div className="absolute left-2 bottom-2 right-top flex flex-col text-left">
        <div className="text-xs font-normal text-icon"><span className="upcoming-icon"></span>Current Token Price</div>
        <div className="text-base font-bold">0.510588 ETH</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
         
        >
          {/* <XAxis dataKey="name" /> */}
          {/* <YAxis /> */}
          <Line type="monotone" dataKey="pv" stroke="rgba(255, 171, 45, 1)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
