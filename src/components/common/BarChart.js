import { rgba } from 'polished';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import moment from 'moment';

function CustomTooltip({ payload, label, active, auctionType }) {
  if (active) {
    return (
      <div
        className="custom-tooltip"
        style={{
          background: 'rgba(255, 152, 0,.8)',
          color: '#000',
          padding: 10,
          borderRadius: 8,
        }}
      >
        <p className="info">
          <b>{auctionType === 'BATCH' ? 'Buy Amount : ' : 'Amount Commited : '} </b>
          <span>{payload[0].value}</span>
        </p>
        <p className="info">
          <b>{auctionType === 'BATCH' ? 'Price : ' : 'Amount Claimable : '} </b>
          <span>{label}</span>
        </p>
      </div>
    );
  }

  return null;
}

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
        <BarChart
          data={props.data.length && props.data}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          options={{ scales: { y: { tick: 100000 } } }}
        >
          <Bar dataKey="auctionDivBuyAmount" fill="#C4C4C4">
            {props.data.length &&
              props.data.map((entry, index) => {
                // console.log('entry', entry);
                const color =
                  props.auctionType === 'FIXED'
                    ? '#C4C4C4'
                    : entry.isSuccessfull &&
                      Math.floor(Date.now() / 1000) > entry.auctionEndDate &&
                      entry.minFundingThresholdNotReached === false
                    ? '#C4C4C4'
                    : '#565656';

                return <Cell fill={color} key={index} />;
              })}
          </Bar>
          <Tooltip content={<CustomTooltip auctionType={props.auctionType} />} />
          <XAxis fontSize="12" dataKey="price" />
          <YAxis fontSize="12" dataKey="auctionDivBuyAmount" ticks={[0, props.yMaximum]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
