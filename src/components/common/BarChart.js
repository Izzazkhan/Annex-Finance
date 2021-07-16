import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Legend } from 'recharts';

export default function Chart(props) {
  return (
    <div
      className="relative pt-5"
      style={{
        width: '100%',
        height: props.height,
        marginBottom: '-29px',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <Bar dataKey="price" fill="#C4C4C4">
            {props.data.map((entry, index) => {
              const color = entry.isSuccessfull ? '#C4C4C4' : '#565656';
              return <Cell fill={color} key={index} />;
            })}
          </Bar>
          <XAxis fontSize="12" key="name" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
