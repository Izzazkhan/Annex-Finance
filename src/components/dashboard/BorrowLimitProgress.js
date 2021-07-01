import styled from "styled-components";
import React, {useMemo} from 'react';

const STATES = {
    SUCCESS: "#3ab67a",
    NORMAL: "#FFAB2D",
    DANGER: "#fd5353"
}

const Container = styled.div`
  height: 30px;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Line = styled.div`
  border-radius: 20px;
  height: 10px;
  transition: 0.5s ease all;
`

const Percentage = styled.span`
  font-size: 1rem;
  line-height: 1.25rem;
  color: #fff;
  width: 3.5rem;
  display: flex;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  
  &::after {
    content: "%";
  }
`

const InnerLine = styled(Line)`
  width: ${({ percent }) => `calc(${percent}% - 1.875rem)`};
  background-color: ${({ type }) => type || "#FFAB2D" };
`

const EmptyLine = styled(Line)`
  background-color: #343435;
  width: ${({ percent }) => `calc(${100 - percent}% - 1.875rem)`};
`

const BorrowLimitProgress = ({
    percent,
    safeLimit = 40,
    dangerLimit = 80
}) => {
    const fixedPercent = useMemo(() => {
        let result = Number(percent);
        if(!percent || percent === 0) {
            result = 0;
        } else if(percent > 100) {
            result = 100;
        } else if(percent < 0) {
            result = 0;
        }

        return result.toFixed(0);
    }, [percent])
    return (
        <Container>
            <InnerLine
                percent={fixedPercent}
                type={fixedPercent <= safeLimit
                    ? STATES.SUCCESS
                    : fixedPercent >= dangerLimit
                        ? STATES.DANGER
                        : STATES.NORMAL}
            />
            <Percentage>{fixedPercent}</Percentage>
            <EmptyLine
                percent={fixedPercent}
            />
        </Container>
    )
}

export default BorrowLimitProgress;
