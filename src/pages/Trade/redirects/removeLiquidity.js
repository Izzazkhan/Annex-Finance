import React from "react";
import { RouteComponentProps, Redirect } from "react-router-dom";

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/;

export function RedirectOldRemoveLiquidityPathStructure({
    match: {
        params: { tokens },
    },
}) {
    if (!OLD_PATH_STRUCTURE.test(tokens)) {
        return <Redirect to="/trade/liquidity" />;
    }
    const [currency0, currency1] = tokens.split("-");

    return <Redirect to={`/trade/liquidity/remove/${currency0}/${currency1}`} />;
}

export default RedirectOldRemoveLiquidityPathStructure;
