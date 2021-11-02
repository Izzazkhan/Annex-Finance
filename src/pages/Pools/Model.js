import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Slider from 'react-rangeslider';

export default function MyModal({ openModal, data, onCloseModal, handleSubmit, getToken, buttonText }) {
    console.log("buttonText", buttonText)
    const [value, setValue] = useState(0);
    const [inputAmount, setInputAmount] = useState(0)

    const handleFocus = (event) => event.target.select();

    function closeModal() {
        onCloseModal();
        // if (afterCloseModal) {
        //     afterCloseModal();
        // }
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

    return (
        <div className="relative">
            <Transition show={openModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-30 overflow-y-auto"
                    onClose={closeModal}
                >
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-75" />
                    <div className="min-h-screen px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left 
                            align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <Dialog.Title
                                    as="h3"
                                    className="label flex justify-between font-bold text-primary text-xl"
                                >
                                    {buttonText !== 'plus' ? 'Unstake in Pool' : 'Stake in Pool'}
                                </Dialog.Title>
                                <div className="label flex justify-between font-bold text-primary text-xl mt-5">
                                    <div className="">Stake:</div>
                                    <div className='flex'>
                                        <div className="bg-blue rounded-full relative w-9 h-9 ">
                                            <img src={data.logo} alt="" className="" />
                                        </div>
                                        <div className="">{data.symbol}</div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="border border-primary rounded-xl flex justify-between items-center 
                                    py-2.5 px-3.5 mt-5 input-container">
                                        <div>
                                            <input
                                                onFocus={handleFocus}
                                                className="bg-transparent focus:outline-none font-normal px-0 py-1 text-black font-bold 
                                            m-0 flex input mr-2.5 flex-1"
                                                type="number"
                                                value={inputAmount}
                                                onChange={onChangeInput}
                                            />
                                            <input
                                                className="bg-transparent focus:outline-none font-normal px-0 py-1 text-black font-bold 
                                            m-0 flex input mr-2.5 flex-1"
                                                type="number"
                                                value={0}
                                                disabled
                                            />
                                            {/* <span className="cursor-pointer select-none">MAX</span> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="label flex justify-between font-bold text-primary text-xl">
                                    <div className=""></div>
                                    <div className="">Balance: {data.tokenBalance}</div>
                                </div>

                                <div className="custom-range">
                                    <Slider
                                        // labels={checkCurrentEligibleEpoch ? holdingAPR.toString() : '0'}
                                        // handleLabel={'0'}
                                        min={0}
                                        max={data.tokenBalance}
                                        value={Number(value)}
                                        onChange={onChangeSlider}
                                    // tooltip={true}
                                    />
                                    <div className="label flex justify-between font-bold text-primary text-xl">
                                        <div className="">0%</div>
                                        <div className="">100%</div>
                                    </div>
                                </div>

                                <div className='flex'>
                                    <button
                                        className={`rounded-xl flex justify-center items-center 
                            font-bold mt-20 py-4 px-8 bg-primary text-black`}
                                        onClick={() => onPercentage(data.tokenBalance * (25 / 100))}
                                    >
                                        25%
                                    </button>
                                    <button
                                        className={`rounded-xl flex justify-center items-center 
                            font-bold mt-20 py-4 px-8 bg-primary text-black`}
                                        onClick={() => onPercentage(data.tokenBalance * (50 / 100))}
                                    >
                                        50%
                                    </button>
                                    <button
                                        className={`rounded-xl flex justify-center items-center 
                            font-bold mt-20 py-4 px-8 bg-primary text-black`}
                                        onClick={() => onPercentage(data.tokenBalance * (75 / 100))}
                                    >
                                        75%
                                    </button>
                                    <button
                                        className={`rounded-xl flex justify-center items-center 
                            font-bold mt-20 py-4 px-8 bg-primary text-black`}
                                        onClick={() => onPercentage(data.tokenBalance)}
                                    >
                                        Max
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <div className="rounded-xl flex justify-between items-center 
                                    py-2.5 px-3.5 mt-10 input-container">
                                        Annual ROI at current Rates:
                                        <span className="cursor-pointer select-none">$000</span>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                                        <button
                                            className={`rounded-xl flex justify-center items-center 
                            font-bold py-4 px-28 bg-primary text-black`}
                                            onClick={() => handleSubmit(inputAmount, buttonText)}
                                        >
                                            {/* {pendingTx && <Loader size="20px" className="mr-4" stroke="#717579" />} */}
                                            Confirm
                                        </button>

                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className=" rounded-xl flex justify-center items-center 
                                    py-2.5 px-3.5 input-container">
                                        <button
                                            className={`rounded-xl flex justify-center items-center 
                            font-bold py-4 px-28 bg-primary text-black`}
                                            onClick={getToken}
                                        >
                                            {/* {pendingTx && <Loader size="20px" className="mr-4" stroke="#717579" />} */}
                                            Get {data.symbol}
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
