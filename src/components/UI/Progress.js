import React from 'react';
import { Progress as _Progress } from 'react-sweet-progress';
import 'react-sweet-progress/lib/style.css';

function Progress({
  wrapperClassName,
  percent,
  status,
  type,
  color,
  trailColor,
  symbolClassName,
  ...props
}) {
  return (
    <div className={wrapperClassName}>
      <_Progress
        percent={percent}
        status={status}
        type={type}
        symbolClassName={symbolClassName}
        theme={{
          success: {
            symbol: '',
            trailColor,
            color,
          },
          active: {
            symbol: '',
            trailColor,
            color,
          },
          default: {
            symbol: '',
            trailColor,
            color,
          },
        }}
        {...props}
      />
    </div>
  );
}
Progress.defaultProps = {
  wrapperClassName: '',
  percent: 60,
  status: '',
  type: 'line',
  color: '#FF9800',
  trailColor: '#663C00',
  symbolClassName: 'hidden',
};
export default Progress;
