import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import coinImg from '../../assets/images/coins/ann.png';
// import available from '../../assets/images/coins/XAI.png';
import BigNumber from 'bignumber.js';
import { getBigNumber } from '../../utilities/common';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import { useActiveWeb3React } from '../../hooks';
import { getAbepContract, getTokenContract, methods } from '../../utilities/ContractService';
import { sendRepay } from '../../utilities/BnbContract';
import styled from 'styled-components';
import NumberFormat from 'react-number-format';
import commaNumber from 'comma-number';
import primaryBigArrow from '../../assets/icons/primaryBigArrow.svg';
import Loading from '../UI/Loading';
import Progress from '../UI/Progress';

const StyledNumberFormat = styled(NumberFormat)`
  width: 95%;
  margin-left: 17.5%;
  margin-right: 5%;
  border: none;
  height: 100%;
  font-size: 40px;
  text-align: center;
  background: transparent;
  color: #ffab2d;

  &:focus {
    outline: none;
  }
`;

const Styles = styled.div`
.tooltip {
  .label{
    left: auto;
    right: 0;
  }
}
`

const format = commaNumber.bindWith(',', '.');

function BorrowRepayModal({ open, onSetOpen, onCloseModal, record: asset, settings, setSetting }) {
  const { account, chainId } = useActiveWeb3React();
  const [currentTab, setCurrentTab] = useState('borrow');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(new BigNumber(0));
  const [borrowBalance, setBorrowBalance] = useState(new BigNumber(0));
  const [borrowPercent, setBorrowPercent] = useState(new BigNumber(0));
  const [newBorrowBalance, setNewBorrowBalance] = useState(new BigNumber(0));
  const [newBorrowPercent, setNewBorrowPercent] = useState(new BigNumber(0));

  const updateInfo = useCallback(() => {
    const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
    const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
    const tokenPrice = getBigNumber(asset.tokenPrice);
    if (amount.isZero() || amount.isNaN()) {
      setBorrowBalance(totalBorrowBalance);
      if (totalBorrowLimit.isZero()) {
        setBorrowPercent(new BigNumber(0));
        setNewBorrowPercent(new BigNumber(0));
      } else {
        setBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
        setNewBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
      }
    } else {
      const temp = totalBorrowBalance.plus(amount.times(tokenPrice));
      setBorrowBalance(totalBorrowBalance);
      setNewBorrowBalance(temp);
      if (totalBorrowLimit.isZero()) {
        setBorrowPercent(new BigNumber(0));
        setNewBorrowPercent(new BigNumber(0));
      } else {
        setBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
        setNewBorrowPercent(temp.div(totalBorrowLimit).times(100));
      }
    }
  }, [account, amount, asset]);

  /**
   * Get Allowed amount
   */
  useEffect(() => {
    if (asset.atokenAddress && account) {
      updateInfo();
    }
  }, [account, updateInfo, asset]);

  /**
   * Borrow
   */
  const handleBorrow = () => {
    const appContract = getAbepContract(asset.id, chainId);
    if (asset && account) {
      setIsLoading(true);
      setSetting({
        pendingInfo: {
          type: 'Borrow',
          status: true,
          amount: amount.dp(8, 1).toString(10),
          symbol: asset.symbol,
        },
      });
      methods
        .send(
          appContract.methods.borrow,
          [
            amount
              .times(new BigNumber(10).pow(settings.decimals[asset.id].token))
              .integerValue()
              .toString(10),
          ],
          account,
        )
        .then(() => {
          setAmount(new BigNumber(0));
          setIsLoading(false);
          setSetting({
            pendingInfo: {
              type: '',
              status: false,
              amount: 0,
              symbol: '',
            },
          });
          onCloseModal();
        })
        .catch(() => {
          setIsLoading(false);
          setSetting({
            pendingInfo: {
              type: '',
              status: false,
              amount: 0,
              symbol: '',
            },
          });
        });
    }
  };
  /**
   * Max amount
   */
  const handleMaxAmount = () => {
    const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
    const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
    const tokenPrice = getBigNumber(asset.tokenPrice);
    const safeMax = BigNumber.maximum(
      totalBorrowLimit.times(70).div(100).minus(totalBorrowBalance),
      new BigNumber(0),
    );
    setAmount(BigNumber.minimum(safeMax, asset.liquidity).div(tokenPrice));
  };

  const [isLoadingRepay, setIsLoadingRepay] = useState(false);
  const [isEnabledRepay, setIsEnabledRepay] = useState(false);
  const [amountRepay, setAmountRepay] = useState(new BigNumber(0));
  const [borrowBalanceRepay, setBorrowBalanceRepay] = useState(new BigNumber(0));
  const [borrowPercentRepay, setBorrowPercentRepay] = useState(new BigNumber(0));
  const [newBorrowBalanceRepay, setNewBorrowBalanceRepay] = useState(new BigNumber(0));
  const [newBorrowPercentRepay, setNewBorrowPercentRepay] = useState(new BigNumber(0));

  const updateInfoRepay = useCallback(() => {
    const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
    const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
    const tokenPrice = getBigNumber(asset.tokenPrice);
    if (amountRepay.isZero() || amountRepay.isNaN()) {
      setBorrowBalanceRepay(totalBorrowBalance);
      if (totalBorrowLimit.isZero()) {
        setBorrowPercentRepay(new BigNumber(0));
        setNewBorrowPercentRepay(new BigNumber(0));
      } else {
        setBorrowPercentRepay(totalBorrowBalance.div(totalBorrowLimit).times(100));
        setNewBorrowPercentRepay(totalBorrowBalance.div(totalBorrowLimit).times(100));
      }
    } else {
      const temp = totalBorrowBalance.minus(amountRepay.times(tokenPrice));
      setBorrowBalanceRepay(totalBorrowBalance);
      setNewBorrowBalanceRepay(temp);
      if (totalBorrowLimit.isZero()) {
        setBorrowPercentRepay(new BigNumber(0));
        setNewBorrowPercentRepay(new BigNumber(0));
      } else {
        setBorrowPercentRepay(totalBorrowBalance.div(totalBorrowLimit).times(100));
        setNewBorrowPercentRepay(temp.div(totalBorrowLimit).times(100));
      }
    }
  }, [account, amountRepay, asset]);

  useEffect(() => {
    if (asset.atokenAddress && account) {
      updateInfoRepay();
    }
  }, [account, updateInfoRepay, asset]);

  /**
   * Approve underlying token
   */
  const onApprove = async () => {
    if (asset && account && asset.id !== 'bnb') {
      setIsLoadingRepay(true);
      const tokenContract = getTokenContract(asset.id, chainId);
      methods
        .send(
          tokenContract.methods.approve,
          [asset.atokenAddress, new BigNumber(2).pow(256).minus(1).toString(10)],
          account,
        )
        .then(() => {
          setIsEnabledRepay(true);
          setIsLoadingRepay(false);
        })
        .catch(() => {
          setIsLoadingRepay(false);
        });
    }
  };

  /**
   * Repay Borrow
   */
  const handleRepayBorrow = async () => {
    const appContract = getAbepContract(asset.id, chainId);
    if (asset && account) {
      setIsLoadingRepay(true);
      setSetting({
        pendingInfo: {
          type: 'Repay Borrow',
          status: true,
          amount: amountRepay.dp(8, 1).toString(10),
          symbol: asset.symbol,
        },
      });
      try {
        if (asset.id !== 'bnb') {
          if (amountRepay.eq(asset.borrowBalance)) {
            await methods.send(
              appContract.methods.repayBorrow,
              [new BigNumber(2).pow(256).minus(1).toString(10)],
              account,
            );
          } else {
            await methods.send(
              appContract.methods.repayBorrow,
              [
                amountRepay
                  .times(new BigNumber(10).pow(settings.decimals[asset.id].token))
                  .integerValue()
                  .toString(10),
              ],
              account,
            );
          }
          setAmountRepay(new BigNumber(0));
          onCloseModal();
          setIsLoadingRepay(false);
          setSetting({
            pendingInfo: {
              type: '',
              status: false,
              amount: 0,
              symbol: '',
            },
          });
        } else {
          sendRepay(
            account,
            amountRepay
              .times(new BigNumber(10).pow(settings.decimals[asset.id].token))
              .integerValue()
              .toString(10),
            chainId,
            () => {
              setAmountRepay(new BigNumber(0));
              setIsLoadingRepay(false);
              onCloseModal();
              setSetting({
                pendingInfo: {
                  type: '',
                  status: false,
                  amount: 0,
                  symbol: '',
                },
              });
            },
          );
        }
      } catch (e) {
        setIsLoadingRepay(false);
        setSetting({
          pendingInfo: {
            type: '',
            status: false,
            amount: 0,
            symbol: '',
          },
        });
      }
    }
  };

  /**
   * Max amount
   */
  const handleMaxAmountRepay = () => {
    setAmountRepay(BigNumber.minimum(asset.walletBalance, asset.borrowBalance));
  };

  useEffect(() => {
    setIsEnabledRepay(asset.isEnabled);
  }, [asset.isEnabled]);

  const PrimaryList = () => (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img className="w-6 h-6" src={asset.img} alt={asset.name} />
          <div className="text-white">Borrow APY</div>
        </div>
        <div className="text-white">{asset.borrowApy.dp(2, 1).toString(10)}%</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img className="w-6 h-6" src={coinImg} alt="ANN" />
          <div className="text-white">Distribution APY</div>
        </div>
        <div className="text-white">
          {getBigNumber(asset.annBorrowApy).dp(2, 1).isGreaterThan(100000000)
            ? 'Infinity'
            : getBigNumber(asset.annBorrowApy).dp(2, 1).toString(10) + '%'}
        </div>
      </div>
      {!new BigNumber(asset.borrowCaps || 0).isZero() && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img className="w-6 h-6" src={coinImg} alt="ANN" />
            <div className="text-white">Borrow Caps</div>
          </div>
          <div className="text-white">
            {format(new BigNumber(asset.borrowCaps || 0).dp(2, 1).toString(10))}
          </div>
        </div>
      )}
    </div>
  );

  const SecondaryList = () => {
    const progressValue =
      currentTab === 'repayBorrow'
        ? amountRepay.isZero() || amountRepay.isNaN()
          ? borrowPercentRepay.toFixed(2)
          : newBorrowPercentRepay.toFixed(2)
        : amount.isZero() || amount.isNaN()
          ? borrowPercent.toFixed(2)
          : newBorrowPercent.toFixed(2);
    return (
      <div className="flex flex-col space-y-4 px-2 mt-8">
        <div className="flex justify-between items-center text-white">
          <div className="text-white">Borrow Balance</div>
          {(currentTab === 'repayBorrow' && (amountRepay.isZero() || amountRepay.isNaN())) ||
            (currentTab === 'borrow' && (amount.isZero() || amount.isNaN())) ? (
            <span>
              $
              {(currentTab === 'repayBorrow' ? borrowBalanceRepay : borrowBalance)
                .dp(2, 1)
                .toString(10)}
            </span>
          ) : (
            <div className="flex">
              <div className="text-white">
                $
                {(currentTab === 'repayBorrow' ? borrowBalanceRepay : borrowBalance)
                  .dp(2, 1)
                  .toString(10)}
              </div>
              <div className="text-primary">
                <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
              </div>
              <div className="text-white">
                $
                {(currentTab === 'repayBorrow' ? newBorrowBalanceRepay : newBorrowBalance)
                  .dp(2, 1)
                  .toString(10)}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-white">
          <div className="text-white">Borrow Limit Used</div>
          {(currentTab === 'repayBorrow' && (amountRepay.isZero() || amountRepay.isNaN())) ||
            (currentTab === 'borrow' && (amount.isZero() || amount.isNaN())) ? (
            <span>
              {(currentTab === 'repayBorrow' ? borrowPercentRepay : borrowPercent)
                .dp(2, 1)
                .toString(10)}
              %
            </span>
          ) : (
            <div className="flex">
              <div className="text-white">
                {(currentTab === 'repayBorrow' ? borrowPercentRepay : borrowPercent)
                  .dp(2, 1)
                  .toString(10)}
                %
              </div>
              <div className="text-primary">
                <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
              </div>
              <div className="text-white">
                {(currentTab === 'repayBorrow' ? newBorrowPercentRepay : newBorrowPercent)
                  .dp(2, 1)
                  .toString(10)}
                %
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-stretch pt-4">
          <Progress
            strokeWidth={3}
            symbolClassName={'hidden'}
            percent={progressValue > 100 ? 100 : progressValue}
          />
        </div>
      </div>
    );
  };

  const title = (
    <div
      className="flex justify-center items-center space-x-2 pt-6 pb-6 mx-14
                    border-b border-solid border-black"
    >
      <img className="w-8" src={asset.img} alt={asset.name} />
      <div className={'font-bold text-xl'}>{asset.name}</div>
    </div>
  );
  const content = (
    <div className="py-6 px-14">
      <div className="px-8">
        {currentTab === 'repayBorrow' ? (
          <>
            {isEnabledRepay ? (
              <div className="flex align-center input-wrapper">
                {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                <StyledNumberFormat
                  //   autoFocus
                  value={amountRepay.isZero() ? '0' : amountRepay.toString(10)}
                  onValueChange={({ value }) => {
                    setAmountRepay(new BigNumber(value));
                  }}
                  isAllowed={({ value }) => {
                    return new BigNumber(value || 0).isLessThanOrEqualTo(
                      BigNumber.minimum(asset.walletBalance, asset.borrowBalance),
                    );
                  }}
                  thousandSeparator
                  allowNegative={false}
                  placeholder="0"
                />

                <div
                  className="justify-self-end cursor-pointer"
                  onClick={() => handleMaxAmountRepay()}
                >
                  SAFE <br /> MAX
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center pb-4">
                  <img className="w-14" src={asset.img} alt={asset.name} />
                </div>
                <p className="center warning-label text-center">
                  To Repay {asset.name} to the Annex Protocol, you need to approve it first.
                </p>
              </>
            )}
          </>
        ) : (
          <div className="flex align-center input-wrapper">
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <StyledNumberFormat
              //   autoFocus
              value={amount.isZero() ? '0' : amount.toString(10)}
              onValueChange={({ value }) => {
                setAmount(new BigNumber(value));
              }}
              isAllowed={({ value }) => {
                const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
                const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
                return new BigNumber(value || 0)
                  .times(asset.tokenPrice)
                  .plus(totalBorrowBalance)
                  .isLessThanOrEqualTo(totalBorrowLimit);
              }}
              thousandSeparator
              allowNegative={false}
              placeholder="0"
            />

            <div className="justify-self-end cursor-pointer" onClick={() => handleMaxAmount()}>
              SAFE <br /> MAX
            </div>
          </div>
        )}
      </div>
      <div className="flex mt-16 bg-black rounded-4xl border border-primary">
        <button
          className={`py-4 px-10 w-full focus:outline-none rounded-4xl font-bold ${currentTab === 'borrow' ?
            'bg-primaryLight text-black' : 'bg-black'
            }`}
          onClick={() => setCurrentTab('borrow')}
        >
          Borrow
        </button>
        <button
          className={`py-4 px-10 w-full focus:outline-none rounded-4xl font-bold ${currentTab === 'repayBorrow' ?
            'bg-primaryLight text-black' : 'bg-black'
            }`}
          onClick={() => setCurrentTab('repayBorrow')}
        >
          Repay Borrow
        </button>
      </div>
      <div className="bg-black w-full mt-10 p-6 rounded-lg">
        <PrimaryList />
        {currentTab === 'borrow' || (currentTab === 'repayBorrow' && isEnabledRepay) ? (
          <>
            <div className="mx-auto w-full max-w-md border-b border-solid border-darkerBlue mt-10" />
            <SecondaryList />
          </>
        ) : null}
        <div className="flex justify-center">
          {currentTab === 'repayBorrow' ? (
            <div className="flex justify-center mt-16">
              {!isEnabledRepay && asset.id !== 'bnb' ? (
                <button
                  disabled={isLoadingRepay}
                  onClick={() => {
                    onApprove();
                  }}
                  className="bg-primaryLight py-2 rounded px-32 transition-all disabled:opacity-50
                            h-12 text-black flex items-center justify-center"
                >
                  {isLoadingRepay && <Loading size={'18px'} margin={'8px'} />} Enable
                </button>
              ) : (
                <button
                  className="bg-primaryLight py-2 rounded px-32 transition-all
                            h-12 text-black disabled:opacity-50
                            flex items-center justify-center"
                  disabled={
                    isLoadingRepay ||
                    amountRepay.isZero() ||
                    amountRepay.isNaN() ||
                    amountRepay.isGreaterThan(
                      BigNumber.minimum(asset.walletBalance, asset.borrowBalance),
                    )
                  }
                  onClick={handleRepayBorrow}
                >
                  {isLoadingRepay && <Loading size={'18px'} margin={'8px'} />} Repay Borrow
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-16">
              <button
                className="bg-primaryLight py-2 rounded px-32 transition-all disabled:opacity-50
                        h-12 text-black flex items-center justify-center"
                disabled={
                  isLoading ||
                  amount.isZero() ||
                  amount.isNaN() ||
                  amount.isGreaterThan(asset.liquidity.div(asset.tokenPrice)) ||
                  newBorrowPercent.isGreaterThan(100) ||
                  (!new BigNumber(asset.borrowCaps || 0).isZero() &&
                    amount.plus(asset.totalBorrows).isGreaterThan(asset.borrowCaps))
                }
                onClick={handleBorrow}
              >
                {isLoading && <Loading size={'18px'} margin={'8px'} />} Borrow
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between mt-6">
            <div className="">Currently Borrowing</div>
            <Styles>
              <div className="tooltip relative">
                <div className="tooltip-label">
                  {asset.borrowBalance && format(asset.borrowBalance.dp(2, 1).toString(10))}{' '}
                  {asset.symbol}
                </div>
                <span className="label">{asset.borrowBalance && format(asset.borrowBalance.toString(10))}{' '}
                  {asset.symbol}</span>
              </div>
            </Styles>
          </div>
          <div className="flex justify-between mt-6">
            <div className="">Wallet Balance</div>
            <Styles>
              <div className="tooltip relative">
                <div className="tooltip-label">
                  {asset.borrowBalance && format(asset.walletBalance.dp(2, 1).toString(10))}{' '}
                  {asset.symbol}
                </div>
                <span className="label">{asset.borrowBalance && format(asset.walletBalance.toString(10))}{' '}
                  {asset.symbol}</span>
              </div>
            </Styles>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Modal
        title={title}
        content={content}
        open={open}
        onSetOpen={onSetOpen}
        onCloseModal={() => {
          setAmountRepay(new BigNumber(0));
          setAmount(new BigNumber(0));
          onCloseModal();
        }}
        afterCloseModal={() => setCurrentTab('borrow')}
      />
    </div>
  );
}

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
    },
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(BorrowRepayModal);
