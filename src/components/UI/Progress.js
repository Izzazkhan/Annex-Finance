import React from 'react';
import { Progress as _Progress } from 'react-sweet-progress';
import styled from "styled-components";
import 'react-sweet-progress/lib/style.css';

const CustomProgress = styled(_Progress)`
  & .react-sweet-progress-line {
      background-color: #B06800;
  }
`

function Progress({ wrapperClassName = '', percent = 60, status = '', type = 'line', ...props }) {
  return (
    <div className={wrapperClassName}>
      <CustomProgress
        percent={percent}
        status={status}
        type={type}
        theme={{
          success: {
            symbol: '',
            color: '#FF9800',
          },
          active: {
            symbol: '',
            color: '#FF9800',
          },
          default: {
            symbol: '',
            color: '#FF9800',
          },
        }}
        {...props}
      />
    </div>
  );
}

export default Progress;
