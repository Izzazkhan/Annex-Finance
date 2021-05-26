import React, {useMemo} from 'react';
import styled from "styled-components";
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
        sortedRecentTransactions.map((sortedRecentTransaction) => {
            const { hash, summary } = sortedRecentTransaction;

            return (
                <>
                    <FlexRow key={hash} className={'hover:bg-fadeBlack'}>
                        <a
                            target={"_blank"}
                            rel={'noreferrer noopener'}
                            className={`no-underline text-primaryLight 
                            font-bold text-lg focus:outline-none hover:text-primary`}
                            href={getEtherscanLink(chainId, hash, "transaction")}
                        >
                            {summary ?? hash}
                        </a>
                    </FlexRow>
                </>
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
