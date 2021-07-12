import {escapeRegExp} from "../../utils";
import React from "react";


const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

export default function NumericalInput({
	value,
	onUserInput,
	placeholder,
	trade,
	...rest
}) {
	const enforcer = (nextUserInput) => {
		if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
			onUserInput(nextUserInput);
		}
	};

	return (
		<input
			id={name}
			name={name}
			type="text"
			className={`border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-bold px-4 h-14 ${
				trade ? 'text-black' : 'text-white'
			}`}
			placeholder={placeholder}
			value={value}
			onChange={(event) => {
				enforcer(event.target.value.replace(/,/g, "."));
			}}
		/>
	)
}