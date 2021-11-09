import {JSBI, Percent} from "@annex/sdk";
import React, {useState} from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import { Link } from 'react-router-dom';

import {useActiveWeb3React} from "../../hooks";
import {unwrappedToken} from "../../utils/wrappedCurrency";
import {useTokenBalance} from "../../hooks/wallet";
import useTotalSupply from "../../data/TotalSupply";
import {AutoColumn} from "../UI/Column";
import {RowBetween, RowFixed} from "../UI/Row";
import DoubleCurrencyLogo from "../common/DoubleLogo";
import {Dots} from "../UI/Dots";
import CurrencyLogo from "../common/CurrencyLogo";
import currencyId from "../../utils/currencyId";

export function MinimalPositionCard({ pair, showUnwrapped = false }) {
	const { account, chainId } = useActiveWeb3React();

	const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
	const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

	const [showMore, setShowMore] = useState(false);

	const userPoolBalance = useTokenBalance(account || undefined, pair.liquidityToken);
	const totalPoolTokens = useTotalSupply(pair.liquidityToken);

	const [token0Deposited, token1Deposited] =
		!!pair &&
		!!totalPoolTokens &&
		!!userPoolBalance &&
		JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
			? [
				pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
				pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
			]
			: [undefined, undefined];

	return userPoolBalance ? (
		<div className="bg-blueGray p-6 rounded-3xl w-full border border-solid border-primary mt-4">
			<div className="font-bold text-primary text-lg">LP TOKENS IN YOUR WALLET</div>
			<div
				className="flex justify-between items-center mt-4"
				onClick={() => setShowMore(!showMore)}
			>
				<div className="flex items-center">
					<DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin size={20} />
					<div className="text-white text-lg font-bold ml-3">
						{currency0.symbol}/{currency1.symbol}
					</div>
				</div>
				<div className="text-white text-xl font-bold">
					{userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
				</div>
			</div>
			<div className="flex justify-between items-center mt-4">
				<div className="text-primary text-lg font-bold">{currency0.symbol}:</div>
				<div className="text-white text-xl font-bold">
					{token0Deposited
						? token0Deposited?.toSignificant(6)
						: "-"
					}
				</div>
			</div>
			<div className="flex justify-between items-center mt-4">
				<div className="text-primary text-lg font-bold">{currency1.symbol}:</div>
				<div className="text-white text-xl font-bold">
					{token1Deposited
						? token1Deposited?.toSignificant(6)
						: "-"
					}
				</div>
			</div>
		</div>
	) : null;
}

export default function FullPositionCard({ pair }) {
	const { account, chainId } = useActiveWeb3React();

	const currency0 = unwrappedToken(pair.token0);
	const currency1 = unwrappedToken(pair.token1);

	const [showMore, setShowMore] = useState(false);

	const userPoolBalance = useTokenBalance(account || undefined, pair.liquidityToken);
	const totalPoolTokens = useTotalSupply(pair.liquidityToken);

	const poolTokenPercentage =
		!!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
			? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
			: undefined;

	const [token0Deposited, token1Deposited] =
		!!pair &&
		!!totalPoolTokens &&
		!!userPoolBalance &&
		// this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
		JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
			? [
				pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
				pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
			]
			: [undefined, undefined];

	return (
		<div className="border bg-fadeBlack mb-3 py-3 px-4 rounded-lg border-blueGray hover:border-darkGray transition-all">
			<AutoColumn>
				<RowBetween
					style={{ height: '24px', cursor: 'pointer' }}
					onClick={() => setShowMore(s => !s)}
				>
					<RowFixed>
						<DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin size={20} />
						<span className="text-white font-bold text-base">
							{!currency0 || !currency1 ? (
								<Dots>Loading</Dots>
							) : (
								`${currency0.symbol}/${currency1.symbol}`
							)}
						</span>
					</RowFixed>
					<RowFixed>
						{showMore ? (
							<ChevronUp size="20" color={'#fff'} style={{ marginLeft: "10px" }} />
						) : (
							<ChevronDown size="20" color={'#fff'} style={{ marginLeft: "10px" }} />
						)}
					</RowFixed>
				</RowBetween>
				{showMore && (
					<AutoColumn gap={'8px'} className={'mt-6'}>
						<RowBetween
							style={{ height: '24px' }}
							className={'py-2'}
						>
							<RowFixed>
								<span className="text-white text-base">
									Pooled {currency0.symbol}:
								</span>
							</RowFixed>
							{token0Deposited ? (
								<RowFixed>
									<span className="text-white text-base ml-2">
										{token0Deposited?.toSignificant(6)}
									</span>
									<CurrencyLogo
										size="20px"
										style={{ marginLeft: "8px" }}
										currency={currency0}
									/>
								</RowFixed>
							) : (
								"-"
							)}
						</RowBetween>

						<RowBetween
							style={{ height: '24px' }}
							className={'py-2'}
						>
							<RowFixed>
								<span className="text-white text-base">
									Pooled {currency1.symbol}:
								</span>
							</RowFixed>
							{token1Deposited ? (
								<RowFixed>
									<span className="text-white text-base ml-2">
										{token1Deposited?.toSignificant(6)}
									</span>
									<CurrencyLogo
										size="20px"
										style={{ marginLeft: "8px" }}
										currency={currency1}
									/>
								</RowFixed>
							) : (
								"-"
							)}
						</RowBetween>

						<RowBetween
							style={{ height: '24px' }}
							className={'py-2'}
						>
							<span className="text-white text-base">
								Your pool tokens:
							</span>
							<span className="text-white text-base">
								{userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
							</span>
						</RowBetween>
						<RowBetween
							style={{ height: '24px' }}
							className={'py-2'}
						>
							<span className="text-white text-base">
								Your pool share:
							</span>
							<span className="text-white text-base">
								{poolTokenPercentage ? `${poolTokenPercentage.toFixed(2)}%` : "-"}
							</span>
						</RowBetween>

						<RowBetween marginTop="10px" className={'space-x-2 w-full'}>
							<Link
								className="bg-primaryLight py-2 rounded w-full
								transition-all disabled:opacity-50
                                h-12 text-black flex items-center justify-center"
								to={`/trade/liquidity/add/${currencyId(currency0, chainId)}/${currencyId(currency1, chainId)}`}
							>
								Add
							</Link>
							<Link
								className="bg-darkGray py-2 rounded w-full
								transition-all disabled:opacity-50 border border-darkGray
                                h-12 text-white flex items-center justify-center"
								to={`/trade/liquidity/remove/${currencyId(currency0, chainId)}/${currencyId(currency1, chainId)}`}
							>
								Remove
							</Link>
						</RowBetween>
					</AutoColumn>
				)}
			</AutoColumn>
		</div>
	)
}
