import React from "react";
import styled from "styled-components";
import {X as CloseIcon} from "react-feather";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
  color: #fff;
`;

export const AutoColumn = styled.div`
	display: grid;
	grid-auto-rows: auto;
	grid-row-gap: ${({ gap }) =>
	(gap === "sm" && "8px") || (gap === "md" && "12px") || (gap === "lg" && "24px") || gap};
	justify-items: ${({ justify }) => justify && justify};
`;

export const Wrapper = styled.div`
	width: 100%;
	overflow-y: auto;
`;
export const Section = styled(AutoColumn)`
	padding: 24px;
`;

export const ConfirmedIcon = styled(ColumnCenter)`
	padding: 40px 0;
`;

export const BottomSection = styled(Section)`
	background-color: #101016;
	border-radius: 20px;
  	margin: 8px;
`;

const Heading = styled.div`
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: center;
	padding-left: 24px;
`;

const StyledContentHeader = styled.div`
	align-items: center;
	display: flex;
	justify-content: space-between;
	width: 100%;
`;

const StyledButton = styled.button`
	color: #fff;
	background-color: transparent;
	border: none;

	&:hover,
	&:focus,
	&:active {
		color: #fff;
		background-color: transparent;
		border: none;
		outline: none;
	}
`;

export const ContentHeader = ({ children, onDismiss }) => (
	<StyledContentHeader>
		<Heading>{children}</Heading>
		<StyledButton onClick={onDismiss}>
			<CloseIcon color="#fff" />
		</StyledButton>
	</StyledContentHeader>
);
