import React, { useCallback } from "react";
import styled from "styled-components";

const StyledRangeInput = styled.input`
	-webkit-appearance: none; /* Hides the slider so that custom slider can be made */
	width: 100%; /* Specific width is required for Firefox. */
	background: transparent; /* Otherwise white in Chrome */
	cursor: pointer;

	&:focus {
		outline: none;
	}

	&::-moz-focus-outer {
		border: 0;
	}

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: ${({ size }) => size}px;
		width: ${({ size }) => size}px;
		background-color: #FF9800;
		border-radius: 100%;
		border: none;
		transform: translateY(-50%);
		color: #101016;

		&:hover,
		&:focus {
			box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08),
				0px 16px 24px rgba(0, 0, 0, 0.06), 0px 24px 32px rgba(0, 0, 0, 0.04);
		}
	}

	&::-moz-range-thumb {
		height: ${({ size }) => size}px;
		width: ${({ size }) => size}px;
		background-color: #FF9800;
		border-radius: 100%;
		border: none;
		color: #101016;

		&:hover,
		&:focus {
			box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08),
				0px 16px 24px rgba(0, 0, 0, 0.06), 0px 24px 32px rgba(0, 0, 0, 0.04);
		}
	}

	&::-ms-thumb {
		height: ${({ size }) => size}px;
		width: ${({ size }) => size}px;
		background-color: #FF9800;
		border-radius: 100%;
		color: #101016;

		&:hover,
		&:focus {
			box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08),
				0px 16px 24px rgba(0, 0, 0, 0.06), 0px 24px 32px rgba(0, 0, 0, 0.04);
		}
	}

	&::-webkit-slider-runnable-track {
		background: linear-gradient(90deg, #FF9800, #C97629);
		height: 2px;
	}

	&::-moz-range-track {
		background: linear-gradient(90deg, #FF9800, #C97629);
		height: 2px;
	}

	&::-ms-track {
		width: 100%;
		border-color: transparent;
		color: transparent;

		background: #FF9800;
		height: 2px;
	}
	&::-ms-fill-lower {
		background: #FF9800;
	}
	&::-ms-fill-upper {
		background: #C97629;
	}
`;


export default function Slider({ value, onChange, min = 0, step = 1, max = 100, size = 28 }) {
    const changeCallback = useCallback(
        (e) => {
            onChange(parseInt(e.target.value));
        },
        [onChange]
    );

    return (
        <StyledRangeInput
            size={size}
            type="range"
            value={value}
            style={{ width: "100%", padding: "15px 0" }}
            onChange={changeCallback}
            aria-labelledby="input slider"
            step={step}
            min={min}
            max={max}
        />
    );
}
