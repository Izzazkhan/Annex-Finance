import {useCurrency} from "../../hooks/Tokens";
import {useActiveWeb3React} from "../../hooks";
import {wrappedCurrency} from "../../utils/wrappedCurrency";
import React, {useCallback, useMemo, useState} from "react";
import {
    useBurnActionHandlers,
    useBurnState,
    useDerivedBurnInfo, useTransactionAdder,
    useUserDeadline,
    useUserSlippageTolerance
} from "../../core";
import {Field} from "../../core/modules/burn/actions";
import {currencyEquals, ETHER, Percent, WETH} from "@annex/sdk";
import {usePairContract} from "../../hooks/useContract";
import {ApprovalState, useApproveCallback} from "../../hooks/useApproveCallback";
import {ROUTER_ADDRESS} from "../../constants/swap";
import {splitSignature} from "@ethersproject/bytes";
import {calculateGasMargin, calculateSlippageAmount, getRouterContract} from "../../utils";
import BigNumber from "bignumber.js";
import currencyId from "../../utils/currencyId";
import useDebouncedChangeHandler from "../../utils/useDebouncedChangeHandler";
import TransactionConfirmationModal
    from "../../components/swap/TransactionConfirmationModal/TransactionConfrimationModal";
import ConfirmationModalContent from "../../components/swap/TransactionConfirmationModal/ConfirmationModalContent";
import {AutoColumn, ColumnCenter} from "../../components/UI/Column";
import {RowBetween, RowFixed} from "../../components/UI/Row";
import CurrencyLogo from "../../components/common/CurrencyLogo";
import {ArrowDown, Plus} from "react-feather";
import DoubleCurrencyLogo from "../../components/common/DoubleLogo";
import help from "../../assets/icons/help.svg";
import Slider from "../../components/swap/Slider";
import {Link} from "react-router-dom";
import CurrencyInputPanel from "../../components/swap/CurrencyInputPanel";
import {MinimalPositionCard} from "../../components/swap/PositionCard";
import Loading from "../../components/UI/Loading";
import {Dots} from "../../components/UI/Dots";
import ConnectWalletModal from "../../components/common/ConnectWalletModal";


function RemoveLiquidity({
    match: {
        params: { currencyIdA, currencyIdB },
    },
    history,
}) {
    const [connectWalletsOpen, setConnectWalletsOpen] = useState(false);
    const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
    const { account, chainId, library } = useActiveWeb3React()
    const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
        currencyA,
        currencyB,
        chainId,
    ])

    // burn state
    const { independentField, typedValue } = useBurnState()
    const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
    const { onUserInput: _onUserInput } = useBurnActionHandlers()
    const isValid = !error


    // modal and loading
    const [showConfirm, setShowConfirm] = useState(false)
    const [showDetailed, setShowDetailed] = useState(false)
    const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm


    // txn values
    const [txHash, setTxHash] = useState("");
    const [deadline] = useUserDeadline();
    const [allowedSlippage] = useUserSlippageTolerance();

    const formattedAmounts = {
        [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
            ? '0'
            : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
                ? '<1'
                : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
        [Field.LIQUIDITY]:
            independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) || '',
        [Field.CURRENCY_A]:
            independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) || '',
        [Field.CURRENCY_B]:
            independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) || '',
    }

    const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

    // pair contract
    const pairContract = usePairContract(pair?.liquidityToken?.address)

    // allowance handling
    const [signatureData, setSignatureData] = useState(null)
    const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS[chainId])
    async function onAttemptToApprove() {
        if (!pairContract || !pair || !library) throw new Error('missing dependencies')
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
        if (!liquidityAmount) throw new Error('missing liquidity amount')
        // try to gather a signature for permission
        const nonce = await pairContract.nonces(account)

        const deadlineForSignature = Math.ceil(Date.now() / 1000) + deadline

        const EIP712Domain = [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ]
        const domain = {
            name: 'Annex LPs',
            version: '1',
            chainId,
            verifyingContract: pair.liquidityToken.address,
        }
        const Permit = [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ]
        const message = {
            owner: account,
            spender: ROUTER_ADDRESS[chainId],
            value: liquidityAmount.raw.toString(),
            nonce: nonce.toHexString(),
            deadline: deadlineForSignature,
        }
        const data = JSON.stringify({
            types: {
                EIP712Domain,
                Permit,
            },
            domain,
            primaryType: 'Permit',
            message,
        })

        library
            .send('eth_signTypedData_v4', [account, data])
            .then(splitSignature)
            .then((signature) => {
                setSignatureData({
                    v: signature.v,
                    r: signature.r,
                    s: signature.s,
                    deadline: deadlineForSignature,
                })
            })
            .catch((e) => {
                // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
                if (e?.code !== 4001) {
                    approveCallback()
                }
            })
    }

    // wrapped onUserInput to clear signatures
    const onUserInput = useCallback(
        (field, val) => {
            setSignatureData(null)
            return _onUserInput(field, val)
        },
        [_onUserInput]
    )

    const onLiquidityInput = useCallback((val) => onUserInput(Field.LIQUIDITY, val), [onUserInput])
    const onCurrencyAInput = useCallback((val) => onUserInput(Field.CURRENCY_A, val), [onUserInput])
    const onCurrencyBInput = useCallback((val) => onUserInput(Field.CURRENCY_B, val), [onUserInput])

    // tx sending
    const addTransaction = useTransactionAdder()
    async function onRemove() {
        if (!chainId || !library || !account) throw new Error('missing dependencies')
        const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
        if (!currencyAmountA || !currencyAmountB) {
            throw new Error('missing currency amounts')
        }
        const router = getRouterContract(chainId, library, account)

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
            [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
        }

        if (!currencyA || !currencyB) throw new Error('missing tokens')
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
        if (!liquidityAmount) throw new Error('missing liquidity amount')

        const currencyBIsETH = currencyB === ETHER
        const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
        const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

        if (!tokenA || !tokenB) throw new Error('could not wrap')

        let methodNames
        let args
        // we have approval, use normal remove liquidity
        if (approval === ApprovalState.APPROVED) {
            // removeLiquidityETH
            if (oneCurrencyIsETH) {
                methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
                    account,
                    deadlineFromNow,
                ]
            }
            // removeLiquidity
            else {
                methodNames = ['removeLiquidity']
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    deadlineFromNow,
                ]
            }
        }
        // we have a signataure, use permit versions of remove liquidity
        else if (signatureData !== null) {
            // removeLiquidityETHWithPermit
            if (oneCurrencyIsETH) {
                methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s,
                ]
            }
            // removeLiquidityETHWithPermit
            else {
                methodNames = ['removeLiquidityWithPermit']
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s,
                ]
            }
        } else {
            throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
        }
        // eslint-disable-next-line no-undef
        const safeGasEstimates = await Promise.all(
            methodNames.map((methodName, index) =>
                router.estimateGas[methodName](...args)
                    .then(calculateGasMargin)
                    .catch((e) => {
                        console.error(`estimateGas failed`, index, methodName, args, e)
                        return undefined
                    })
            )
        )

        const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
            BigNumber.isBigNumber(safeGasEstimate)
        )

        // all estimations failed...
        if (indexOfSuccessfulEstimation === -1) {
            console.error('This transaction would fail. Please contact support.')
        } else {
            const methodName = methodNames[indexOfSuccessfulEstimation]
            const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

            setAttemptingTxn(true)
            await router[methodName](...args, {
                gasLimit: safeGasEstimate,
            })
                .then((response) => {
                    setAttemptingTxn(false)

                    addTransaction(response, {
                        summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
                            currencyA?.symbol
                        } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`,
                    })

                    setTxHash(response.hash)
                })
                .catch((e) => {
                    setAttemptingTxn(false)
                    // we only care if the error is something _other_ than the user rejected the tx
                    console.error(e)
                })
        }
    }



    const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencyA?.symbol
    } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

    const liquidityPercentChangeCallback = useCallback(
        (value) => {
            onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
        },
        [onUserInput]
    )

    const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
    const oneCurrencyIsWETH = Boolean(
        chainId &&
        ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
            (currencyB && currencyEquals(WETH[chainId], currencyB)))
    )

    const handleSelectCurrencyA = useCallback(
        (currency) => {
            if (currencyIdB && currencyId(currency) === currencyIdB) {
                history.push(`/trade/liquidity/remove/${currencyId(currency)}/${currencyIdA}`);
            } else {
                history.push(`/trade/liquidity/remove/${currencyId(currency)}/${currencyIdB}`);
            }
        },
        [currencyIdA, currencyIdB, history]
    );
    const handleSelectCurrencyB = useCallback(
        (currency) => {
            if (currencyIdA && currencyId(currency) === currencyIdA) {
                history.push(`/trade/liquidity/remove/${currencyIdB}/${currencyId(currency)}`);
            } else {
                history.push(`/trade/liquidity/remove/${currencyIdA}/${currencyId(currency)}`);
            }
        },
        [currencyIdA, currencyIdB, history]
    );

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        setSignatureData(null) // important that we clear signature data to avoid bad sigs
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.LIQUIDITY_PERCENT, '0')
        }
        setTxHash('')
    }, [onUserInput, txHash])

    const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
        Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
        liquidityPercentChangeCallback
    )

    function modalHeader() {
        return (
            <AutoColumn gap="md" style={{ marginTop: "20px" }}>
                <RowBetween align="flex-end">
                    <span className={'text-xl text-white'}>
                        {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                    </span>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyA} size="24px" />
                        <span className={'text-xl ml-2 text-white'}>
                            {currencyA?.symbol}
                        </span>
                    </RowFixed>
                </RowBetween>
                <RowFixed>
                    <Plus size="16" color={"#FFF"} />
                </RowFixed>
                <RowBetween align="flex-end">
                    <span className={'text-xl text-white'} >
                        {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
                    </span>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyB} size="24px" />
                        <span className={'text-xl ml-2 text-white'}>
                            {currencyB?.symbol}
                        </span>
                    </RowFixed>
                </RowBetween>

                <span className="text-sm italic text-gray text-left pt-3">
                    {`Output is estimated. If the price changes by more than ${
                        allowedSlippage / 100
                    }% your transaction will revert.`}
                </span>
            </AutoColumn>
        )
    }

    function modalBottom() {
        return (
            <>
                <RowBetween>
                    <span className={'text-gray text-lg font-bold'}>
                        {`FLIP ${currencyA?.symbol}/${currencyB?.symbol}`} Burned
                    </span>
                    <RowFixed>
                        <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin />
                        <span className={'text-white'}>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</span>
                    </RowFixed>
                </RowBetween>
                {pair && (
                    <>
                        <RowBetween>
                            <span className={'text-gray text-lg font-bold'}>Price</span>
                            <span className={'text-white'}>
                                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"}{" "}
                                {currencyB?.symbol}
                            </span>
                        </RowBetween>
                        <RowBetween>
                            <div />
                            <span className={'text-white'}>
                                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"}{" "}
                                {currencyA?.symbol}
                            </span>
                        </RowBetween>
                    </>
                )}
                <button
                    className="bg-primaryLight py-2 rounded px-32 transition-all
                            h-12 text-black disabled:opacity-50 w-full
                            flex items-center justify-center"
                    disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
                    onClick={onRemove}
                >
                    Confirm
                </button>
            </>
        );
    }

    return (
        <div className="py-10 w-full max-w-2xl">
            <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash || ""}
                content={() => (
                    <ConfirmationModalContent
                        title="You will receive"
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
                    />
                )}
                pendingText={pendingText}
            />

            <div className="w-full max-w-2xl py-8 px-6 sm:px-10 bg-black rounded-xl">
                <div>
                    <div className="bg-fadeBlack rounded-xl p-5 w-full">
                        <AutoColumn>
                            <RowBetween>
                                <span className="text-white font-bold text-xl">Amount</span>
                                <div
                                    className="text-primaryLight text-sm px-4 py-2 rounded-xl border
                                    border-primaryLight flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                        setShowDetailed(!showDetailed);
                                    }}
                                >
                                    {showDetailed ? "Simple" : "Detailed"}

                                </div>
                            </RowBetween>
                            <div className="flex items-center mt-12">
                                <span className="text-6xl text-white font-bold">
                                    {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                                </span>
                            </div>
                            {!showDetailed && (
                                <>
                                    <div className="flex items-center my-4">
                                        <Slider
                                            value={innerLiquidityPercentage}
                                            onChange={setInnerLiquidityPercentage}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 mt-3">
                                        <button
                                            className="transition-all border border-primaryLight text-white bg-transparent
                                            focus:outline-none flex-grow hover:bg-primaryLight hover:text-black rounded-lg py-3"
                                            onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "25")}
                                        >
                                            25%
                                        </button>
                                        <button
                                            className="transition-all border border-primaryLight text-white bg-transparent
                                            focus:outline-none flex-grow hover:bg-primaryLight hover:text-black rounded-lg py-3"
                                            onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "50")}
                                        >
                                            50%
                                        </button>
                                        <button
                                            className="transition-all border border-primaryLight text-white bg-transparent
                                            focus:outline-none flex-grow hover:bg-primaryLight hover:text-black rounded-lg py-3"
                                            onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "75")}
                                        >
                                            75%
                                        </button>
                                        <button
                                            className="transition-all border border-primaryLight text-white bg-transparent
                                            focus:outline-none flex-grow hover:bg-primaryLight hover:text-black rounded-lg py-3"
                                            onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")}
                                        >
                                            Max
                                        </button>
                                    </div>
                                </>
                            )}
                        </AutoColumn>
                    </div>
                    {!showDetailed && (
                        <>
                            <ColumnCenter className={'py-6'}>
                                <ArrowDown size={'16px'} color={"#fff"}/>
                            </ColumnCenter>
                            <div>
                                <div className="bg-fadeBlack rounded-xl p-5 w-full">
                                    <AutoColumn gap="10px">
                                        <RowBetween>
                                            <span className={'text-xl text-white'}>
                                                {formattedAmounts[Field.CURRENCY_A] || "-"}
                                            </span>
                                            <RowFixed>
                                                <CurrencyLogo
                                                    currency={currencyA}
                                                    style={{ marginRight: "12px" }}
                                                />
                                                <span className={'text-xl text-white'} id="remove-liquidity-tokena-symbol">
                                                    {currencyA?.symbol}
                                                </span>
                                            </RowFixed>
                                        </RowBetween>
                                        <RowBetween>
                                            <span className={'text-xl text-white'}>{formattedAmounts[Field.CURRENCY_B] || "-"}</span>
                                            <RowFixed>
                                                <CurrencyLogo
                                                    currency={currencyB}
                                                    style={{ marginRight: "12px" }}
                                                />
                                                <span className={'text-xl text-white'} id="remove-liquidity-tokenb-symbol">
                                                    {currencyB?.symbol}
                                                </span>
                                            </RowFixed>
                                        </RowBetween>
                                        {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                                            <RowBetween style={{ justifyContent: "flex-end" }}>
                                                {oneCurrencyIsETH ? (
                                                    <Link
                                                        className={"text-primary font-bold focus:outline-none"}
                                                        to={`/trade/liquidity/remove/${
                                                            currencyA === ETHER
                                                                ? WETH[chainId].address
                                                                : currencyIdA
                                                        }/${
                                                            currencyB === ETHER
                                                                ? WETH[chainId].address
                                                                : currencyIdB
                                                        }`}
                                                    >
                                                        Receive WBNB
                                                    </Link>
                                                ) : oneCurrencyIsWETH ? (
                                                    <Link
                                                        className={"text-primary font-bold focus:outline-none"}
                                                        to={`/trade/liquidity/remove/${
                                                            currencyA && currencyEquals(currencyA, WETH[chainId])
                                                                ? "ETH"
                                                                : currencyIdA
                                                        }/${
                                                            currencyB && currencyEquals(currencyB, WETH[chainId])
                                                                ? "ETH"
                                                                : currencyIdB
                                                        }`}
                                                    >
                                                        Receive BNB
                                                    </Link>
                                                ) : null}
                                            </RowBetween>
                                        ) : null}
                                    </AutoColumn>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="pb-6 mt-8">
                        {showDetailed && (
                            <div className={'mb-10'}>
                                <CurrencyInputPanel
                                    value={formattedAmounts[Field.LIQUIDITY]}
                                    onUserInput={onLiquidityInput}
                                    onMax={() => {
                                        onUserInput(Field.LIQUIDITY_PERCENT, "100");
                                    }}
                                    showMaxButton={!atMaxAmount}
                                    disableCurrencySelect
                                    currency={pair?.liquidityToken}
                                    pair={pair}
                                    id="liquidity-amount"
                                />
                                <ColumnCenter className={"pt-6 pb-2"}>
                                    <ArrowDown size="16" color={"#fff"} />
                                </ColumnCenter>
                                <CurrencyInputPanel
                                    hideBalance
                                    value={formattedAmounts[Field.CURRENCY_A]}
                                    onUserInput={onCurrencyAInput}
                                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")}
                                    showMaxButton={!atMaxAmount}
                                    currency={currencyA}
                                    label="Output"
                                    onCurrencySelect={handleSelectCurrencyA}
                                    id="remove-liquidity-tokena"
                                />
                                <ColumnCenter className={"pt-6 pb-2"}>
                                    <Plus size="16" color={"#fff"} />
                                </ColumnCenter>
                                <CurrencyInputPanel
                                    hideBalance
                                    value={formattedAmounts[Field.CURRENCY_B]}
                                    onUserInput={onCurrencyBInput}
                                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "100")}
                                    showMaxButton={!atMaxAmount}
                                    currency={currencyB}
                                    label="Output"
                                    onCurrencySelect={handleSelectCurrencyB}
                                    id="remove-liquidity-tokenb"
                                />
                            </div>
                        )}
                        {pair && (
                            <div style={{ paddingBottom: "24px", color: "white" }}>
                                <RowBetween>
                                    Price:
                                    <div>
                                        1 {currencyA?.symbol} ={" "}
                                        {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"} {currencyB?.symbol}
                                    </div>
                                </RowBetween>
                                <RowBetween>
                                    <div />
                                    <div>
                                        1 {currencyB?.symbol} ={" "}
                                        {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"} {currencyA?.symbol}
                                    </div>
                                </RowBetween>
                            </div>
                        )}

                        {pair ? (
                            <AutoColumn style={{ marginBottom: "1rem" }}>
                                <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                            </AutoColumn>
                        ) : null}

                        <div className="relative">
                            {!account ? (
                                <div className="w-full flex items-center justify-center">
                                    <button
                                        className="bg-primaryLight py-2 rounded px-32 transition-all
                                        h-12 text-black disabled:opacity-50
                                        flex items-center justify-center"
                                        onClick={() => setConnectWalletsOpen(true)}
                                    >
                                        Connect Wallet
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-4">
                                    <button
                                        className="bg-primaryLight py-2 rounded flex-grow flex-basis-50 transition-all
                                        h-12 text-black disabled:opacity-50
                                        flex items-center justify-center"
                                        onClick={onAttemptToApprove}
                                        disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                                    >
                                        {approval === ApprovalState.PENDING ? (
                                            <Dots>Approving</Dots>
                                        ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                                            "Approved"
                                        ) : (
                                            "Approve"
                                        )}
                                    </button>
                                    <button
                                        className="bg-primaryLight py-2 rounded flex-grow flex-basis-50 transition-all
                                        h-12 text-black disabled:opacity-50
                                        flex items-center justify-center"
                                        onClick={() => {
                                            setShowConfirm(true);
                                        }}
                                        disabled={
                                            !isValid ||
                                            (signatureData === null && approval !== ApprovalState.APPROVED)
                                        }
                                    >
                                        {error || "Remove"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ConnectWalletModal
                open={connectWalletsOpen}
                onSetOpen={() => setConnectWalletsOpen(true)}
                onCloseModal={() => setConnectWalletsOpen(false)}
            />
        </div>
    )

}

export default RemoveLiquidity;
