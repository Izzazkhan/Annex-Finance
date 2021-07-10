import React, {useMemo} from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const ColorPalette = {
    'green': {
        stroke: "#3AB67A",
        area: "rgba(9, 189, 60, 0.15)"
    },
    'red': {
        stroke: "#ff4040",
        area: "rgba(253, 83, 83, 0.15)"
    }
}

const APYSparkline = ({
    color,
    data
}) => {

    const selectedPalette = useMemo(() => {
        return ColorPalette[color] || ColorPalette['green'];
    }, [color])

    return (
        <div style={{ width: '100%', height: '100%' }} className="">
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    stroke={selectedPalette?.stroke}
                    strokeWidth={5}
                    margin={{
                        top: 5,
                        right: 0,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <Area type="monotone" dataKey="borrowAnnexApy" stroke={selectedPalette?.stroke} fill={selectedPalette?.area} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

APYSparkline.defaultProps = {
    color: "green",
    data: []
}
export default APYSparkline;

