import {BottomSection, ContentHeader, Wrapper, Section} from "./helpers";

const ConfirmationModalContent = ({ title, bottomContent, onDismiss, topContent }) => {
	return (
		<Wrapper>
			<Section>
				<ContentHeader onDismiss={onDismiss}>{title}</ContentHeader>
				{topContent()}
			</Section>
			<BottomSection gap="12px">{bottomContent()}</BottomSection>
		</Wrapper>
	);
};

export default ConfirmationModalContent;
