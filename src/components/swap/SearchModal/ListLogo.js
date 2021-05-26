import React from "react";
import styled from "styled-components";
import useHttpLocations from "../../../hooks/useHttpLocations";

import Logo from "../../common/Logo";

const StyledListLogo = styled(Logo)`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
`;

export default function ListLogo({
	logoURI,
	style,
	size = "24px",
	alt,
}) {
	const srcs = useHttpLocations(logoURI);

	return <StyledListLogo alt={alt} size={size} srcs={srcs} style={style} />;
}
