import React from 'react';
import Modal from '../UI/Modal';
import logoMini from '../../assets/icons/logoMini.svg';
import transactionBroadcast from '../../assets/icons/transactionBroadcast.svg';
import {showTokenOnExplorer} from "../../utils/address";
import { useActiveWeb3React } from '../../hooks';

function WalletsModal({ open, onSetOpen, onCloseModal, isCollateralEnable, collateralToken }) {
  const { chainId } = useActiveWeb3React();
  const title = (
    <div className="text-center text-xl font-bold mt-4 mx-12 py-6 border-b border-solid border-gray-600">
      Confirm Transaction
    </div>
  );

  const content = (
    <div className="p-14">
      <div className="flex flex-col items-center">
        <img className="w-150px animate-spin" src={transactionBroadcast} alt="transaction broadcast" />
        <div className="text-xl font-bold mt-8">
            {`${isCollateralEnable ? 'Disable' : 'Enable'} as collateral`}
        </div>
      </div>
      <div className="flex justify-center mt-16">
        <button
            onClick={showTokenOnExplorer.bind(this, collateralToken?.atokenAddress, chainId)}
          className="focus:outline-none bg-primary py-4 rounded text-2xl
                 w-full max-w-350px text-black"
        >
          View on Explorer
        </button>
      </div>
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

export default WalletsModal;
