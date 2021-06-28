import React from 'react';
import { Line } from 'react-chartjs-2';

const data = {
  labels: ['1', '2'],
  datasets: [
    {
      label: '',
      data: [19, 2],
      fill: false,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgba(255, 99, 132, 0.2)',
    },
  ],
};

const options = {
  legend: {
    display: false,
  },
  scales: {
    yAxes: [
      {
        display: false,
        scaleShowLabels: false,
        gridLines: {
          drawBorder: false,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          drawBorder: false,
        },
      },
    ],
  },
  tooltips: {
    callbacks: {
      label: function(tooltipItem) {
        return tooltipItem.yLabel;
      }
    }
  }
};

const LineChart = () => <Line data={data} options={options} />;
export default LineChart;
