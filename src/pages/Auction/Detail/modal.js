import React from 'react';
import Modal from '../../../components/UI/Modal';
import { CloseIcon } from '../../../../src/components/swap/SearchModal/ListSelect';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const types = {
  SUCCESS: 'success',
  INPROGRESS: 'inprogress',
};

const ErrorMessage = styled.div`
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
`;
function CommitModal({
  open,
  onSetOpen,
  onCloseModal,
  type,
  modalError,
  loading,
  handleSubmit,
  approveBiddingToken,
  handleApproveBiddingToken,
}) {
  const title = (
    <div className="flex items-center justify-between mt-4 mx-12 py-4 border-b border-solid border-gray-600">
      <div className="text-left text-xl font-normal  ">Commit </div>
      <CloseIcon onClick={onCloseModal} fill={'#fff'} />
    </div>
  );

  const content =
    type === types['INPROGRESS'] ? (
      <div className="p-14">
        <ItemCheck
          title="Approve Bidding Token"
          description="This transaction is conducted only once per collection"
          status={approveBiddingToken.status}
          isLoading={approveBiddingToken.isLoading}
          handleCheck={handleApproveBiddingToken}
        />

        {modalError.message ? <ErrorMessage>{modalError.message}</ErrorMessage> : ''}

        <div className="flex justify-center mt-16">
          <button
            className="focus:outline-none bg-primary py-4 md:px-12 px-6 rounded-4xl text-2xl
             max-w-full  text-black"
            onClick={handleSubmit}
            disabled={!approveBiddingToken.status || loading}
          >
            {loading ? 'Loading...' : ' Submit'}
          </button>
        </div>
      </div>
    ) : type === types['SUCCESS'] ? (
      <div className="p-14">
        <div className="flex flex-col items-center">
          <img
            className="w-150px "
            src={require('../../../assets/images/check.svg').default}
            alt="transaction broadcast"
          />
          <div className="text-xl font-normal mt-8">{`Auction Commit Successfully`}</div>
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

const ItemCheck = ({ title, description, status, isLoading, handleCheck }) => {
  return (
    <div className="flex flex-row items-start w-full mb-10">
      <div className="icon mr-5">
        <img
          style={{ width: '55px' }}
          src={
            require(`../../../assets/${status ? 'images/check.svg' : 'icons/circleCross.svg'}`)
              .default
          }
          alt="transaction broadcast"
        />
      </div>
      <div className=" flex flex-col flex-1">
        <div className="text-lg font-bold mb-2">{title}</div>
        <div className="text-base font-normal mb-5">{description}</div>
        <button
          className={`focus:outline-none  py-4 rounded-4xl text-base w-full max-w-350px  ${isLoading
              ? 'text-black bg-lightGray'
              : 'border border-primary bg-transparent text-primary '
            }`}
          onClick={handleCheck}
        >
          {isLoading ? 'Loading...' : status ? 'Done' : 'Start'}
        </button>
      </div>
    </div>
  );
};
export default CommitModal;
