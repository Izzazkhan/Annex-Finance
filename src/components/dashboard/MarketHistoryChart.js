import styled from "styled-components";
import React, {useEffect, useMemo, useRef, useState} from "react";
import { Line, Bar } from 'react-chartjs-2';


const TYPES = {
    Supply: "SUPPLY",
    Borrow: "BORROW"
}


const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add('market-chart-tooltip')
        tooltipEl.style.opacity = 1;
        tooltipEl.style.transform = 'translate(-50%, 0)';

        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
};

const externalTooltipHandler = (context) => {
    // Tooltip Element
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    // Set Text
    if (tooltip.body) {
        const bodyLines = tooltip.body.map(b => b.lines);

        const tableBody = document.createElement('div');
        tableBody.classList.add("flex", "flex-col", "items-center", "justify-center", "text-center");
        bodyLines.forEach((body, i) => {
            const newBody = body[0].split(":");
            const span1 = document.createElement('span');
            const text1 = document.createTextNode(newBody[1]);

            const span2 = document.createElement('span');
            const text2 = document.createTextNode(newBody[0]);

            span1.appendChild(text1);
            span2.appendChild(text2);
            tableBody.appendChild(span1);
            tableBody.appendChild(span2);
        });

        // Remove old children
        while (tooltipEl.firstChild) {
            tooltipEl.firstChild.remove();
        }

        // Add new children
        tooltipEl.appendChild(tableBody);
    }

    const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.transform = 'translate(-50%, -120%)';
};

const options = {
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false,
            external: externalTooltipHandler
        }
    },
    scales: {
        y: {
            position: 'right',
            color: "#FFF",
            font: {
                size: 24
            }
        },
        x: {
            display: false,
        }
    },
    maintainAspectRatio: false,
    responsive: true,
}


const MarketHistoryChart = ({
    data,
    type,
    withANN
}) => {
    const lineData = useMemo(() => {
        const field = type === TYPES.Supply
            ? (withANN ? 'supplyAnnexApy' : 'supplyApy')
            : (withANN ? 'borrowAnnexApy' : 'borrowApy');

        const filteredData = data?.filter(item => item?.[field] < Infinity)

        const result = {
            labels: filteredData?.map(item => item?.createdAt),
            datasets: [{
                label: type === TYPES.Supply ? "Supply APY" : "Borrow APY",
                data: filteredData?.map(item => Number(item?.[field]) || 0.0000),
                fill: false,
                backgroundColor: '#FFAB2D',
                borderColor: '#FFAB2D',
                borderWidth: 12,
                pointRadius: 0,
                pointHitRadius: 6,
                pointBorderWidth: 0,
                tension: 0.1
            }]
        }

        return result
    }, [data, type, withANN])


    const barData = useMemo(() => {
        const field = type === TYPES.Supply
            ? 'totalSupply'
            : 'totalBorrow';

        const filteredData = data?.filter(item => item?.[field] < Infinity)

        const result = {
            labels: filteredData?.map(item => item?.createdAt),
            datasets: [{
                label: type === TYPES.Supply ? "Total Supply" : "Total Borrow",
                data: filteredData?.map(item => Number(item?.[field]) || 0.0000),
                fill: false,
                backgroundColor: 'rgba(241, 153, 32, 0.20)',
                borderColor: 'rgba(241, 153, 32, 0.20)',
                hoverBackgroundColor: "rgba(241, 153, 32, 0.82)",
                hoverBorderWidth: 3,
                hoverBorderColor: 'rgba(255, 255, 255, 0.82)',
            }]
        }

        return result
    }, [data, type, withANN])



    return (
        <div className={'flex flex-col items-stretch py-8'}>
            <div style={{ height: 140 }} className={'flex flex-col items-stretch mb-12'}>
                <Line
                    data={lineData}
                    type={'line'}
                    options={options}
                    height={140}
                    width={null}
                />
            </div>
            <div style={{ height: 200 }} className={'flex flex-col items-stretch'}>
                <Bar
                    data={barData}
                    type={'bar'}
                    options={options}
                    height={200}
                    width={null}
                />
            </div>
        </div>
    )
}

const Chart = React.memo(MarketHistoryChart);

export default Chart
