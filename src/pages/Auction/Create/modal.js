import React from 'react';
import Modal from '../../../components/UI/Modal';
import circleTick from '../../../assets/icons/circleTick.svg';
import { CloseIcon } from "../../../../src/components/swap/SearchModal/ListSelect";


const types = {
  SUCCESS: 'success',
  INPROGRESS: 'inprogress',
};

function AuctionModal({ open, onSetOpen, onCloseModal, type }) {
  const title = (
    <div className="flex items-center justify-between mt-4 mx-12 py-4 border-b border-solid border-gray-600">
      <div className="text-left text-xl font-normal  ">
        Auction Submitting Confirmation
      </div>
      <CloseIcon onClick={onCloseModal} fill={'#fff'} />
    </div>
  );

  const content =
    type === types['INPROGRESS'] ? (
      <div className="p-14">
        <div className="flex flex-row items-start w-full mb-10">
          <div className="icon mr-5">
            <img style={{width: '55px'}} src={require('../../../assets/images/check.svg').default} alt="transaction broadcast" />
          </div>
          <div className=" flex flex-col flex-1">
            <div className="text-lg font-bold mb-2">Paid</div>
            <div className="text-base font-normal mb-5">Send transaction to create your auction</div>
            <button
              className="focus:outline-none bg-lightGray py-4 rounded-4xl text-base
                 w-full max-w-350px text-black"
            >
              In Progress...
            </button>
          </div>
        </div>
        <div className="flex flex-row items-start w-full mb-10">
          <div className="icon mr-5">
            <img style={{width: '55px'}} src={require('../../../assets/images/check.svg').default} alt="transaction broadcast" />
          </div>
          <div className=" flex flex-col flex-1">
            <div className="text-lg font-bold mb-2">Approve</div>
            <div className="text-base font-normal mb-5">This transaction is conducted only once per collection</div>
            <button
              className="focus:outline-none bg-transparent border border-primary py-4 rounded-4xl text-base
              w-full max-w-350px text-primary"
            >
              Start
            </button>
          </div>
        </div>
        <div className="flex flex-row items-start w-full">
          <div className="icon mr-5">
            <img style={{width: '55px'}}  src={require('../../../assets/images/check.svg').default} alt="transaction broadcast" />
          </div>
          <div className=" flex flex-col flex-1">
            <div className="text-lg font-bold mb-2">Set fixed price</div>
            <div className="text-base font-normal mb-5">Sign messgae to set fixed price</div>
            <button
              className="focus:outline-none bg-transparent border border-primary py-4 rounded-4xl text-base
              w-full max-w-350px text-primary"
            >
              Start
            </button>
          </div>
        </div>
        <div className="flex justify-center mt-16">
          <button
            className="focus:outline-none bg-primary py-4 md:px-12 px-6 rounded-4xl text-2xl
             max-w-full  text-black"
            onClick={onCloseModal}
          >
            Cancel
          </button>
        </div>
      </div>
    ) : type === types['SUCCESS'] ? (
      <div className="p-14">
        <div className="flex flex-col items-center">
          <img className="w-150px " src={require('../../../assets/images/check.svg').default} alt="transaction broadcast" />
          <div className="text-xl font-normal mt-8">{`Auction Created Successfully`}</div>
        </div>
        <div className="flex justify-center mt-16">
          <button
            className="focus:outline-none bg-primary py-4 rounded text-2xl
                 w-full max-w-350px text-black"
            onClick={onCloseModal}
          >
            Close
          </button>
        </div>
      </div>
    ) : (
      ''
    );

  return (
    <div>
      <Modal
        title={title}
        content={content}
        open={open}
        onSetOpen={onSetOpen}
        onCloseModal={onCloseModal}
        afterCloseModal={() => { }}
        width="max-w-xl"
      />
    </div>
  );
}

export default AuctionModal;
