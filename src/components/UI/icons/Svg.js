/* eslint-disable */
import styled from "styled-components";

const Svg = styled.svg`
	fill: ${({ theme, color }) => theme[color]};
	flex-shrink: 0;
`;

Svg.defaultProps = {
	color: "text",
	width: "20px",
	xmlns: "http://www.w3.org/2000/svg",
	spin: false,
};

export default Svg;
