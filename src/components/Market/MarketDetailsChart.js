import React, {useMemo, useRef} from "react";
import { Line, Bar } from 'react-chartjs-2';
import BigNumber from "bignumber.js";
import commaNumber from "comma-number";
import {getBigNumber} from "../../utilities/common";
import moment from "moment";

const TYPES = {
    Supply: "supply",
    Borrow: "borrow"
}

const format = commaNumber.bindWith(',', '.');

const MarketHistoryChart = ({
    data,
    marketType
}) => {
    const lineChart = useRef();
    const barChart = useRef();
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

    const externalTooltipHandler = (context, formatter) => {
        // Tooltip Element
        const {chart, tooltip} = context;
        const tooltipEl = getOrCreateTooltip(chart);
        const dateLabel = document.getElementById("market-chart-date-label")

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            dateLabel.style.opacity = 0;
            lineChart?.current?.tooltip?.setActiveElements([])
            barChart?.current?.tooltip?.setActiveElements([])
            return;
        }


        // Set Text
        if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const lineIndex = lineChart?.current?.data?.labels?.findIndex(i => titleLines[0] === i);
            if(lineIndex > -1) {
                lineChart?.current?.tooltip?.setActiveElements([
                    {
                        datasetIndex: 0,
                        index: lineIndex,
                    }
                ])
                barChart?.current?.tooltip?.setActiveElements([
                    {
                        datasetIndex: 0,
                        index: lineIndex,
                    }
                ])
            }

            const bodyLines = tooltip.body.map(b => b.lines);


            titleLines.forEach(title => {
                dateLabel.textContent = moment(title).format("MMM D");
            });
            const tableBody = document.createElement('div');
            tableBody.classList.add("flex", "flex-col", "items-center", "justify-center", "text-center");
            bodyLines.forEach((body, i) => {
                const newBody = body[0].split(":");
                const span1 = document.createElement('span');
                const text1 = document.createTextNode(formatter(newBody[1]));

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
        dateLabel.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        dateLabel.style.left = tooltip.caretX + 'px';
        dateLabel.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transform = 'translate(-50%, -115%)';
    };

    const lineOptions = useMemo(() => {
        return {
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    external: context => externalTooltipHandler(context, function(value) {
                        const result = value.replace(/,/g, '');
                        return `${new BigNumber(result).dp(2, 1).toString(10)}%`;
                    })
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            scales: {
                y: {
                    display: false,
                },
                x: {
                    display: false,
                }
            },
            maintainAspectRatio: false,
            responsive: true,
        }
    }, [])

    const barOptions = useMemo(() => {
        return {
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    external: context => externalTooltipHandler(context, function(value) {
                        const result = value.replace(/,/g, '');
                        return `$${format(getBigNumber(result).dp(2, 1).toString(10))}`
                    })
                }
            },
            scales: {
                y: {
                    display: false,
                },
                x: {
                    display: false,
                }
            },
            maintainAspectRatio: false,
            responsive: true,
        }
    }, [])


    const lineData = useMemo(() => {
        const field = marketType === TYPES.Supply
            ? 'supplyApy'
            : 'borrowApy';

        const filteredData = data?.map(item => item?.[field] < Infinity ? item : {
            ...item,
            [field]: 0
        });

        return {
            labels: filteredData?.map(item => item?.createdAt),
            datasets: [{
                label: marketType === TYPES.Supply ? "Supply APY" : "Borrow APY",
                data: filteredData?.map(item => Number(item?.[field]) || 0.0000),
                fill: false,
                backgroundColor: marketType === TYPES.Borrow ? "#fd5353" : '#3AB67A',
                borderColor:  marketType === TYPES.Borrow ? "#fd5353" : '#3AB67A',
                borderWidth: 4,
                hoverBackgroundColor: marketType === TYPES.Borrow ? "#fd5353" : "#3AB67A",
                hoverBorderColor: "#fff",
                hoverBorderWidth: 4,
                hoverRadius: 2,
                pointRadius: 2,
                pointHitRadius: 2,
                pointBorderWidth: 0,
                tension: 0.1
            }]
        }
    }, [data, marketType])


    const barData = useMemo(() => {
        const field = marketType === TYPES.Supply
            ? 'totalSupply'
            : 'totalBorrow';

        const filteredData = data?.map(item => item?.[field] < Infinity ? item : {
            ...item,
            [field]: 0
        });

        return {
            labels: filteredData?.map(item => item?.createdAt),
            datasets: [{
                label: marketType === TYPES.Supply ? "Total Supply" : "Total Borrow",
                data: filteredData?.map(item => Number(item?.[field]) || 0.0000),
                fill: false,
                backgroundColor: '#343435',
                hoverBackgroundColor: "#343435",
            }]
        }
    }, [data, marketType])



    return (
        <div className={'flex flex-col items-stretch pt-12 pb-2'}>
            <div style={{ height: 120 }} className={'flex flex-col items-stretch mb-18'}>
                <Line
                    data={lineData}
                    type={'line'}
                    options={lineOptions}
                    height={120}
                    width={null}
                    ref={lineChart}
                />
            </div>
            <div style={{ height: 160 }} className={'flex flex-col items-stretch'}>
                <Bar
                    data={barData}
                    type={'bar'}
                    options={barOptions}
                    height={160}
                    width={null}
                    ref={barChart}
                />
            </div>
            <div style={{ height: 40 }} className={'flex flex-col items-stretch relative'}>
                <div className="market-chart-time-label absolute" style={{ top: 8 }} id={'market-chart-date-label'}/>
            </div>
        </div>
    )
}

const Chart = React.memo(MarketHistoryChart);

export default Chart
