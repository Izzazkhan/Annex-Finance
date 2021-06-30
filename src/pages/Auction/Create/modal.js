import React from 'react';
import Modal from '../../../components/UI/Modal';
import circleTick from '../../../assets/icons/circleTick.svg';

const types = {
  SUCCESS: 'success',
  INPROGRESS: 'inprogress',
};

function AuctionModal({ open, onSetOpen, onCloseModal, type }) {
  const title = (
    <div className="text-center text-xl font-bold mt-4 mx-12 py-6 border-b border-solid border-gray-600">
      Auction Submitting Confirmation
    </div>
  );

  const content =
    type === types['SUCCESS'] ? (
      <div className="p-14">
        <div className="flex flex-col items-center">
          <img className="w-150px " src={circleTick} alt="transaction broadcast" />
          <div className="text-xl font-bold mt-8">{`Auction Created Successfully`}</div>
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
    ) : type === types['INPROGRESS'] ? (
      <div className="p-14">
        <div className="flex flex-col items-center">
          <img className="w-150px " src={circleTick} alt="transaction broadcast" />
          <div className="text-xl font-bold mt-8">{`Auction Created Successfully`}</div>
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
        afterCloseModal={() => {}}
        width="max-w-xl"
      />
    </div>
  );
}

export default AuctionModal;
