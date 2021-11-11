import {AutoColumn, BottomSection, ConfirmedIcon, ContentHeader, Section, Wrapper} from "./helpers";
import {ArrowUpCircle} from "react-feather";
import {getEtherscanLink} from "../../../utils";
import React from "react";

const TransactionSubmittedContent = ({ onDismiss, chainId, hash }) => {
	return (
		<Wrapper>
			<Section justify={'center'} gap={'36px'}>
				<ContentHeader onDismiss={onDismiss}>Transaction submitted</ContentHeader>
				<ConfirmedIcon>
					<ArrowUpCircle strokeWidth={0.5} size={97} color={"#FFAB2D"} />
				</ConfirmedIcon>
				<AutoColumn gap="8px" justify="center" className={'w-full'}>
					<a
						href={getEtherscanLink(chainId, hash, "transaction")}
						target={"_blank"}
						rel={'noreferrer noopener'}
						onClick={onDismiss}
						className={`py-4 no-underline px-10 w-full focus:outline-none rounded-xl w-full
						flex items-center justify-center
					 font-bold bg-primaryLight text-black hover:bg-primary`}
					>
						View on Explorer
					</a>
				</AutoColumn>
			</Section>
		</Wrapper>
	);
};

export default TransactionSubmittedContent;
