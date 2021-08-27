import Progress from "../UI/Progress";
import SummaryCard from "../common/SummaryCard";
import {getBigNumber} from "../../utilities/common";
import ANNBalance from "../../assets/icons/ANN-Balance.svg";
import DailyEarning from "../../assets/icons/Daily-Earning.svg";
import ANNRewards from "../../assets/icons/ANN-Rewards.svg";
import AnnualEarning from "../../assets/icons/Annual-Earning.svg";
import Switch from "../UI/Switch";
import fire from "../../assets/icons/fire.svg";
import React, {useEffect, useState} from "react";
import {useActiveWeb3React} from "../../hooks";
import commaNumber from "comma-number";
import {useCountUp} from "react-countup";
import BigNumber from "bignumber.js";
import styled from "styled-components";
import BorrowLimitProgress from "./BorrowLimitProgress";
import ArrowIcon from '../../assets/icons/lendingArrow.svg';
import SVG from "react-inlinesvg";

const format = commaNumber.bindWith(',', '.');

const formatValue = value => {
    return `$${format(
        getBigNumber(value)
            .dp(2, 1)
            .toString(10)
    )}`;
};

const ArrowDown = styled.button`
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #000000;
  border: 1px solid #2B2B2B;
  transition: 0.3s ease all;
  will-change: background-color, border, transform;
  width: 30px;
  height: 30px;
  
  &:focus,
  &:hover,
  &:active {
    outline: none;
  }
  
  &:hover {
    background-color: #101016;
  }
`

const Wrapper = styled.div`
  background-color: #000;
`

const ArrowContainer = styled.div`
  transform: ${({ active }) => active ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: 0.3s ease all;
  will-change: transform;
`

const AccountOverview = ({
    available,
    borrowPercent,
    balance,
    dailyEarning,
    earnedBalance,
    annualEarning,
    withANN,
    setWithANN,
    netAPY,
    settings
}) => {
    const { account, chainId } = useActiveWeb3React();
    const [showDetails, setShowDetails] = useState(false);
    const { countUp: balanceCountUp, update: balanceUpdate } = useCountUp({ end: 0 });
    const { countUp: supplyCountUp, update: supplyUpdate } = useCountUp({ end: 0 });
    const { countUp: borrowCountUp, update: borrowUpdate } = useCountUp({ end: 0 });

    useEffect(() => {
        if(balance instanceof BigNumber) {
            balanceUpdate(balance.toNumber());
        }
    }, [balance])

    useEffect(() => {
        supplyUpdate(Number(settings.totalSupplyBalance));
    }, [settings.totalSupplyBalance])

    useEffect(() => {
        borrowUpdate(Number(settings.totalBorrowBalance));
    }, [settings.totalBorrowBalance])


    const wrongNetwork = React.useMemo(() => {
        return (process.env.REACT_APP_ENV === 'prod' && chainId !== 56)
            || (process.env.REACT_APP_ENV === 'dev' && chainId !== 97)
    }, [chainId])

    return (
        <Wrapper className="text-white mt-8 p-6 border border-lightGray rounded-md">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between md:px-8 mb-2">
                <div className="flex flex-row items-center justify-between flex-wrap flex-grow">
                    <div className="flex flex-col items-stretch md:items-start flex-grow text-left space-y-1 md:space-y-2 order-first">
                        <div className="text-primary font-bold text-lg md:text-xl">Supply Balance</div>
                        <div className="text-white font-bold text-2xl md:text-3xl">
                            {!account || wrongNetwork ? '-' : formatValue(getBigNumber(supplyCountUp)
                            .dp(2, 1)
                            .toString(10))}
                        </div>
                    </div>
                    <div
                        className={`flex flex-col items-stretch md:items-end flex-grow md:hidden
                    text-right space-y-1 md:space-y-2 order-3`}
                    >
                        <div className="text-primary font-bold text-lg md:text-xl">Borrow Balance</div>
                        <div className="text-white font-bold text-2xl md:text-3xl">
                            {!account || wrongNetwork ? '-' : formatValue(getBigNumber(borrowCountUp)
                                .dp(2, 1)
                                .toString(10))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-center order-last md:order-2">
                    <div className="relative mb-2">
                        <Progress
                            wrapperClassName="hidden md:block"
                            type="circle"
                            width={200}
                            percent={Number(netAPY || 100)}
                            strokeWidth={4}
                        />
                        <Progress
                            wrapperClassName="block md:hidden"
                            type="circle"
                            width={140}
                            percent={Number(netAPY || 100)}
                            strokeWidth={4}
                        />
                        <div className={`flex flex-col items-center absolute top-1/2 left-1/2 
                            w-full h-full pt-18 md:pt-14 pb-14 md:pb-10 px-4
                            transform -translate-x-1/2 -translate-y-1/2 justify-center`}>
                            <div className="flex flex-col items-center space-y-1 md:space-y-2 mb-3 md:mb-3 flex-grow text-center">
                                <div className="text-primary font-bold text-lg md:text-xl">Net APY</div>
                                <div className="text-white font-bold text-xl md:text-2xl">
                                    {!account || wrongNetwork ? '-' : netAPY ? `${netAPY}%` : '-'}
                                </div>
                            </div>
                            <Switch value={withANN} onChange={() => setWithANN(oldVal => !oldVal)} />
                        </div>
                    </div>
                </div>
                <div
                    className={`hidden md:flex flex-col items-stretch md:items-end flex-grow 
                    text-left mt-4 md:mt-0 md:text-right space-y-1 md:space-y-2 order-3`}
                >
                    <div className="text-primary font-bold text-lg md:text-xl">Borrow Balance</div>
                    <div className="text-white font-bold text-2xl md:text-3xl">
                        {!account || wrongNetwork ? '-' : formatValue(getBigNumber(borrowCountUp)
                            .dp(2, 1)
                            .toString(10))}
                    </div>
                </div>
            </div>
            <div className={'flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-1 sm:space-x-4'}>
                <div className="flex flex-row items-center justify-between space-x-4">
                    <div className="text-gray whitespace-nowrap text-lg mr-auto sm:mr-0">Borrow Limit</div>
                    <div className="text-gray text-lg font-bold whitespace-nowrap order-3 block sm:hidden">${format(available)}</div>
                    <ArrowDown onClick={() => setShowDetails(s => !s)} className={'order-4 flex sm:hidden'}>
                        <ArrowContainer active={showDetails}>
                            <SVG src={ArrowIcon}/>
                        </ArrowContainer>
                    </ArrowDown>
                </div>
                <div className="flex flex-col flex-grow order-last sm:order-2">
                    <BorrowLimitProgress
                        percent={Number(borrowPercent)}
                    />
                </div>
                <div className="text-gray text-lg font-bold whitespace-nowrap order-3 hidden sm:block">${format(available)}</div>
                <ArrowDown onClick={() => setShowDetails(s => !s)} className={'order-4 hidden sm:flex'}>
                    <ArrowContainer active={showDetails}>
                        <SVG src={ArrowIcon}/>
                    </ArrowContainer>
                </ArrowDown>
            </div>
            {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-9 w-full mt-4">
                    <SummaryCard
                        name="ANN Balance"
                        title={`${format(getBigNumber(balanceCountUp).dp(2, 1).toString(10))} ANN`}
                        icon={ANNBalance}
                        noData={!account || wrongNetwork}
                        status="green"
                    />
                    <SummaryCard
                        name="Daily Earning"
                        title={!account || wrongNetwork ? '-' : dailyEarning ? formatValue(getBigNumber(dailyEarning)
                            .dp(2, 1)
                            .toString(10)) : "-"}
                        icon={DailyEarning}
                        noData={!account || wrongNetwork}
                        status="green" />
                    <SummaryCard
                        name="ANN Rewards"
                        title={`${format(getBigNumber(earnedBalance).dp(2, 1).toString(10))} ANN`}
                        icon={ANNRewards}
                        noData={!account || wrongNetwork}
                        status="red" />
                    <SummaryCard
                        name="Annual Earning"
                        title={!account || wrongNetwork ? '-' : annualEarning ? formatValue(getBigNumber(annualEarning)
                            .dp(2, 1)
                            .toString(10)) : "-"}
                        icon={AnnualEarning}
                        noData={!account || wrongNetwork}
                        status="red" />
                </div>
            )}
        </Wrapper>
    )
}

export default AccountOverview;
