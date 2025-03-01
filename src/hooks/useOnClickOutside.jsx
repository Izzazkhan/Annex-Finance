import { RefObject, useEffect, useRef } from "react";

export function useOnClickOutside(
	node,
	handler
) {
	const handlerRef = useRef(handler);
	useEffect(() => {
		handlerRef.current = handler;
	}, [handler]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (node.current?.contains(e.target) || false) {
				return;
			}
			if (handlerRef.current) handlerRef.current();
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [node]);
}

export default useOnClickOutside;
