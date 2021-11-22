import React, {useCallback, useState} from 'react';

import Modal from '../UI/Modal';
import CurrencyLogo from "../common/CurrencyLogo";
import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from '../../hooks';

function TokenWarningModal({isOpen, tokens, onConfirm}) {
	const handleDismiss = useCallback(() => null, []);
	const { chainId } = useActiveWeb3React();

	const title = (
		<div
			className="flex justify-center items-center space-x-2 py-4 mx-14
                    border-b border-solid border-black"
		>
			<CurrencyLogo currency={tokens?.[0]} size={'32px'}/>
			<div>
				Token Imported
			</div>
		</div>
	);

	const content = (
		<div className="px-14 py-6">
			<div className="p-6 bg-black flex flex-col items-stretch mb-6">
				<div className="text-white">
					Anyone can create an {[339, 25].includes(chainId) ? "CRC20 " : "BEP20 "} 
					token on {[339, 25].includes(chainId) ? "Cronos" : "BSC"} with <em>any</em> name, including creating fake versions
					of existing tokens and tokens that claim to represent projects that do not have a token.
				</div>
				<div className="text-white">
					This interface can load arbitrary tokens by token addresses. Please take extra caution and do
					your research when interacting with arbitrary {[339, 25].includes(chainId) ? "CRC20" : "BEP20"} tokens.
				</div>
				<div className="text-white">
					If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
				</div>
				<div className="flex flex-col space-y-4 mt-8">
					{tokens?.map((token, _i) => {
						return (
							<div key={token?.address + _i} className="flex justify-between items-center">
								<div className="flex items-center space-x-2">
									<CurrencyLogo currency={token} size={'24px'}/>
									<div className="text-white">
										{token && token.name && token.symbol && token.name !== token.symbol
											? `${token.name} (${token.symbol})`
											: token.name || token.symbol}{" "}
									</div>
								</div>
								<a
									target={"_blank"}
									rel={'noreferrer noopener'}
									href={getEtherscanLink(chainId, token?.address, "token")}
									className="text-primary no-underline focus:outline-none">
									View on Explorer
								</a>
							</div>
						)
					})}
				</div>
			</div>

			<button
				className={`py-4 px-10 w-full focus:outline-none bg-primary`}
				onClick={onConfirm}
			>
				Continue
			</button>
		</div>
	)

	return (
		<div>
			<Modal
				title={title}
				content={content}
				open={isOpen}
				onCloseModal={handleDismiss}
				width="max-w-xl"
			/>
		</div>
	)
}

export default TokenWarningModal;