import React, {useMemo} from 'react';
import {useHistory, Link } from "react-router-dom";

import settingsIcon from '../../assets/icons/settings.svg';
import historyIcon from '../../assets/icons/history.svg';
import {useActiveWeb3React} from "../../hooks";
import {useTokenBalancesWithLoadingIndicator} from "../../hooks/wallet";
import {usePairs} from "../../data/Reserves";
import {toV2LiquidityToken, useTrackedTokenPairs} from "../../core";
import {Dots} from "../../components/UI/Dots";
import FullPositionCard from "../../components/swap/PositionCard";

function Liquidity({ onSettingsOpen, onHistoryOpen }) {
	const history = useHistory();
	const { account } = useActiveWeb3React();

	// fetch the user's balances of all tracked V2 LP tokens
	const trackedTokenPairs = useTrackedTokenPairs();
	const tokenPairsWithLiquidityTokens = useMemo(
		() => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
		[trackedTokenPairs]
	);
	console.log('tokenPairsWithLiquidityTokens: ', tokenPairsWithLiquidityTokens)
	const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
		tokenPairsWithLiquidityTokens,
	]);
	const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
		account || undefined,
		liquidityTokens
	);

	// fetch the reserves for all V2 pools in which the user has a balance
	const liquidityTokensWithBalances = useMemo(
		() =>
			tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
				v2PairsBalances[liquidityToken.address]?.greaterThan("0")
			),
		[tokenPairsWithLiquidityTokens, v2PairsBalances]
	);

	const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));
	const v2IsLoading =
		fetchingV2PairBalances ||
		v2Pairs?.length < liquidityTokensWithBalances.length ||
		v2Pairs?.some((V2Pair) => !V2Pair);

	const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair) => Boolean(v2Pair));

	return (
		<div className="py-10 w-full mx-auto">
			<div className="w-full py-8 px-6 sm:px-10 bg-black rounded-xl">
				<div className="">
					<div className="flex justify-between">
						<div
							className={`text-xl font-bold text-white`}
						>
							Liquidity
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-full cursor-pointer" onClick={onSettingsOpen}>
								<img
									className="w-full"
									src={settingsIcon}
									alt="settings"
								/>
							</div>
							<div className="w-full cursor-pointer" onClick={onHistoryOpen}>
								<img
									src={historyIcon}
									alt="history"
								/>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center mt-8">
						<div className="flex justify-center mt-6">
							<button
								className="focus:outline-none py-2 px-12 text-black bgPrimaryGradient rounded-3xl"
								onClick={() => history.push('/trade/liquidity/add/eth')}
							>
								Add Liquidity
							</button>
						</div>
					</div>
					<div className="text-white font-bold mt-6">Your Liquidity</div>

					{!account ? (
						<div className="text-white mt-6 text-center">
							Connect to a wallet to view your liquidity.
						</div>
					) : v2IsLoading ? (
						<div className="text-white mt-6 text-center">
							<Dots>Loading</Dots>
						</div>
					) : allV2PairsWithLiquidity?.length > 0 ? (
						<div className={'mt-6'}>
							{allV2PairsWithLiquidity.map((v2Pair) => (
								<>
									<FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
								</>
							))}
						</div>
					) : (
						<div className="text-white mt-6 text-center">
							No liquidity found.
						</div>
					)}
					<div className="text-white mt-6">
						Don't see a pool you joined? <Link to={'/trade/liquidity/find'} className="text-primary">Import it.</Link>
					</div>
					<div className="text-white">
						Or, if you staked your LP tokens in a farm, unstake them to see them here.
					</div>
				</div>
			</div>
		</div>
	);
}

export default Liquidity;
