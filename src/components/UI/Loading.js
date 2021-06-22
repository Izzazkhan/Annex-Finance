import styled, { keyframes } from "styled-components";
import SVG from 'react-inlinesvg'

import LoadingSVG from '../../assets/icons/loading.svg';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`
const Wrapper = styled.div`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
  	margin-right: ${({ margin }) => margin};
  	animation: ${spin} 0.6s linear infinite forwards;
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
`


const Loading = props => {
	return (
		<Wrapper className={'text-black'} {...props}>
			<SVG src={LoadingSVG} />
		</Wrapper>
	)
}

export default Loading;