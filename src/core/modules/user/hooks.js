import {useDispatch, useSelector} from "react-redux";
import {useCallback} from "react";
import { userActionCreators } from "./actions";

const { updateUserDeadline, updateUserSlippageTolerance } = userActionCreators

export function useUserSlippageTolerance() {
	const dispatch = useDispatch();
	const userSlippageTolerance = useSelector((state) => {
		return state.user.userSlippageTolerance;
	});

	const setUserSlippageTolerance = useCallback(
		(slippageTolerance) => {
			dispatch(updateUserSlippageTolerance({ userSlippageTolerance: slippageTolerance }));
		},
		[dispatch]
	);

	return [userSlippageTolerance, setUserSlippageTolerance];
}

export function useUserDeadline() {
	const dispatch = useDispatch();
	const userDeadline = useSelector((state) => {
		return state.user.userDeadline;
	});

	const setUserDeadline = useCallback(
		(deadline) => {
			dispatch(updateUserDeadline({ userDeadline: deadline }));
		},
		[dispatch]
	);

	return [userDeadline, setUserDeadline];
}