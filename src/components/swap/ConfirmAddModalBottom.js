import React from "react";
import {RowBetween, RowFixed} from "../UI/Row";
import CurrencyLogo from "../common/CurrencyLogo";
import {Field} from "../../core/modules/mint/actions";

const Body = (props) => {
    return (
        <span className="text-white text-base">{props.children}</span>
    )
}

export function ConfirmAddModalBottom({
    noLiquidity,
    price,
    currencies,
    parsedAmounts,
    poolTokenPercentage,
    onAdd,
}) {
    return (
        <div className={"flex flex-col space-y-4"}>
            <RowBetween>
                <Body>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Body>
                <RowFixed>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{marginRight: "8px"}}/>
                    <Body>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Body>
                </RowFixed>
            </RowBetween>
            <RowBetween>
                <Body>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Body>
                <RowFixed>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{marginRight: "8px"}}/>
                    <Body>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Body>
                </RowFixed>
            </RowBetween>
            <RowBetween>
                <Body>Rates</Body>
                <Body>
                    {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
                        currencies[Field.CURRENCY_B]?.symbol
                    }`}
                </Body>
            </RowBetween>
            <RowBetween style={{justifyContent: "flex-end"}}>
                <Body>
                    {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
                        currencies[Field.CURRENCY_A]?.symbol
                    }`}
                </Body>
            </RowBetween>
            <RowBetween>
                <Body>Share of Pool:</Body>
                <Body>{noLiquidity ? "100" : poolTokenPercentage?.toSignificant(4)}%</Body>
            </RowBetween>
            <button
                className={`bg-primaryLight py-2 rounded px-32 transition-all 
                disabled:opacity-50 h-12 text-black flex items-center justify-center`}
                onClick={onAdd}
            >
                {noLiquidity ? "Create Pool & Supply" : "Confirm Supply"}
            </button>
        </div>
    );
}

export default ConfirmAddModalBottom;
