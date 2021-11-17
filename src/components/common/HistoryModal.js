import React, {useMemo} from 'react';
import styled from "styled-components";
import { ArrowRight } from 'react-feather';

import Modal from '../UI/Modal';
import {useActiveWeb3React} from "../../hooks";
import {isTransactionRecent, useAllTransactions} from "../../core";
import {getEtherscanLink} from "../../utils";


const Flex = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const FlexRow = styled(Flex)`
	padding: 6px 12px;
	flex-direction: row;
	align-items: stretch;
	justify-content: space-between;
	border-radius: 12px;

	&:not(:last-child) {
		margin-bottom: 6px;
	}
`;

const newTransactionsFirst = (a, b) => b.addedTime - a.addedTime;

function HistoryModal({ open, onSetOpen, onCloseModal }) {
    const { account, chainId } = useActiveWeb3React();
    const allTransactions = useAllTransactions();

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions);
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
    }, [allTransactions]);

  const title = <div className="text-center text-xl mt-10 mx-6">Recent Transactions</div>;

  const content = (
    <div className="flex flex-col items-center pt-10 pb-12 px-6">

        {!account && (
            <>
                <div className="">Please connect your wallet to view your recent transactions</div>
                <button
                    className="focus:outline-none py-2 px-14 mt-4
                   rounded-md text-black text-lg bgPrimaryGradient"
                    onClick={onCloseModal}
                >
                    Close
                </button>
            </>
        )}
        {account && chainId && sortedRecentTransactions.length === 0 && (
            <>
                <div className="">No recent transactions</div>
                <button
                    className="focus:outline-none py-2 px-14 mt-4
                   rounded-md text-black text-lg bgPrimaryGradient"
                    onClick={onCloseModal}
                >
                    Close
                </button>
            </>
        )}
        {account &&
        chainId &&
        sortedRecentTransactions.map((sortedRecentTransaction, index) => {
            const { hash, summary } = sortedRecentTransaction;

            return (
                <React.Fragment key={index}>
                    <FlexRow key={hash} className={'self-stretch hover:bg-fadeBlack text-left'}>
                        <a
                            target={"_blank"}
                            rel={'noreferrer noopener'}
                            className={`no-underline text-primaryLight 
                            font-medium text-base focus:outline-none hover:text-primary 
                            text-left flex items-center justify-between border py-2 px-4 rounded-2xl border-gray w-full`}
                            href={getEtherscanLink(chainId, hash, "transaction")}
                        >
                            <span>{summary || hash}</span>
                            <ArrowRight size={'16px'}/>
                        </a>
                    </FlexRow>
                </React.Fragment>
            );
        })}
    </div>
  );

  return (
    <div>
      <Modal
        title={title}
        content={content}
        open={open}
        onSetOpen={onSetOpen}
        onCloseModal={onCloseModal}
        afterCloseModal={() => {}}
        width="max-w-xl"
      />
    </div>
  );
}

export default HistoryModal;
