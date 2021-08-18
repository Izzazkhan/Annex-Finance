import {useActiveWeb3React} from "../../hooks";
import React, {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import {ETHER, JSBI} from "@annex/sdk";
import {PairState, usePair} from "../../data/Reserves";
import {useTokenBalance} from "../../hooks/wallet";
import {AutoColumn, ColumnCenter} from "../../components/UI/Column";
import { Link } from 'react-router-dom';
import QuestionHelper from "../../components/common/QuestionHelper";
import CurrencyLogo from "../../components/common/CurrencyLogo";
import {ChevronDownIcon} from "@heroicons/react/solid";
import blackPlus from "../../assets/icons/blackPlus.svg";
import CurrencySearchModal from "../../components/swap/SearchModal/CurrencySearchModal";
import {MinimalPositionCard} from "../../components/swap/PositionCard";
import {Dots} from "../../components/UI/Dots";
import currencyId from "../../utils/currencyId";

const Fields = {
    TOKEN0: 0,
    TOKEN1: 1
}


const PlusIcon = () => (
    <div className="my-8">
        <img src={blackPlus} alt="" />
    </div>
);

const LightCard = styled.div.attrs(props => ({
    className: `rounded-lg bg-fadeBlack w-full ${props.className || ""}`
}))``

const Text = styled.div.attrs(props => ({
    className: `text-white text-center ${props.className || ""}`
}))``

const StyledInternalLink = styled(Link).attrs(props => ({
    className: `h-12 rounded-xl bg-primaryLight text-black transition-all 
    flex items-center justify-center w-full font-bold
    hover:bg-primary focus:outline-none ${props?.className || ""}`
}))``

export default function PoolFinder() {
    const { account } = useActiveWeb3React()

    const [showSearch, setShowSearch] = useState(false)
    const [activeField, setActiveField] = useState(Fields.TOKEN1)

    const [currency0, setCurrency0] = useState(ETHER)
    const [currency1, setCurrency1] = useState(null)

    const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)


    const validPairNoLiquidity =
        pairState === PairState.NOT_EXISTS ||
        Boolean(
            pairState === PairState.EXISTS &&
            pair &&
            JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
            JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
        )

    const position = useTokenBalance(account ?? undefined, pair?.liquidityToken)
    const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

    const handleCurrencySelect = useCallback(
        (currency) => {
            if (activeField === Fields.TOKEN0) {
                setCurrency0(currency)
            } else {
                setCurrency1(currency)
            }
        },
        [activeField]
    )

    const handleSearchDismiss = useCallback(() => {
        setShowSearch(false)
    }, [setShowSearch])

    const prerequisiteMessage = (
        <ColumnCenter>
            <div className={"p-4 rounded-lg mb-4 bg-fadeBlack mt-8 w-full"}>
                <AutoColumn gap="12px">
                    <span className={'text-white text-center'}>
                        {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
                    </span>
                </AutoColumn>
            </div>
        </ColumnCenter>
    )

    return (
        <div className="py-10 w-full max-w-2xl">
            <div className="w-full max-w-2xl py-8 px-6 sm:px-10 bg-black rounded-xl">
                <div>
                    <div className="flex justify-between">
                        <div
                            className={`text-xl text-white`}
                        >
                            Import Pool
                            <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center mt-8">
                        <div
                            className={`flex items-center w-full flex-row transition-all bg-transparent text-white h-14
                                        cursor-pointer hover:bg-fadeBlack rounded-xl border border-darkGray py-3 px-5`}
                            onClick={() => {
                                setShowSearch(true)
                                setActiveField(Fields.TOKEN0)
                            }}
                        >
                            {currency0 ? <CurrencyLogo currency={currency0} style={{ marginRight: '.5rem' }} /> : null}
                            {currency0 ? currency0.symbol : "Select a Token"}
                            <ChevronDownIcon
                                className={`w-6 hover:text-violet-100 ml-auto`}
                                aria-hidden="true"
                            />
                        </div>
                        <PlusIcon/>
                        <div
                            className={`flex items-center w-full flex-row transition-all bg-transparent text-white h-14
                                        cursor-pointer hover:bg-fadeBlack rounded-xl border border-darkGray py-3 px-5`}
                            onClick={() => {
                                setShowSearch(true)
                                setActiveField(Fields.TOKEN1)
                            }}
                        >
                            {currency1 ? <CurrencyLogo currency={currency1} style={{ marginRight: '.5rem' }} /> : null}
                            {currency1 ? currency1.symbol : "Select a Token"}
                            <ChevronDownIcon
                                className={`w-6 hover:text-violet-100 ml-auto`}
                                aria-hidden="true"
                            />
                        </div>

                    </div>
                    {hasPosition && (
                        <ColumnCenter
                            style={{
                                justifyItems: 'center',
                                backgroundColor: '',
                                padding: '12px 0px',
                                borderRadius: '12px',
                                marginTop: "1rem"
                            }}
                        >
                            <span className={'text-center text-white font-bold'}>
                                Pool Found!
                            </span>
                        </ColumnCenter>
                    )}
                    {currency0 && currency1 ? (
                        pairState === PairState.EXISTS ? (
                            hasPosition && pair ? (
                                <MinimalPositionCard pair={pair} />
                            ) : (
                                <LightCard padding="45px 10px" className={'mt-8 p-4'}>
                                    <AutoColumn gap="sm" justify="center">
                                        <Text>You don’t have liquidity in this pool yet.</Text>
                                        <StyledInternalLink to={`/trade/liquidity/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                                            <Text>
                                                Add Liquidity
                                            </Text>
                                        </StyledInternalLink>
                                    </AutoColumn>
                                </LightCard>
                            )
                        ) : validPairNoLiquidity ? (
                            <LightCard padding="45px 10px" className={'mt-8 p-4'}>
                                <AutoColumn gap="sm" justify="center">
                                    <Text>No pool found.</Text>
                                    <StyledInternalLink to={`/trade/liquidity/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                                        Create pool.
                                    </StyledInternalLink>
                                </AutoColumn>
                            </LightCard>
                        ) : pairState === PairState.INVALID ? (
                            <LightCard padding="45px 10px" className={'mt-8 p-4'}>
                                <AutoColumn gap="sm" justify="center">
                                    <Text>
                                        Invalid pair.
                                    </Text>
                                </AutoColumn>
                            </LightCard>
                        ) : pairState === PairState.LOADING ? (
                            <LightCard padding="45px 10px" className={'mt-8 p-4'}>
                                <AutoColumn gap="sm" justify="center">
                                    <Text>
                                        Loading
                                        <Dots />
                                    </Text>
                                </AutoColumn>
                            </LightCard>
                        ) : null
                    ) : (
                        prerequisiteMessage
                    )}
                </div>
            </div>

            <CurrencySearchModal
                isOpen={showSearch}
                onCurrencySelect={handleCurrencySelect}
                onDismiss={handleSearchDismiss}
                showCommonBases
                selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
            />
        </div>
    )

}
