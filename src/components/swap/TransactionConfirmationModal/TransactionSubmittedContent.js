import {AutoColumn, BottomSection, ConfirmedIcon, ContentHeader, Section, Wrapper} from "./helpers";
import {ArrowUpCircle} from "react-feather";
import {getEtherscanLink} from "../../../utils";

const TransactionSubmittedContent = ({ onDismiss, chainId, hash }) => {
	return (
		<Wrapper>
			<Section>
				<ContentHeader onDismiss={onDismiss}>Transaction submitted</ContentHeader>
				<ConfirmedIcon>
					<ArrowUpCircle strokeWidth={0.5} size={97} color={"#FFAB2D"} />
				</ConfirmedIcon>
				<AutoColumn gap="8px" justify="center">
					<a
						href={getEtherscanLink(chainId, hash, "transaction")}
						target={"_blank"}
						rel={'noreferrer noopener'}
						onClick={onDismiss}
						className={`py-4 no-underline px-10 w-full focus:outline-none rounded-xl
					 font-bold bg-primaryLight text-black hover:bg-primary`}
					>
						View on bscscan
					</a>
				</AutoColumn>
			</Section>
		</Wrapper>
	);
};

export default TransactionSubmittedContent;
