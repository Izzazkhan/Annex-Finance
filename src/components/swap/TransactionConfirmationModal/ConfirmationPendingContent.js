import {AutoColumn, ContentHeader, Wrapper, Section} from "./helpers";
import transactionBroadcast from "../../../assets/icons/transactionBroadcast.svg";
import React from "react";

const ConfirmationPendingContent = ({ onDismiss, pendingText }) => {
	return (
		<Wrapper>
			<Section justify={'center'} gap={'36px'}>
				<ContentHeader onDismiss={onDismiss}>Waiting for confirmation</ContentHeader>
				<img className="w-150px animate-spin" src={transactionBroadcast} alt="transaction broadcast" />
				<AutoColumn gap="12px" justify="center">
					<AutoColumn gap="12px" justify="center">
						<span className={'text-sm text-white'}>
							<strong>{pendingText}</strong>
						</span>
					</AutoColumn>
					<span className={'text-xl font-bold text-white mt-4 mb-4'}>Confirm this transaction in your wallet</span>
				</AutoColumn>
			</Section>
		</Wrapper>
	);
};

export default ConfirmationPendingContent;
