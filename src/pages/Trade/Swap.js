import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {JSBI, Token} from '@pancakeswap-libs/sdk';
import settings from '../../assets/icons/settings.svg';
import settingsBlack from '../../assets/icons/settingsBlack.svg';
import history from '../../assets/icons/history.svg';
import historyBlack from '../../assets/icons/historyBlack.svg';
import BTN from '../../assets/icons/BTN.svg';
import LTC from '../../assets/icons/LTC.svg';
import blackArrow from '../../assets/icons/blackArrow.svg';
import whiteArrow from '../../assets/icons/whiteArrow.svg';
import ValueRange from './ValueRange';
import {useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState} from "../../core";
import {useCurrency} from "../../hooks/Tokens";
import {useActiveWeb3React} from "../../hooks";
import {Field} from "../../core/modules/swap/actions";
import useToggledVersion, {Version} from "../../hooks/useToggledVersion";
import useWrapCallback, {WrapType} from "../../hooks/useWrapCallback";
import {isTradeBetter} from "../../data/V1";
import {BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE} from "../../constants/swap";
import {ApprovalState, useApproveCallbackFromTrade} from "../../hooks/useApproveCallback";
import maxAmountSpend from "../../utils/maxAmountSpend";
import {useSwapCallback} from "../../hooks/useSwapCallback";
import {computeTradePriceBreakdown, warningSeverity} from "../../utils/prices";
import confirmPriceImpactWithoutFee from "../../components/swap/confirmPriceImpactWithoutFee";
import {useUserDeadline, useUserSlippageTolerance} from "../../core";
import TokenWarningModal from "../../components/swap/TokenWarningModal";
import CurrencyInputPanel from "../../components/swap/CurrencyInputPanel";
import AdvancedSwapDetails from "../../components/swap/AdvancedSwapDetails";

const cryptos = [
	{ name: 'BTN', logo: <img className="" src={BTN} alt="" /> },
	{ name: 'LTC', logo: <img className="" src={LTC} alt="" /> },
	{ name: 'LTC', logo: <img className="" src={LTC} alt="" /> },
	{ name: 'LTC', logo: <img className="" src={LTC} alt="" /> },
	{ name: 'LTC', logo: <img className="" src={LTC} alt="" /> },
];

function Swap({ onSettingsOpen, onHistoryOpen }) {
	const [rangeValues, setRangeValues] = useState({});
	const loadedUrlParams = useDefaultsFromURLSearch();

	// token warning stuff
	const [loadedInputCurrency, loadedOutputCurrency] = [
		useCurrency(loadedUrlParams?.inputCurrencyId),
		useCurrency(loadedUrlParams?.outputCurrencyId),
	];


	const [dismissTokenWarning, setDismissTokenWarning] = useState(false);
	const [isSyrup, setIsSyrup] = useState(false);
	const [syrupTransactionType, setSyrupTransactionType] = useState("");
	const urlLoadedTokens = useMemo(
		() => [loadedInputCurrency, loadedOutputCurrency]?.filter((c) => c instanceof Token) ?? [],
		[loadedInputCurrency, loadedOutputCurrency]
);
	const handleConfirmTokenWarning = useCallback(() => {
		setDismissTokenWarning(true);
	}, []);

	const handleConfirmSyrupWarning = useCallback(() => {
		setIsSyrup(false);
		setSyrupTransactionType("");
	}, []);

	const { account } = useActiveWeb3React();
	const [deadline] = useUserDeadline();
	const [allowedSlippage] = useUserSlippageTolerance();

	// swap state
	const { independentField, typedValue, recipient } = useSwapState();
	const {
		v1Trade,
		v2Trade,
		currencyBalances,
		parsedAmount,
		currencies,
		inputError: swapInputError,
	} = useDerivedSwapInfo();
	const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
		currencies[Field.INPUT],
		currencies[Field.OUTPUT],
		typedValue
	);
	const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

	const toggledVersion = useToggledVersion();
	const trade = showWrap
		? undefined
		: {
			[Version.v1]: v1Trade,
			[Version.v2]: v2Trade,
		}[toggledVersion];

	const betterTradeLinkVersion =
		toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
			? Version.v1
			: toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
			? Version.v2
			: undefined;


	const parsedAmounts = showWrap
		? {
			[Field.INPUT]: parsedAmount,
			[Field.OUTPUT]: parsedAmount,
		}
		: {
			[Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
			[Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
		};

	const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
	const isValid = !swapInputError;
	const dependentField = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

	const handleTypeInput = useCallback(
		(value) => {
			onUserInput(Field.INPUT, value);
		},
		[onUserInput]
	);
	const handleTypeOutput = useCallback(
		(value) => {
			onUserInput(Field.OUTPUT, value);
		},
		[onUserInput]
	);


	const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState({
		showConfirm: false,
		tradeToConfirm: undefined,
		attemptingTxn: false,
		swapErrorMessage: undefined,
		txHash: undefined,
	});


	const formattedAmounts = {
		[independentField]: typedValue,
		[dependentField]: showWrap
			? parsedAmounts[independentField]?.toExact() ?? ""
			: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
	};

	const route = trade?.route;
	const userHasSpecifiedInputOutput = Boolean(
		currencies[Field.INPUT] &&
		currencies[Field.OUTPUT] &&
		parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
	);
	const noRoute = !route;


	// check whether the user has approved the router on the input token
	const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

	// check if user has gone through approval process, used to show two step buttons, reset on token change
	const [approvalSubmitted, setApprovalSubmitted] = useState(false);

	// mark when a user has submitted an approval, reset onTokenSelection for input field
	useEffect(() => {
		if (approval === ApprovalState.PENDING) {
			setApprovalSubmitted(true);
		}
	}, [approval, approvalSubmitted]);

	const maxAmountInput = maxAmountSpend(currencyBalances[Field.INPUT]);
	const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

	// the callback to execute the swap
	const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
		trade,
		allowedSlippage,
		deadline,
		recipient
	);

	const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

	const handleSwap = useCallback(() => {
		if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
			return;
		}
		if (!swapCallback) {
			return;
		}
		setSwapState((prevState) => ({
			...prevState,
			attemptingTxn: true,
			swapErrorMessage: undefined,
			txHash: undefined,
		}));
		swapCallback()
			.then((hash) => {
				setSwapState((prevState) => ({
					...prevState,
					attemptingTxn: false,
					swapErrorMessage: undefined,
					txHash: hash,
				}));
			})
			.catch((error) => {
				setSwapState((prevState) => ({
					...prevState,
					attemptingTxn: false,
					swapErrorMessage: error.message,
					txHash: undefined,
				}));
			});
	}, [priceImpactWithoutFee, swapCallback, setSwapState]);



	// errors
	const [showInverted, setShowInverted] = useState(false);

	// warnings on slippage
	const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

	// show approve flow when: no error on inputs, not approved or pending, or approved in current session
	// never show if price impact is above threshold in non expert mode
	const showApproveFlow =
		!swapInputError &&
		(approval === ApprovalState.NOT_APPROVED ||
			approval === ApprovalState.PENDING ||
			(approvalSubmitted && approval === ApprovalState.APPROVED)) &&
		!(priceImpactSeverity > 3);

	const handleConfirmDismiss = useCallback(() => {
		setSwapState((prevState) => ({ ...prevState, showConfirm: false }));

		// if there was a tx hash, we want to clear the input
		if (txHash) {
			onUserInput(Field.INPUT, "");
		}
	}, [onUserInput, txHash, setSwapState]);

	const handleAcceptChanges = useCallback(() => {
		setSwapState((prevState) => ({ ...prevState, tradeToConfirm: trade }));
	}, [trade]);

	// This will check to see if the user has selected Syrup to either buy or sell.
	// If so, they will be alerted with a warning message.
	const checkForSyrup = useCallback(
		(selected, purchaseType) => {
			if (selected === "syrup") {
				setIsSyrup(true);
				setSyrupTransactionType(purchaseType);
			}
		},
		[setIsSyrup, setSyrupTransactionType]
	);

	const handleInputSelect = useCallback(
		(inputCurrency) => {
			setApprovalSubmitted(false); // reset 2 step UI for approvals
			onCurrencySelection(Field.INPUT, inputCurrency);
			if (inputCurrency.symbol.toLowerCase() === "syrup") {
				checkForSyrup(inputCurrency.symbol.toLowerCase(), "Selling");
			}
		},
		[onCurrencySelection, setApprovalSubmitted, checkForSyrup]
	);

	const handleMaxInput = useCallback(() => {
		if (maxAmountInput) {
			onUserInput(Field.INPUT, maxAmountInput.toExact());
		}
	}, [maxAmountInput, onUserInput]);

	const handleOutputSelect = useCallback(
		(outputCurrency) => {
			onCurrencySelection(Field.OUTPUT, outputCurrency);
			if (outputCurrency.symbol.toLowerCase() === "syrup") {
				checkForSyrup(outputCurrency.symbol.toLowerCase(), "Buying");
			}
		},
		[onCurrencySelection, checkForSyrup]
	);


	return (
		<div className="py-10 w-full max-w-2xl mt-6">
			<TokenWarningModal
				isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
				tokens={urlLoadedTokens}
				onConfirm={handleConfirmTokenWarning}
			/>
			<div
				className={`w-full max-w-2xl py-8 px-6 sm:px-10 rounded-2xl mb-4 ${
					trade ? 'bg-primary' : 'bg-black'
				}`}
			>
				<div className="flex justify-between">
					<div className="">
						<div
							className={`text-xl 2xl:text-24 font-bold ${
								trade ? 'text-black' : 'text-white'
							}`}
						>
							Exchange
						</div>
						<div
							className={`md:text-xs 2xl:text-18 mt-3 ${
								trade ? 'text-black' : 'text-gray'
							}`}
						>
							Trade tokens in an instant
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<div className="w-full cursor-pointer" onClick={onSettingsOpen}>
							<img
								className="w-full"
								src={trade ? settingsBlack : settings}
								alt="settings"
							/>
						</div>
						<div className="w-full cursor-pointer" onClick={onHistoryOpen}>
							<img
								src={trade ? historyBlack : history}
								alt="history"
							/>
						</div>
					</div>
				</div>
				<div className="flex flex-col items-center mt-8">
					<CurrencyInputPanel
						title={
							independentField === Field.OUTPUT && !showWrap && trade
								? "From (estimated)"
								: "From"
						}
						value={formattedAmounts[Field.INPUT]}
						showMaxButton={!atMaxAmountInput}
						currency={currencies[Field.INPUT]}
						onUserInput={handleTypeInput}
						onMax={handleMaxInput}
						onCurrencySelect={handleInputSelect}
						otherCurrency={currencies[Field.OUTPUT]}
						id="swap-currency-input"
					/>
					<div
						onClick={() => {
							setApprovalSubmitted(false);
							onSwitchTokens();
						}}
					>
						<img
							className="mt-12 mb-6 cursor-pointer"
							src={trade ? whiteArrow : blackArrow}
							alt=""
						/>
					</div>
					<CurrencyInputPanel
						value={formattedAmounts[Field.OUTPUT]}
						onUserInput={handleTypeOutput}
						title={
							independentField === Field.INPUT && !showWrap && trade
								? "To (estimated)"
								: "To"
						}
						showMaxButton={false}
						currency={currencies[Field.OUTPUT]}
						onCurrencySelect={handleOutputSelect}
						otherCurrency={currencies[Field.INPUT]}
						id="swap-currency-output"
					/>
				</div>

				{showWrap ? null : (
					<div className="flex flex-col items-stretch">
							{Boolean(trade) && (

								<div className="flex justify-between text-white mt-6">
									<div
										className={
											trade ? 'text-black text-18' : 'text-white text-18'
										}
									>
										Price
									</div>
									<div
										className={
											trade ? 'text-black text-18' : 'text-white text-18'
										}
									>
										{trade?.executionPrice?.toSignificant(6)}
										{trade?.executionPrice?.quoteCurrency?.symbol}
										per
										{trade?.executionPrice?.baseCurrency?.symbol}
									</div>
								</div>
							)}
							{allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
								<div className="flex justify-between text-white mt-6">
									<div
										className={
											trade ? 'text-black text-18' : 'text-white text-18'
										}
									>
										Slippage Tolerance
									</div>
									<div
										className={
											trade ? 'text-black text-18' : 'text-white text-18'
										}
									>
										{allowedSlippage / 100}%
									</div>
								</div>
							)}
					</div>
				)}
				<div className="flex justify-center mt-10">
					{!account ? (
						<button
							disabled={true}
							className={`focus:outline-none py-2 px-12 text-black text-24 ${
								trade
									? 'bg-white rounded-3xl'
									: 'bgPrimaryGradient rounded-lg'
							}`}
						>
							Connect Wallet
						</button>
					) : showWrap ? (
						<button
							disabled={Boolean(wrapInputError)}
							onClick={onWrap}
							className={`focus:outline-none py-2 px-12 text-black text-24 ${
								trade
									? 'bg-white rounded-3xl'
									: 'bgPrimaryGradient rounded-lg'
							}`}
						>

							{wrapInputError ??
							(wrapType === WrapType.WRAP
								? "Wrap"
								: wrapType === WrapType.UNWRAP
									? "Unwrap"
									: null)}
						</button>
					) : noRoute && userHasSpecifiedInputOutput ? (
						<button
							disabled={true}
							className={`focus:outline-none py-2 px-12 text-black text-24 ${
								trade
									? 'bg-white rounded-3xl'
									: 'bgPrimaryGradient rounded-lg'
							}`}
						>
							Insufficient liquidity for this trade.
						</button>
					) : showApproveFlow ? (
						<div className="
							flex flex-col items-stretch space-y-3
							md:space-y-0 md:flex-row md:items-center md:space-x-4
						">
							<button
								onClick={approveCallback}
								disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
								className={`focus:outline-none py-2 px-12 flex-grow text-black text-24 ${
									trade
										? 'bg-white rounded-3xl'
										: 'bgPrimaryGradient rounded-lg'
								}`}
							>
								{approval === ApprovalState.PENDING ? (
									"Approving"
								) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
									"Approved"
								) : (
									`Approve ${currencies[Field.INPUT]?.symbol}`
								)}
							</button>
							<button
								onClick={() => {
									setSwapState({
										tradeToConfirm: trade,
										attemptingTxn: false,
										swapErrorMessage: undefined,
										showConfirm: true,
										txHash: undefined,
									});
								}}
								disabled={
									!isValid ||
									approval !== ApprovalState.APPROVED ||
									(priceImpactSeverity > 3)
								}
								className={`focus:outline-none py-2 px-12 flex-grow text-black text-24 ${
									trade
										? 'bg-white rounded-3xl'
										: 'bgPrimaryGradient rounded-lg'
								}`}
							>
								{priceImpactSeverity > 3
									? `Price Impact High`
									: `Swap${priceImpactSeverity > 2 ? " Anyway" : ""}`}
							</button>
						</div>
					) : (
						<button
							onClick={() => {
								setSwapState({
									tradeToConfirm: trade,
									attemptingTxn: false,
									swapErrorMessage: undefined,
									showConfirm: true,
									txHash: undefined,
								});
							}}
							disabled={
								!isValid || priceImpactSeverity > 3 || !!swapCallbackError
							}
							className={`focus:outline-none py-2 px-12 text-black text-24 ${
								trade
									? 'bg-white rounded-3xl'
									: 'bgPrimaryGradient rounded-lg'
							}`}
						>
							{swapInputError ||
							(priceImpactSeverity > 3
								? `Price Impact Too High`
								: `Swap${priceImpactSeverity > 2 ? " Anyway" : ""}`)}
						</button>
					)}
				</div>
			</div>
			{trade && (
				<AdvancedSwapDetails trade={trade}/>
			)}
		</div>
	);
}

export default Swap;
