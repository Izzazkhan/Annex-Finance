import React, { useState } from 'react';
import Slider from 'react-rangeslider';
import Loader from 'components/UI/Loader';
import Modal from '../../components/UI/Modal';
import { CloseIcon } from '../../components/swap/SearchModal/ListSelect';
import SliderIcon from '../../assets/images/slider-icon.png';
import styled from 'styled-components';

const types = {
    SUCCESS: 'success',
    INPROGRESS: 'inprogress',
};
const CustomModal = styled.div`
padding: 0;
   .rangeslider__fill {
        background: linear-gradient(90deg,#ffcb5b 16.38%,#f19920 67.43%);
    }
   .rangeslider__handle {
        background: url(${SliderIcon});
        background-size: 100%;
        background-position: center;
        border: none;
        width: 40px;
        height: 40px;
        box-shadow: none;
        background-repeat: no-repeat;
        @media (max-width: 767px) {
          width: 30px;
          height: 30px;
        }
        &:after {
          display: none;
        }
    }
`;
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
function stakeModal({ openModal, data, onSetOpen, onCloseModal, modalError, handleSubmit, getToken, buttonText, loading, annPrice }) {

    const [value, setValue] = useState(0);
    const [inputAmount, setInputAmount] = useState(0)

    // const handleFocus = (event) => {
    //     event.target.select();
    // }

    function closeModal() {
        onCloseModal();
        setInputAmount(0)
        setValue(0)
    }

    const onChangeSlider = (newValue) => {
        setValue(newValue);
        setInputAmount(newValue)
    };

    const onPercentage = (newValue) => {
        setValue(newValue);
        setInputAmount(newValue)
    }

    const onChangeInput = (event) => {
        setInputAmount(event.target.value)
        setValue(event.target.value);
    }

    const title = (
        <div className="flex items-center justify-between mt-4 mx-12 py-4 border-b border-solid border-gray-600">
            <div className="text-left text-xl font-normal  ">{buttonText === 'minus' ? 'Unstake' : 'Stake in Pool'} </div>
            <CloseIcon onClick={closeModal} fill={'#fff'} />
        </div>
    );

    const content =
        <CustomModal>
            <div className="p-8">
                <div className="flex flex-row items-start w-full mb-10">
                    <div className="icon mr-5">
                    </div>
                    <div className=" flex flex-col flex-1">
                        <div className="label flex justify-between font-bold text-primary text-xl">
                            <div className="">{buttonText === 'minus' ? 'Unstake' : 'Stake:'}</div>
                            <div className='flex items-center'>
                                <div className="bg-blue rounded-full relative w-9 h-9 mr-2">
                                    <img src={data.logo} alt="" className="" />
                                </div>
                                <div className="">{data.symbol}</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="border border-primary rounded-xl flex justify-end items-center 
                                    py-2.5 px-3.5 input-container">
                                <div className="flex flex-col items-end">
                                    <input
                                        // onFocus={handleFocus}
                                        className="bg-transparent focus:outline-none font-normal px-0 py-1 text-white text-right font-bold 
                                            m-0 flex input flex-1 text-lg"
                                        type="number"
                                        value={inputAmount}
                                        onChange={onChangeInput}
                                    />
                                    <div className={`text-white text-xs text-left`}>
                                        {`~${(annPrice * inputAmount)} USD`}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="label flex justify-between font-bold text-primary text-md">
                            <div className=""></div>
                            <div className="">Balance: {buttonText !== 'plus' ? data.stacked : data.tokenBalance}</div>
                        </div>

                        <div className="custom-range">
                            <Slider
                                // handleLabel={'0'}
                                min={0}
                                max={buttonText !== 'plus' ? data.stacked : data.tokenBalance}
                                value={Number(value)}
                                onChange={onChangeSlider}
                                step={Number(`${(0 * data.decimal).toFixed(data.decimal - 1)}1`)}
                            // tooltip={true}
                            />
                            <div className="label flex justify-between font-bold text-primary text-xl">
                                <div className="">0%</div>
                                <div className="">100%</div>
                            </div>
                        </div>

                        <div className='flex gap-4 justify-between'>
                            <button
                                className={`rounded-xl flex justify-center items-center 
                            font-bold mt-10 py-4 px-8 bg-primary text-black`}
                                onClick={() => onPercentage((buttonText !== 'plus' ? data.stacked : data.tokenBalance) * (25 / 100))}
                            >
                                25%
                            </button>
                            <button
                                className={`rounded-xl flex justify-center items-center 
                            font-bold mt-10 py-4 px-8 bg-primary text-black`}
                                onClick={() => onPercentage((buttonText !== 'plus' ? data.stacked : data.tokenBalance) * (50 / 100))}
                            >
                                50%
                            </button>
                            <button
                                className={`rounded-xl flex justify-center items-center 
                            font-bold mt-10 py-4 px-8 bg-primary text-black`}
                                onClick={() => onPercentage((buttonText !== 'plus' ? data.stacked : data.tokenBalance) * (75 / 100))}
                            >
                                75%
                            </button>
                            <button
                                className={`rounded-xl flex justify-center items-center 
                            font-bold mt-10 py-4 px-8 bg-primary text-black`}
                                onClick={() => onPercentage((buttonText !== 'plus' ? data.stacked : data.tokenBalance))}
                            >
                                Max
                            </button>
                        </div>

                        {/* <div className="mt-2">
                            <div className="rounded-xl flex justify-between items-center 
                                    py-2.5 px-3.5 mt-10 input-container">
                                Annual ROI at current Rates:
                                <span className="cursor-pointer select-none">$000</span>
                            </div>
                        </div> */}

                        <div className="mt-4">
                            <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                                <button
                                    className={`w-full rounded-xl flex justify-center items-center 
                                            font-bold py-4 px-28 ${loading ? " bg-lightGray text-gray pointer-events-none " :
                                            " bgPrimaryGradient text-black "} text-black`}
                                    onClick={() => handleSubmit(inputAmount, buttonText)}
                                >
                                    {loading && <Loader size="20px" className="mr-4" stroke="#717579" />}
                                    Confirm
                                </button>

                            </div>
                        </div>

                        <div className="mt-2">
                            <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                                <button
                                    className={`w-full rounded-xl flex justify-center items-center
                            font-bold py-4 px-28 bg-primary text-black`}
                                    onClick={getToken}
                                >
                                    <a
                                        rel={'noreferrer noopener'}
                                        href={'trade/swap'}
                                        className="flex flex-row items-center space-x-4 no-underline focus:outline-none"
                                    >
                                        <div className="flex w-3 h-3 rounded-full bg-primary" />
                                        <div className="no-underline focus:outline-none">
                                            Get {data.symbol}
                                        </div>
                                    </a>
                                </button>

                            </div>
                        </div>
                    </div>

                </div>

                {modalError.message ? <ErrorMessage>{modalError.message}</ErrorMessage> : ''}
            </div>
        </CustomModal>
    return (
        <div>
            <Modal
                title={title}
                content={content}
                open={openModal}
                onSetOpen={onSetOpen}
                onCloseModal={closeModal}
                afterCloseModal={() => { }}
                width="max-w-xl"
            />
        </div>
    );
}

export default stakeModal;
