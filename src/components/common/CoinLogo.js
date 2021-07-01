import styled from "styled-components";
import Logo from "./Logo";

const CoinLogo = styled(Logo)`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
`;

export default CoinLogo;
