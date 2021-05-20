import React, {useCallback, useEffect, useState} from 'react';
import Modal from '../UI/Modal';
import NumberFormat from 'react-number-format'
import coinImg from '../../assets/images/coins/ann.png';
import available from '../../assets/images/coins/xai.svg';
import BigNumber from "bignumber.js";
import {getBigNumber} from "../../utilities/common";
import {bindActionCreators} from "redux";
import {accountActionCreators, connectAccount} from "../../core";
import {useActiveWeb3React} from "../../hooks";
import {
    getAbepContract,
    getComptrollerContract,
    getTokenContract,
    methods
} from "../../utilities/ContractService";
import {sendSupply} from "../../utilities/BnbContract";
import commaNumber from "comma-number";
import primaryBigArrow from "../../assets/icons/primaryBigArrow.svg";
import styled from "styled-components";

const StyledNumberFormat = styled(NumberFormat)`
    width: 65%;
    margin-left: 17.5%;
    border: none;
    height: 100%;
    font-size: 40px;
    text-align: center;
    background: transparent;
    color: #FF9800;
    
    &:focus {
        outline: none;
    }
`

const format = commaNumber.bindWith(',', '.');

function SupplyWithdrawModal({ open, onSetOpen, onCloseModal, record, settings, setSetting }) {
    // Supply
    const { account } = useActiveWeb3React();
    const [currentTab, setCurrentTab] = useState('supply');
    const [isLoading, setIsLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [amount, setAmount] = useState(new BigNumber(0));
    const [borrowLimit, setBorrowLimit] = useState(new BigNumber(0));
    const [borrowPercent, setBorrowPercent] = useState(new BigNumber(0));
    const [newBorrowLimit, setNewBorrowLimit] = useState(new BigNumber(0));
    const [newBorrowPercent, setNewBorrowPercent] = useState(new BigNumber(0));

    const updateInfo = useCallback(async () => {
        const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
        const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
        const tokenPrice = getBigNumber(record.tokenPrice);
        const collateralFactor = getBigNumber(record.collateralFactor);

        if (tokenPrice && !amount.isZero() && !amount.isNaN()) {
            const temp = totalBorrowLimit.plus(
                amount.times(tokenPrice).times(collateralFactor)
            );
            setNewBorrowLimit(BigNumber.maximum(temp, 0));
            setNewBorrowPercent(totalBorrowBalance.div(temp).times(100));
            if (totalBorrowLimit.isZero()) {
                setBorrowLimit(new BigNumber(0));
                setBorrowPercent(new BigNumber(0));
            } else {
                setBorrowLimit(totalBorrowLimit);
                setBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
            }
        } else if (BigNumber.isBigNumber(totalBorrowLimit)) {
            setBorrowLimit(totalBorrowLimit);
            setNewBorrowLimit(totalBorrowLimit);
            if (totalBorrowLimit.isZero()) {
                setBorrowPercent(new BigNumber(0));
                setNewBorrowPercent(new BigNumber(0));
            } else {
                setBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
                setNewBorrowPercent(
                    totalBorrowBalance.div(totalBorrowLimit).times(100)
                );
            }
        }
    }, [account, amount, record]);


    useEffect(() => {
        setIsEnabled(record.isEnabled);
    }, [record.isEnabled]);

    /**
     * Get Allowed amount
     */
    useEffect(() => {
        if (record.atokenAddress && account) {
            updateInfo();
        }
    }, [account, updateInfo]);


    /**
     * Approve underlying token
     */
    const onApprove = async () => {
        if (record.id && account && record.id !== 'bnb') {
            setIsLoading(true);
            const tokenContract = getTokenContract(record.id);
            methods
                .send(
                    tokenContract.methods.approve,
                    [
                        record.atokenAddress,
                        new BigNumber(2)
                            .pow(256)
                            .minus(1)
                            .toString(10)
                    ],
                    account
                )
                .then(() => {
                    setIsEnabled(true);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    };


    /**
     * Supply
     */
    const handleSupply = () => {
        const appContract = getAbepContract(record.id);
        if (record.id && account) {
            setIsLoading(true);
            setSetting({
                pendingInfo: {
                    type: 'Supply',
                    status: true,
                    amount: amount.dp(8, 1).toString(10),
                    symbol: record.symbol
                }
            });
            if (record.id !== 'bnb') {
                methods
                    .send(
                        appContract.methods.mint,
                        [
                            amount
                                .times(new BigNumber(10).pow(settings.decimals[record.id].token))
                                .toString(10)
                        ],
                        account
                    )
                    .then(() => {
                        setAmount(new BigNumber(0));
                        setIsLoading(false);
                        setSetting({
                            pendingInfo: {
                                type: '',
                                status: false,
                                amount: 0,
                                symbol: ''
                            }
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
                                symbol: ''
                            }
                        });
                    });
            } else {
                sendSupply(
                    account,
                    amount
                        .times(new BigNumber(10).pow(settings.decimals[record.id].token))
                        .toString(10),
                    () => {
                        setAmount(new BigNumber(0));
                        setIsLoading(false);
                        setSetting({
                            pendingInfo: {
                                type: '',
                                status: false,
                                amount: 0,
                                symbol: ''
                            }
                        });
                        onCloseModal();
                    }
                );
            }
        }
    };

    /**
     * Max amount
     */
    const handleMaxAmount = () => {
        setAmount(record.walletBalance);
    };


    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState(new BigNumber(0));
    const [withdrawBorrowLimit, setWithdrawBorrowLimit] = useState(new BigNumber(0));
    const [withdrawBorrowPercent, setWithdrawBorrowPercent] = useState(new BigNumber(0));
    const [withdrawNewBorrowLimit, setWithdrawNewBorrowLimit] = useState(new BigNumber(0));
    const [withdrawNewBorrowPercent, setWithdrawNewBorrowPercent] = useState(new BigNumber(0));
    const [withdrawSafeMaxBalance, setWithdrawSafeMaxBalance] = useState(new BigNumber(0));
    const [withdrawFeePercent, setWithdrawFeePercent] = useState(new BigNumber(0));

    const getFeePercent = async () => {
        const appContract = getComptrollerContract();
        const treasuryPercent = await methods.call(
            appContract.methods.treasuryPercent,
            []
        );
        setWithdrawAmount(new BigNumber(treasuryPercent).times(100).div(1e18));
    };

    useEffect(() => {
        getFeePercent();
    }, []);


    const updateWithdrawInfo = useCallback(async () => {
        const totalBorrowBalance = getBigNumber(settings.totalBorrowBalance);
        const totalBorrowLimit = getBigNumber(settings.totalBorrowLimit);
        const tokenPrice = getBigNumber(record.tokenPrice);
        const { collateral } = record;
        const supplyBalance = getBigNumber(record.supplyBalance);
        const collateralFactor = getBigNumber(record.collateralFactor);
        if (!collateral) {
            setWithdrawSafeMaxBalance(supplyBalance);
            return;
        }
        const safeMax = BigNumber.maximum(
            totalBorrowLimit
                .minus(totalBorrowBalance.div(40).times(100))
                .div(collateralFactor)
                .div(tokenPrice),
            new BigNumber(0)
        );
        setWithdrawSafeMaxBalance(BigNumber.minimum(safeMax, supplyBalance));

        if (tokenPrice && !amount.isZero() && !amount.isNaN()) {
            const temp = totalBorrowLimit.minus(
                amount.times(tokenPrice).times(collateralFactor)
            );
            setWithdrawNewBorrowLimit(temp);
            setWithdrawNewBorrowPercent(totalBorrowBalance.div(temp).times(100));
            if (totalBorrowLimit.isZero()) {
                setWithdrawBorrowLimit(new BigNumber(0));
                setWithdrawBorrowPercent(new BigNumber(0));
            } else {
                setWithdrawBorrowLimit(totalBorrowLimit);
                setWithdrawBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
            }
        } else {
            setWithdrawBorrowLimit(totalBorrowLimit);
            setWithdrawNewBorrowLimit(totalBorrowLimit);
            if (totalBorrowLimit.isZero()) {
                setWithdrawBorrowPercent(new BigNumber(0));
                setWithdrawNewBorrowPercent(new BigNumber(0));
            } else {
                setWithdrawBorrowPercent(totalBorrowBalance.div(totalBorrowLimit).times(100));
                setWithdrawNewBorrowPercent(
                    totalBorrowBalance.div(totalBorrowLimit).times(100)
                );
            }
        }
    }, [account, amount]);


    useEffect(() => {
        if (record.atokenAddress && account) {
            updateWithdrawInfo();
        }
    }, [account, updateWithdrawInfo]);


    /**
     * Withdraw
     */
    const handleWithdraw = async () => {
        const { id: assetId } = record;
        const appContract = getAbepContract(assetId);
        if (assetId && account) {
            setIsWithdrawLoading(true);
            setSetting({
                pendingInfo: {
                    type: 'Withdraw',
                    status: true,
                    amount: amount.dp(8, 1).toString(10),
                    symbol: record.symbol
                }
            });
            try {
                if (amount.eq(record.supplyBalance)) {
                    const aTokenBalance = await methods.call(
                        appContract.methods.balanceOf,
                        [account]
                    );
                    await methods.send(
                        appContract.methods.redeem,
                        [aTokenBalance],
                        account
                    );
                } else {
                    await methods.send(
                        appContract.methods.redeemUnderlying,
                        [
                            amount
                                .times(new BigNumber(10).pow(settings.decimals[assetId].token))
                                .integerValue()
                                .toString(10)
                        ],
                        account
                    );
                }
                setWithdrawAmount(new BigNumber(0));
                setIsWithdrawLoading(false);
                onCloseModal();
                setSetting({
                    pendingInfo: {
                        type: '',
                        status: false,
                        amount: 0,
                        symbol: ''
                    }
                });
            } catch (error) {
                setIsWithdrawLoading(false);
                setSetting({
                    pendingInfo: {
                        type: '',
                        status: false,
                        amount: 0,
                        symbol: ''
                    }
                });
            }
        }
    };


    /**
     * Max amount
     */
    const handleWithdrawMaxAmount = () => {
        setWithdrawAmount(withdrawSafeMaxBalance);
    };


    const PrimaryList = () => (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img className="w-6 h-6" src={record.img} alt={record.name} />
          <div className="text-white">Supply APY</div>
        </div>
        <div className="text-white">
            {record.supplyApy.dp(2, 1).toString(10)}%
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img className="w-6 h-6" src={coinImg} alt={"ANN"} />
          <div className="text-white">Distribution APY</div>
        </div>
        <div className="text-white">
            {getBigNumber(record.annSupplyApy)
                .dp(2, 1)
                .toString(10)}
            %
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img className="w-6 h-6" src={available} alt="XAI" />
          <div className="text-white">Available ANN Limit</div>
        </div>
        <div className="text-white">
            {getBigNumber(settings.mintableXai)
                .dp(2, 1)
                .toString(10)}{' '} ANN</div>
      </div>
    </div>
  );

  const SecondaryList = () => (
    <div className="flex flex-col space-y-4 px-2 mt-8">
      <div className="flex justify-between items-center">
        <div className="text-white">Fee</div>
        <div className="text-white">
            {!amount.isNaN()
                ? new BigNumber(withdrawAmount)
                    .times(withdrawFeePercent / 100)
                    .dp(4)
                    .toString(10)
                : 0}{' '}
            {record.symbol} ({withdrawFeePercent.toString(10)}%)</div>
      </div>
        <div
            className="flex justify-between items-center"
        >
            <div className="text-white text-lg">Borrow Limit</div>
            {withdrawAmount.isZero() || withdrawAmount.isNaN() ? (
                <span>${format(borrowLimit.dp(2, 1).toString(10))}</span>
            ) : (
                <div className="flex">
                    <div className="">${format(borrowLimit.dp(2, 1).toString(10))}</div>
                    <div className="text-primary">
                        <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
                    </div>
                    <div className="">${format(newBorrowLimit.dp(2, 1).toString(10))}</div>
                </div>
            )}
        </div>
        <div className="flex justify-between items-center">
            <div className="text-white text-lg">Borrow Limit Used</div>
            {withdrawAmount.isZero() || withdrawAmount.isNaN() ? (
                <span>{borrowPercent.dp(2, 1).toString(10)}%</span>
            ) : (
                <div className="flex">
                    <div className="">{borrowPercent.dp(2, 1).toString(10)}%</div>
                    <div className="text-primary">
                        <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
                    </div>
                    <div className="">{newBorrowPercent.dp(2, 1).toString(10)}%</div>
                </div>
            )}
        </div>
    </div>
  );

  const SecondarySupplyList = () => (
      <div className="flex flex-col space-y-4 px-2 mt-8">
          <div
              className="flex justify-between items-center"
          >
              <div className="text-white text-lg">Borrow Limit</div>
              {amount.isZero() || amount.isNaN() ? (
                  <span>${format(borrowLimit.dp(2, 1).toString(10))}</span>
              ) : (
                  <div className="flex">
                      <div className="">${format(borrowLimit.dp(2, 1).toString(10))}</div>
                      <div className="text-primary">
                          <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
                      </div>
                      <div className="">${format(newBorrowLimit.dp(2, 1).toString(10))}</div>
                  </div>
              )}
          </div>
          <div className="flex justify-between items-center">
              <div className="text-white text-lg">Borrow Limit Used</div>
              {amount.isZero() || amount.isNaN() ? (
                  <span>{borrowPercent.dp(2, 1).toString(10)}%</span>
              ) : (
                  <div className="flex">
                      <div className="">{borrowPercent.dp(2, 1).toString(10)}%</div>
                      <div className="text-primary">
                          <img src={primaryBigArrow} alt="arrow" className="mx-4 fill-current" />
                      </div>
                      <div className="">{newBorrowPercent.dp(2, 1).toString(10)}%</div>
                  </div>
              )}
          </div>
      </div>
  )

  const title = (
    <div
      className="flex justify-center items-center space-x-2 py-4 mx-14
                    border-b border-solid border-black"
    >
      <img className="w-8" src={record?.img} alt={record?.name} />
      <div>{record?.name}</div>
    </div>
  );


  const content = (
    <div className="py-6 px-14">
      {currentTab === 'supply' && (
        <>
            {record.id === 'bnb' || isEnabled ? (
                <div className="flex align-center input-wrapper">
                    {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                    <StyledNumberFormat autoFocus
                        value={amount.isZero() ? '0' : amount.toString(10)}
                        onValueChange={({ value }) => {
                            setAmount(new BigNumber(value));
                        }}
                        isAllowed={({ value }) => {
                            return new BigNumber(value || 0).isLessThanOrEqualTo(
                                record.walletBalance
                            );
                        }}
                        thousandSeparator
                        allowNegative={false}
                        placeholder="0"
                    />

                    <div className="justify-self-end cursor-pointer" onClick={() => handleMaxAmount()}>
                        SAFE <br /> MAX
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-center pb-4">
                        <img className="w-14" src={record.img} alt={record.name} />
                    </div>
                    <p className="center warning-label">
                        To Supply {record.name} to the Annex Protocol, you need to approve
                        it first.
                    </p>
                </>
            )}
        </>
      )}
      {currentTab === 'withdraw' && (
        <div className="px-8">
          <div className="grid grid-cols-3 justify-items-center items-center">
            <div />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <StyledNumberFormat autoFocus
                value={withdrawAmount.isZero() ? '0' : withdrawAmount.toString(10)}
                onValueChange={({ value }) => {
                    setWithdrawAmount(new BigNumber(value));
                }}
                isAllowed={({ value }) => {
                    return new BigNumber(value || 0).isLessThanOrEqualTo(
                        record.walletBalance
                    );
                }}
                thousandSeparator
                allowNegative={false}
                placeholder="0"
              />

              <div className="justify-self-end cursor-pointer" onClick={() => handleWithdrawMaxAmount()}>
                  SAFE <br /> MAX
              </div>
          </div>
          <p className="text-center mt-6">
            Your available withdraw amount = Total Supply Amount - ANN Mint Amount - Borrowed Amount
          </p>
        </div>
      )}
      <div className="flex mt-16">
        <button
          className={`py-4 px-10 w-full focus:outline-none ${
            currentTab === 'supply' ? 'bg-primary' : 'bg-black'
          }`}
          onClick={() => setCurrentTab('supply')}
        >
          Supply
        </button>
        <button
          className={`py-4 px-10 w-full focus:outline-none ${
            currentTab === 'withdraw' ? 'bg-primary' : 'bg-black'
          }`}
          onClick={() => setCurrentTab('withdraw')}
        >
          Withdraw
        </button>
      </div>
      <div className="bg-black w-full mt-10 p-6">
        <PrimaryList />
        {currentTab === 'withdraw' ? (
          <>
            <div className="mx-auto w-full max-w-md border-b border-solid border-darkerBlue mt-10" />
            <SecondaryList />
          </>
        ) : isEnabled ? (
            <>
                <div className="mx-auto w-full max-w-md border-b border-solid border-darkerBlue mt-10" />
                <SecondarySupplyList />
            </>
        ) : null}
        <div className="mx-auto w-full max-w-md border-b border-solid border-darkerBlue mt-10" />
          {currentTab === 'withdraw' ? (
              <div className="flex justify-center mt-16">
              <button
                  className="bg-primary py-2 rounded px-32 text-black"
                  disabled={
                      isWithdrawLoading ||
                      withdrawAmount.isNaN() ||
                      withdrawAmount.isZero() ||
                      withdrawAmount.isGreaterThan(record.supplyBalance) ||
                      withdrawNewBorrowPercent.isGreaterThan(new BigNumber(100))
                  }
                  onClick={handleWithdraw}
              >
                  {isLoading ? "Loading..." : "Withdraw"}
              </button>
              </div>
          ) : (
              <div className="flex justify-center mt-16">
                  {!isEnabled && record.id !== 'bnb' ? (
                      <button
                          disabled={isLoading}
                          onClick={() => {
                              onApprove();
                          }}
                          className="bg-primary py-2 rounded px-32 text-black">
                          {isLoading ? "Loading..." : "Enable"}
                      </button>
                  ) : (
                      <button
                          className="bg-primary py-2 rounded px-32 text-black"
                          disabled={
                              isLoading ||
                              amount.isNaN() ||
                              amount.isZero() ||
                              amount.isGreaterThan(record.walletBalance)
                          }
                          onClick={handleSupply}
                      >
                          {isLoading ? "Loading..." : "Supply"}
                      </button>
                  )}
              </div>
          )}
          {currentTab === 'withdraw' ? (
              <div className="flex justify-between mt-6">
                  <div className="">Protocol Balance</div>
                  <div className="">
                  {format(record.supplyBalance.dp(2, 1).toString(10))} {record.symbol}
                  </div>
              </div>
          ) : (
              <div className="flex justify-between mt-6">
                  <div className="">Wallet Balance</div>
                  <div className="">
                      {format(record?.walletBalance?.dp(2, 1)?.toString(10))} {record.symbol}
                  </div>
              </div>
          )}
      </div>
    </div>
  );

  return record && (
    <div>
      <Modal
        title={title}
        content={content}
        open={open}
        onSetOpen={onSetOpen}
        onCloseModal={onCloseModal}
        afterCloseModal={() => setCurrentTab('supply')}
      />
    </div>
  );
}


const mapStateToProps = ({ account }) => ({
    settings: account.setting
});

const mapDispatchToProps = dispatch => {
    const { setSetting } = accountActionCreators;

    return bindActionCreators(
        {
            setSetting
        },
        dispatch
    );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(
    SupplyWithdrawModal
);
