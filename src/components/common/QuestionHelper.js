import React, { useCallback, useState } from "react";
import { HelpCircle as Question } from "react-feather";
import styled from "styled-components";
import Tooltip from "./Tooltip";

const QuestionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.2rem;
	border: none;
	outline: none;
	cursor: default;
	border-radius: 36px;
	background-color: #242424;
	color: #fff;

	:hover,
	:focus {
		opacity: 0.7;
	}
`;

export default function QuestionHelper({ text }) {
	const [show, setShow] = useState(false);

	const open = useCallback(() => setShow(true), [setShow]);
	const close = useCallback(() => setShow(false), [setShow]);

	return (
		<span style={{ marginLeft: 4 }}>
			<Tooltip text={text} show={show}>
				<QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
					<Question size={16} />
				</QuestionWrapper>
			</Tooltip>
		</span>
	);
}
