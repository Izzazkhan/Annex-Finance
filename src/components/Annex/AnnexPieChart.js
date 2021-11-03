import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AnnexPieChart = ({
    data,
}) => {
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
                {`${data.length && data.reduce((a, b) => ({ value: a.value + b.value })).value}`}
            </span>
        </div>
    )
}

export default AnnexPieChart;
