import React from "react";
import styled from "styled-components";
import { Box } from "rebass/styled-components";

const Row = styled(Box)`
	width: ${({ width }) => width || "100%"};
	display: flex;
	padding: 0;
	align-items: ${({ align }) => align || "center"};
	justify-content: ${({ justify }) => justify || "flex-start"};
	padding: ${({ padding }) => padding};
	border: ${({ border }) => border};
	border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowFixed = styled(Row)`
	width: fit-content;
	margin: ${({ gap }) => gap && `-${gap}`};
`;

export const FilterWrapper = styled(RowFixed)`
	padding: 8px;
	border-radius: 8px;
	user-select: none;
	& > * {
		user-select: none;
	}
	:hover {
		cursor: pointer;
	}
`;

export default function SortButton({
	toggleSortOrder,
	ascending,
}) {
	return (
		<FilterWrapper
			onClick={toggleSortOrder}
			className={'text-white bg-fadeBlack'}
		>
			<span>{ascending ? "↑" : "↓"}</span>
		</FilterWrapper>
	);
}
