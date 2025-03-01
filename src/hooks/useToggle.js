import { useCallback, useState } from "react";

export default function useToggle(initialState = false) {
	const [state, setState] = useState(initialState);
	const toggle = useCallback(() => setState((prev) => !prev), []);
	return [state, toggle];
}
