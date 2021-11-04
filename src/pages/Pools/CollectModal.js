import React, { useState } from 'react';
import Modal from '../../components/UI/Modal';
import { CloseIcon } from '../../components/swap/SearchModal/ListSelect';
import styled from 'styled-components';
import Loader from 'components/UI/Loader';


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
function CollectModal({ openModal, data, onCloseModal, onSetOpen, handleSubmit, getToken, buttonText, loading, annPrice }) {
    const [currentTab, setCurrentTab] = useState('compound');

    const title = (
        <div className="flex items-center justify-between mt-4 mx-12 py-4 border-b border-solid border-gray-600">
            <div className="text-left text-xl font-normal  ">ANN Collect </div>
            <CloseIcon onClick={onCloseModal} fill={'#fff'} />
        </div>
    );

    const content =
        <div className="p-14">
            <div className="flex bg-black rounded-4xl border border-primary">
                <button
                    className={`py-4 px-10 w-full focus:outline-none rounded-4xl font-bold ${currentTab === 'compound' ?
                        'bg-primaryLight text-black' : 'bg-black'
                        }`}
                    onClick={() => setCurrentTab('compound')}
                >
                    Compound
                </button>
                <button
                    className={`py-4 px-10 w-full focus:outline-none rounded-4xl font-bold ${currentTab === 'harvest' ?
                        'bg-primaryLight text-black' : 'bg-black'
                        }`}
                    onClick={() => setCurrentTab('harvest')}
                >
                    Harvest
                </button>
            </div>
            <div className="flex items-center justify-between mb-4 mt-6">
                <div className="text-white">{currentTab === 'harvest' ? 'Harvesting:' : 'Compounding:'}</div>
                <div className="text-white font-bold flex flex-col items-end">
                    <span>{`${Number(data.pendingAnnex).toFixed(5)} ${data.symbol}`}</span>
                    <span className="font-normal text-xs text-right">{`~${Number(data.pendingAnnex) * annPrice} USD`}</span>
                </div>
            </div>

            {/* {modalError.message ? <ErrorMessage>{modalError.message}</ErrorMessage> : ''} */}

            <div className="mt-2">
                <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                    <button
                        className={`w-full rounded-xl flex justify-center items-center
                            font-bold py-4 px-28 ${loading ? " bg-lightGray text-gray pointer-events-none " :
                                " bgPrimaryGradient text-black "} text-black`}
                        onClick={() => handleSubmit(data.pendingAnnexWithoutDecimal, currentTab)}
                    >
                        {loading && <Loader size="20px" className="mr-4" stroke="#717579" />}
                        Submit
                    </button>

                </div>
            </div>

            <div className="mt-2">
                <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                    <button
                        className={`w-full border border-primary rounded-xl flex justify-center items-center
                            font-bold py-4 px-21 text-primary`}
                        onClick={onCloseModal}
                    >
                        Close Window
                    </button>

                </div>
            </div>
        </div>
    return (
        <div>
            <Modal
                title={title}
                content={content}
                open={openModal}
                onSetOpen={onSetOpen}
                onCloseModal={onCloseModal}
                afterCloseModal={() => { }}
                width="max-w-xl"
            />
        </div>
    );
}

export default CollectModal;
