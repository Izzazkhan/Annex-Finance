import {AlertTriangle} from "react-feather";
import {AutoColumn, BottomSection, ContentHeader, Section, Wrapper} from "./helpers";

const TransactionErrorContent = ({ message, onDismiss }) => {
	return (
		<Wrapper>
			<Section>
				<ContentHeader onDismiss={onDismiss}>Error</ContentHeader>
				<AutoColumn style={{ marginTop: 20, padding: "2rem 0" }} gap="24px" justify="center">
					<AlertTriangle color={"#FF0000"} style={{ strokeWidth: 1.5 }} size={64} />
					<span className="text-darkRed font-bold text-lg text-center">
						{message}
					</span>
				</AutoColumn>
			</Section>
			<BottomSection gap="12px">
				<button
					onClick={onDismiss}
					className={`py-4 px-10 w-full focus:outline-none rounded-xl
					 font-bold bg-primaryLight text-black hover:bg-primary`}
				>
					Dismiss
				</button>
			</BottomSection>
		</Wrapper>
	);
};

export default TransactionErrorContent;
