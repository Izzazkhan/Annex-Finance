import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AnnexPieChart = ({
    data,
}) => {
    const label = useMemo(() => {
        let obj = data.reduce((a, b) => ({ value: a.value + b.value }))
        if (data.length === 0 || !obj || isNaN(obj.value)) {
            return "0"
        }
        return obj.value
    }, [data])
    return (
        <div className="relative flex flex-col items-center justify-center">
            <PieChart width={110} height={110}>
                <Pie
                    data={data}
                    dataKey="value"
                    cx={50}
                    cy={50}
                    innerRadius={40}
                    outerRadius={50}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} stroke={'transparent'} />
                    ))}
                </Pie>
            </PieChart>
            <span
                className="text-white absolute"
                style={{ top: '50%', left: '50%', transform: "translate(-50%, -50%)" }}
            >
                {label}
            </span>
        </div>
    )
}

export default AnnexPieChart;
