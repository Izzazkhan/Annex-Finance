import parseENSAddress from "../../../utils/parseENSAddress";
import {memo, useCallback, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import { usePopper } from "react-popper";
import {useDispatch, useSelector} from "react-redux";
import {useSelectedListUrl} from "../../../core";
import useToggle from "../../../hooks/useToggle";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import { listActionCreators } from "../../../core";
import ListLogo from "./ListLogo";
import ChevronDownIcon from "../../UI/icons/ChevronDown";
import listVersionLabel from "../../../utils/listVersionLabel";
import useFetchListCallback from "../../../hooks/useFetchListCallback";
import uriToHttp from "../../../utils/uriToHttp";
import {ArrowLeft, X} from "react-feather";

const {
	selectList,
	removeList,
	acceptListUpdate
} = listActionCreators

export const CloseIcon = styled(X)`
	cursor: pointer;
`;

const PopoverContainer = styled.div`
  z-index: 100;
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01),
              0px 4px 8px rgba(0, 0, 0, 0.04), 
  			  0px 16px 24px rgba(0, 0, 0, 0.04),
  			  0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 8px;
  font-size: 1rem;
  text-align: left;
  `

const ListContainer = styled.div`
	flex: 1;
	overflow: auto;
`;

export const AutoColumn = styled.div`
	display: grid;
	grid-auto-rows: auto;
	grid-row-gap: ${({ gap }) =>
		(gap === "sm" && "8px") || (gap === "md" && "12px") || (gap === "lg" && "24px") || gap};
	justify-items: ${({ justify }) => justify && justify};
`;


function ListOrigin({ listUrl }) {
	const ensName = useMemo(() => parseENSAddress(listUrl)?.ensName, [listUrl]);
	const host = useMemo(() => {
		if (ensName) return undefined;
		const lowerListUrl = listUrl.toLowerCase();
		if (lowerListUrl.startsWith("ipfs://") || lowerListUrl.startsWith("ipns://")) {
			return listUrl;
		}
		try {
			const url = new URL(listUrl);
			return url.host;
		} catch (error) {
			return undefined;
		}
	}, [listUrl, ensName]);
	return <>{ensName ?? host}</>;
}

function listUrlRowHTMLId(listUrl) {
	return `list-row-${listUrl.replace(/\./g, "-")}`;
}


const ListRow = memo(function ListRow({ listUrl, onBack }) {
	const listsByUrl = useSelector((state) => state.lists.byUrl);
	const selectedListUrl = useSelectedListUrl();
	const dispatch = useDispatch();
	const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];

	const isSelected = listUrl === selectedListUrl;

	const [open, toggle] = useToggle(false);
	const node = useRef();
	const [referenceElement, setReferenceElement] = useState();
	const [popperElement, setPopperElement] = useState();

	const { styles, attributes } = usePopper(referenceElement, popperElement, {
		placement: "auto",
		strategy: "fixed",
		modifiers: [{ name: "offset", options: { offset: [8, 8] } }],
	});

	useOnClickOutside(node, open ? toggle : undefined);

	const selectThisList = useCallback(() => {
		if (isSelected) return;

		dispatch(selectList(listUrl));
		onBack();
	}, [dispatch, isSelected, listUrl, onBack]);

	const handleAcceptListUpdate = useCallback(() => {
		if (!pending) return;
		dispatch(acceptListUpdate(listUrl));
	}, [dispatch, listUrl, pending]);

	const handleRemoveList = useCallback(() => {
		if (window.prompt(`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
			dispatch(removeList(listUrl));
		}
	}, [dispatch, listUrl]);

	if (!list) return null;

	return (
		<div className="flex flex-row p-4 items-center justify-start w-full">
			{list.logoURI ? (
				<ListLogo
					style={{ marginRight: "1rem" }}
					logoURI={list.logoURI}
					alt={`${list.name} list logo`}
				/>
			) : (
				<div style={{ width: "24px", height: "24px", marginRight: "1rem" }} />
			)}
			{/*Column*/}
			<div className="flex flex-col justify-start flex-grow">
				<div className="flex flex-row items-center">
					<span className="overflow-ellipsis text-white font-bold">
						{list.name}
					</span>
				</div>
				<div className="flex flex-row items-center mb-1">
					<div
						className="
						mr-2 overflow-ellipsis text-white text-sm opacity-50 max-w-2xl
						"
					>
						<ListOrigin listUrl={listUrl} />
					</div>
				</div>
			</div>
			{/*	Menu*/}
			<div
				className="flex justify-center items-center relative"
				ref={node}
			>
				<div className="inline-block" ref={setReferenceElement}>
					<button
						className="w-8 h-8 bg-fadeBlack border-none focus:outline-none mr-2 rounded-lg"
						onClick={toggle}
					>

						<ChevronDownIcon />
					</button>
				</div>

				{open && (
					<PopoverContainer
						className={'text-white bg-black border border-fadeBlack'}
						show
						ref={setPopperElement}
						style={styles.popper}
						{...attributes.popper}

					>
						<span>{list && listVersionLabel(list.version)}</span>
						<div className="w-full h-px bg-fadeBlack"/>
						<a
							href={`https://tokenlists.org/token-list?url=${listUrl}`}
							target={"_blank"}
							rel={'noreferrer noopener'}
							className="text-primary no-underline font-bold cursor-pointer"
						>
							View list
						</a>
						<button
							onClick={handleRemoveList}
							disabled={Object.keys(listsByUrl).length === 1}
							className="bg-transparent p-0 text-normal disabled:opacity-50"
						>
							Remove list
						</button>
						{pending && (
							<button
								onClick={handleAcceptListUpdate}
								className="bg-transparent p-0 text-normal disabled:opacity-50"
							>
								Update list
							</button>
						)}
					</PopoverContainer>
				)}
			</div>
			{isSelected ? (
				<button
					disabled
					className={'bg-primaryLight rounded-lg text-black disabled:opacity-50 px-5'}>
					Selected
				</button>
			) : (
				<>
					<button
						className={'bg-primaryLight rounded-lg text-black disabled:opacity-50 px-5'}
						onClick={selectThisList}
					>
						Select
					</button>
				</>
			)}
		</div>
	)

});

export function ListSelect({ onDismiss, onBack }) {
	const [listUrlInput, setListUrlInput] = useState("");

	const dispatch = useDispatch();
	const lists = useSelector((state) => state.lists.byUrl);
	const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
	const [addError, setAddError] = useState(null);


	const handleInput = useCallback((e) => {
		setListUrlInput(e.target.value);
		setAddError(null);
	}, []);
	const fetchList = useFetchListCallback();

	const handleAddList = useCallback(() => {
		if (adding) return;
		setAddError(null);
		fetchList(listUrlInput)
			.then(() => {
				setListUrlInput("");
			})
			.catch((error) => {
				setAddError(error.message);
				dispatch(removeList(listUrlInput));
			});
	}, [adding, dispatch, fetchList, listUrlInput]);

	const validUrl = useMemo(() => {
		return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput));
	}, [listUrlInput]);

	const handleEnterKey = useCallback(
		(e) => {
			if (validUrl && e.key === "Enter") {
				handleAddList();
			}
		},
		[handleAddList, validUrl]
	);

	const sortedLists = useMemo(() => {
		const listUrls = Object.keys(lists);
		return listUrls
			.filter((listUrl) => {
				return Boolean(lists[listUrl].current);
			})
			.sort((u1, u2) => {
				const { current: l1 } = lists[u1];
				const { current: l2 } = lists[u2];
				if (l1 && l2) {
					return l1.name.toLowerCase() < l2.name.toLowerCase()
						? -1
						: l1.name.toLowerCase() === l2.name.toLowerCase()
							? 0
							: 1;
				}
				if (l1) return -1;
				if (l2) return 1;
				return 0;
			});
	}, [lists]);

	return (
		<div className="flex flex-col justify-start w-full">
			{/*	Title*/}
			<AutoColumn className="px-5 pt-5 pb-3">
				<div className="flex flex-row items-center justify-between w-full">
					<div>
						<ArrowLeft style={{ cursor: "pointer" }} onClick={onBack} />
					</div>
					<span className="text-white text-xl font-bold">Manage Lists</span>
					<CloseIcon onClick={onDismiss} />
				</div>
			</AutoColumn>

			<div className="w-full h-px bg-fadeBlack"/>

			<AutoColumn gap={'14px'}>
				<div className="text-white">Add a list</div>
				<div className="flex flex-row items-center">
					<input
						type="text"
						className={`border border-solid border-gray bg-transparent
						rounded-xl flex-grow focus:outline-none font-bold px-4 h-14`}
						id="list-add-input"
						placeholder="https:// or ipfs:// or ENS name"
						value={listUrlInput}
						onChange={handleInput}
						onKeyDown={handleEnterKey}
					/>
					<button
						disabled={!validUrl}
						onClick={handleAddList}
						className="ml-4 bg-primaryLight rounded-lg text-black disabled:opacity-50 px-5">
						Add
					</button>
				</div>
			</AutoColumn>

			<div className="w-full h-px bg-fadeBlack"/>

			<ListContainer>
				{sortedLists.map((listUrl) => (
					<ListRow key={listUrl} listUrl={listUrl} onBack={onBack} />
				))}
			</ListContainer>

			<div className="w-full h-px bg-fadeBlack"/>

			<div className='p-4 text-center' >
				<a
					target={"_blank"}
					rel={'noreferrer noopener'}
					className="text-primary no-underline font-bold cursor-pointer"
					href="https://tokenlists.org">
					Browse lists
				</a>
			</div>
		</div>
	)

}