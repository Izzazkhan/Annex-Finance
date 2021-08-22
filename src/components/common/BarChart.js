import { rgba } from 'polished';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import moment from 'moment';

// function CustomTooltip({ payload, label, active }) {
//   if (active) {
//     return (
//       <div
//         className="custom-tooltip"
//         style={{
//           background: 'rgba(255, 152, 0,.8)',
//           color: '#000',
//           padding: 10,
//           borderRadius: 8
//         }}
//       >
//         <p className="info">
//           <b>Buy Amount: </b>
//           <span>{payload[0].value}</span>
//         </p>
//         <p className="info">
//           <b>Price: </b>
//           <span>{label}</span>
//         </p>
//       </div>
//     );
//   }

//   return null;
// }

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
          <Bar dataKey="buyAmount" fill="#C4C4C4">
            {props.data.map((entry, index) => {
              const color =
                entry.isSuccessfull && Math.floor(Date.now() / 1000) > entry.auctionEndDate
                  ? '#C4C4C4'
                  : '#565656';

              return <Cell fill={color} key={index} />;
            })}
          </Bar>
          {/* <Tooltip content={<CustomTooltip />} /> */}
          <XAxis fontSize="12" dataKey="price" />
          <YAxis fontSize="12" dataKey="buyAmount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
