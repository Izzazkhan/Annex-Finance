import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import { CloseIcon } from '../../../../src/components/swap/SearchModal/ListSelect';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { restService } from 'utilities';

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
function AuctionModal({
  open,
  onSetOpen,
  onCloseModal,
  type,
  modalError,
  handleSubmit,
  approveANNToken,
  approveAuctionToken,
  handleApproveANNToken,
  handleApproveAuctionToken,
  isCreatingAuction,
  auctionType
}) {
  // const [auctionButton, setAuctionButton] = useState(true);
  const history = useHistory();
  const redirectAndCloseModal = async () => {
    try {
      console.log('close modal')
      const response = await restService({
        third_party: true,
        api: process.env.REACT_APP_AUCTION_LOAD_API,
        method: 'POST',
        params: { contractAddress: process.env.REACT_APP_BSC_TEST_ANNEX_BATCH_AUCTION_ADDRESS }
      })
      console.log('responsePost', response)
      if (response.status === 200) {
        history.push({
          pathname: `/auction/${auctionType}-detail/${modalError.payload && modalError.payload.auctionId ? modalError.payload.auctionId : ''
            }`,
          state: { auctionType: auctionType, data: { id: modalError.payload.auctionId } },
        });
        onCloseModal();
      }
    } catch (error) {
      console.log(error);
    }

    // history.push({
    //   pathname: `/auction/${auctionType}-detail/${modalError.payload && modalError.payload.auctionId ? modalError.payload.auctionId : ''
    //     }`,
    //   state: { auctionType: auctionType, data: { id: modalError.payload.auctionId } },
    // });
    // onCloseModal();
  };

  // useEffect(() => {
  //   if (type === types['SUCCESS']) {
  //     setTimeout(() => setAuctionButton(false), 7000)
  //   }
  // }, [type])

  const title = (
    <div className="flex items-center justify-between mt-4 mx-12 py-4 border-b border-solid border-gray-600">
      <div className="text-left text-xl font-normal  ">Create Auction </div>
      <CloseIcon onClick={onCloseModal} fill={'#fff'} />
    </div>
  );
  // auction/detail/1
  const content =
    type === types['INPROGRESS'] ? (
      <div className="p-14">
        <ItemCheck
          title="Approve ANN Token"
          description="This transaction is conducted only once per collection"
          status={approveANNToken.status}
          isLoading={approveANNToken.isLoading}
          handleCheck={handleApproveANNToken}
        />
        <ItemCheck
          title="Approve Auction Token"
          description="This transaction is conducted only once per collection"
          status={approveAuctionToken.status}
          isLoading={approveAuctionToken.isLoading}
          handleCheck={handleApproveAuctionToken}
        />
        {modalError.message ? <ErrorMessage>{modalError.message}</ErrorMessage> : ''}

        <div className="flex justify-center mt-16">
          <button
            className="focus:outline-none bg-primary py-4 md:px-12 px-6 rounded-4xl text-2xl
             max-w-full  text-black"
            onClick={handleSubmit}
            disabled={!approveANNToken.status || !approveAuctionToken.status || isCreatingAuction}
          >
            {isCreatingAuction ? 'Loading...' : ' Create Auction'}
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
          <div className="text-xl font-normal mt-8">{`Auction Created Successfully`}</div>
        </div>
        <div className="flex justify-center mt-16">
          <button
            className="focus:outline-none bg-primary py-4 rounded text-2xl
                 w-full max-w-350px text-black"
            onClick={redirectAndCloseModal}
          >
            Go to auction detail{' '}
          </button>
          {/* <button
            className="focus:outline-none bg-primary py-4 rounded text-2xl
                 w-full max-w-350px text-black"
            disabled={auctionButton}
          >
            Hello{' '}
          </button> */}
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
export default AuctionModal;
