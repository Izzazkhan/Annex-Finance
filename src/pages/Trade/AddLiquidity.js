import React, { useCallback, useState } from 'react';
import help from '../../assets/icons/help.svg';
import blackPlus from '../../assets/icons/blackPlus.svg';
import { useActiveWeb3React } from '../../hooks';
import { useCurrency } from '../../hooks/Tokens';
import { currencyEquals, ETHERS, WETH } from '@annex/sdk';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useTransactionAdder,
  useUserDeadline,
  useUserSlippageTolerance,
} from '../../core';
import { Field } from '../../core/modules/mint/actions';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils';
import { ONE_BIPS, ROUTER_ADDRESS } from '../../constants/swap';
import maxAmountSpend from '../../utils/maxAmountSpend';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import currencyId from '../../utils/currencyId';
import TransactionConfirmationModal from '../../components/swap/TransactionConfirmationModal/TransactionConfrimationModal';
import ConfirmationModalContent from '../../components/swap/TransactionConfirmationModal/ConfirmationModalContent';
import { AutoColumn, ColumnCenter } from '../../components/UI/Column';
import Row, { RowBetween, RowFlat } from '../../components/UI/Row';
import DoubleCurrencyLogo from '../../components/common/DoubleLogo';
import ConfirmAddModalBottom from '../../components/swap/ConfirmAddModalBottom';
import CurrencyInputPanel from '../../components/swap/CurrencyInputPanel';
import { PairState } from '../../data/Reserves';
import { Dots } from '../../components/UI/Dots';
import { MinimalPositionCard } from '../../components/swap/PositionCard';
import { BigNumber } from '@ethersproject/bignumber';

const PlusIcon = () => (
  <div className=" mt-12 mb-4">
    <img src={blackPlus} alt="" />
  </div>
);

function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}) {
  const { account, chainId, library } = useActiveWeb3React();
  const currencyA = useCurrency(currencyIdA, chainId);
  const currencyB = useCurrency(currencyIdB, chainId);

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId]))),
  );

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA || undefined, currencyB || undefined);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState('');

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity
      ? otherTypedValue
      : parsedAmounts[dependentField]?.toSignificant(6) || '',
  };

  // get the max amounts user can add
  const maxAmounts = [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field], chainId),
    };
  }, {});

  const atMaxAmounts = [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] || '0'),
    };
  }, {});

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    ROUTER_ADDRESS[chainId],
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    ROUTER_ADDRESS[chainId],
  );

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    if (!chainId || !library || !account) return;
    const router = getRouterContract(chainId, library, account);

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        parsedAmountA,
        noLiquidity ? 0 : allowedSlippage,
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB,
        noLiquidity ? 0 : allowedSlippage,
      )[0],
    };

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let estimate;
    let method;
    let args;
    let value;
    if (currencyA === ETHERS[chainId] || currencyB === ETHERS[chainId]) {
      const tokenBIsETH = currencyB === ETHERS[chainId];
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address || '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow,
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address || '',
        wrappedCurrency(currencyB, chainId)?.address || '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow,
      ];
      value = null;
    }

    setAttemptingTxn(true);
    // const aa = await estimate(...args, value ? { value } : {})
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencies[Field.CURRENCY_A]?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${
              currencies[Field.CURRENCY_B]?.symbol
            }`,
          });

          setTxHash(response.hash);
        }),
      )
      .catch((e) => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (e?.code !== 4001) {
          console.error(e);
        }
      });
  }

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_B]?.symbol
  }`;

  const handleCurrencyASelect = useCallback(
    (currA) => {
      const newCurrencyIdA = currencyId(currA, chainId);
      console.log('------- ', newCurrencyIdA, currencyIdB)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/trade/liquidity/add/${currencyIdB}/${currencyIdA}`);
      } else {
        if (currencyIdB) {
          history.push(`/trade/liquidity/add/${newCurrencyIdA}/${currencyIdB}`);
        } else {
          history.push(`/trade/liquidity/add/${newCurrencyIdA}`);
        }
      }
    },
    [currencyIdB, history, currencyIdA],
  );
  const handleCurrencyBSelect = useCallback(
    (currB) => {
      const newCurrencyIdB = currencyId(currB, chainId);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/trade/liquidity/add/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/trade/liquidity/add/${newCurrencyIdB}`);
        }
      } else {
        history.push(`/trade/liquidity/add/${currencyIdA || 'ETH'}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, history, currencyIdB],
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
    }
    setTxHash('');
  }, [onFieldAInput, txHash]);

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <div className={'mt-5 mb-8 rounded-xl w-full border border-fadeBlack'}>
          <RowFlat style={{ alignItems: 'center' }}>
            <span className={'text-5xl leading-none mr-3 text-white'}>
              {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol}`}
            </span>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </div>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px', marginBottom: '32px', alignItems: 'center' }}>
          <span className={'text-5xl leading-none mr-3 text-white'}>
            {liquidityMinted?.toSignificant(6)}
          </span>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <span className={'text-2xl text-white'}>
            {`${currencies[Field.CURRENCY_A]?.symbol}/${
              currencies[Field.CURRENCY_B]?.symbol
            } Pool Tokens`}
          </span>
        </Row>
        <span className={'text-left text-xs pt-2'}>
          {`Output is estimated. If the price changes by more than ${
            allowedSlippage / 100
          }% your transaction will revert.`}
        </span>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    );
  };

  return (
    <div className="py-10 w-full max-w-2xl">
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
        )}
        pendingText={pendingText}
      />
      <div className="w-full max-w-2xl py-8 px-6 sm:px-10 bg-black rounded-xl">
        <div>
          <div className="flex justify-between">
            <div className={`text-xl text-white`}>Add Liquidity</div>
            <div className="cursor-pointer" onClick={() => {}}>
              <div className="tooltip relative">
                <div className="tooltip-label">
                  {' '}
                  <img src={help} alt="help" />
                </div>
                <span className="label">Add Liquidity</span>
              </div>
            </div>
          </div>
          {noLiquidity && (
            <ColumnCenter>
              <div className={'p-4 rounded-lg mb-4 bg-fadeBlack mt-8 w-full'}>
                <AutoColumn gap="12px">
                  <span className={'text-white'}>You are the first liquidity provider.</span>
                  <span className={'text-white'}>
                    The ratio of tokens you add will set the price of this pool.
                  </span>
                  <span className={'text-white'}>
                    Once you are happy with the rate click supply to review.
                  </span>
                </AutoColumn>
              </div>
            </ColumnCenter>
          )}
          <div className="flex flex-col items-center mt-8">
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() || '');
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={currencies[Field.CURRENCY_A]}
              id="add-liquidity-input-tokena"
              showCommonBases={false}
            />
            <PlusIcon />
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() || '');
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={currencies[Field.CURRENCY_B]}
              id="add-liquidity-input-tokenb"
              showCommonBases={false}
            />
          </div>
          {currencies[Field.CURRENCY_A] &&
            currencies[Field.CURRENCY_B] &&
            pairState !== PairState.INVALID && (
              <div className="bg-primary bg-opacity-70 p-6 rounded-3xl w-full mt-8">
                <div className="font-bold">PRICE AND POOL SHARE</div>
                <div className="flex justify-between mt-4 px-10">
                  <div className="">
                    <div className="font-bold text-lg">{price?.toSignificant(6) || '-'}</div>
                    <div className="mt-2">
                      {currencies[Field.CURRENCY_B]?.symbol} per{' '}
                      {currencies[Field.CURRENCY_A]?.symbol}
                    </div>
                  </div>
                  <div className="">
                    <div className="font-bold text-lg">
                      {price?.invert()?.toSignificant(6) || '-'}
                    </div>
                    <div className="mt-2">
                      {currencies[Field.CURRENCY_A]?.symbol} per{' '}
                      {currencies[Field.CURRENCY_B]?.symbol}
                    </div>
                  </div>
                  <div className="">
                    <div className="font-bold text-lg">
                      {noLiquidity && price
                        ? '100'
                        : (poolTokenPercentage?.lessThan(ONE_BIPS)
                            ? '<0.01'
                            : poolTokenPercentage?.toFixed(2)) || '0'}
                      %
                    </div>
                    <div className="mt-2">Share of Pool</div>
                  </div>
                </div>
              </div>
            )}
          <div className="flex justify-center mt-6">
            {!account ? (
              <button
                disabled
                className={`focus:outline-none py-2 px-12 flex-grow text-black text-xl h-14 bgPrimaryGradient rounded-lg`}
              >
                Connect to wallet
              </button>
            ) : (
              <AutoColumn gap="md" className={'w-full'}>
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween className={'space-x-3 w-full'}>
                      {approvalA !== ApprovalState.APPROVED && (
                        <button
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          className={`focus:outline-none py-2 px-8 flex-grow text-black text-lg h-14 bgPrimaryGradient rounded-lg`}
                          style={{
                            width: approvalB !== ApprovalState.APPROVED ? '48%' : '100%',
                          }}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                          ) : (
                            `Approve ${currencies[Field.CURRENCY_A]?.symbol}`
                          )}
                        </button>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <button
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          className={`focus:outline-none py-2 px-8 flex-grow text-black text-lg h-14 bgPrimaryGradient rounded-lg`}
                          style={{
                            width: approvalA !== ApprovalState.APPROVED ? '48%' : '100%',
                          }}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                          ) : (
                            `Approve ${currencies[Field.CURRENCY_B]?.symbol}`
                          )}
                        </button>
                      )}
                    </RowBetween>
                  )}

                <button
                  onClick={() => {
                    setShowConfirm(true);
                  }}
                  disabled={
                    !isValid ||
                    approvalA !== ApprovalState.APPROVED ||
                    approvalB !== ApprovalState.APPROVED
                  }
                  className={`focus:outline-none py-2 px-12 flex-grow text-black text-xl h-14 bgPrimaryGradient rounded-lg`}
                >
                  {error || 'Supply'}
                </button>
              </AutoColumn>
            )}
          </div>
        </div>
      </div>
      {pair && !noLiquidity && pairState !== PairState.INVALID && (
        <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
      )}
    </div>
  );
}

export default AddLiquidity;
