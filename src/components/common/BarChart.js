import { BarChart, Bar, ResponsiveContainer } from 'recharts';

export default function Chart(props) {
  return (
    <div
      className="relative pt-10"
      style={{
        width: '100%',
        height: props.height,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data}>
          <Bar dataKey="pv" stackId="a" fill="#C4C4C4" />
          <Bar dataKey="uv" stackId="a" fill="#565656" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
