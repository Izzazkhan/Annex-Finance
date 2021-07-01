import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Legend } from 'recharts';

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
        <BarChart data={props.data} margin={{ top: 0, left: 0, right: 0, bottom: -5 }}>
          <Bar dataKey="pv" fill="#C4C4C4">
            {props.data.map((entry, index) => {
              const color = entry.isSuccessfull ? '#565656' : '#C4C4C4';
              return <Cell fill={color} key={index} />;
            })}
          </Bar>
          <XAxis key="name" />
        </BarChart>
      </ResponsiveContainer>
    
    </div>
  );
}
