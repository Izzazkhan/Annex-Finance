import ArrowIcon from '../../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './modal';

const ArrowDown = styled.button`
  align-items: center;
  justify-content: center;
  transition: 0.3s ease all;
  will-change: background-color, border, transform;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }

  &:hover {
    background-color: #101016;
  }
`;

const Wrapper = styled.div`
  background-color: #000;
`;

const ArrowContainer = styled.div`
  transform: ${({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: 0.3s ease all;
  will-change: transform;
`;

export default function CreateAuction(props) {
  const [showModal, updateShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="create-auction bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white text-4xl font-normal">Create An Auction</h2>
      <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
      {/* <form> */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Auction token"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Bidding token "
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="date"
            placeholder="Auction end date"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="date"
            placeholder="Order cancellation date"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Auction sell amount"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Minimum buy amount"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Minimum bidding amount per order"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
        <div className="col-span-6 flex flex-col mt-8">
          <input
            className="border border-solid border-gray bg-transparent
                           rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
            type="text"
            placeholder="Minimum funding threshold"
          />
          <div className="text-gray text-sm font-normal mt-3">
            Loram ipsum dioole jxugio vsheip awci
          </div>
        </div>
      </div>
      <div className="text-right">
        <ArrowDown onClick={() => setShowDetails((s) => !s)} className={'flex ml-auto'}>
          <div className="reverse-rotate text-primary text-base mr-2">Advance</div>{' '}
          <ArrowContainer className="flex" active={showDetails}>
            <SVG src={ArrowIcon} />
          </ArrowContainer>
        </ArrowDown>
      </div>
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-5">
          <div className="grid grid-cols-1 md:grid-cols-12 col-span-12">
            <div className="col-span-6 flex mt-8 items-center custom-check">
              <label className="container text-base ml-2 font-normal">
                Action will settle auto ?
                <input type="checkbox" />
                <span className="checkmark"></span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 col-span-12">
            <div className="col-span-6 flex flex-col mt-8">
              <input
                className="border border-solid border-gray bg-transparent
                             rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
                type="text"
                placeholder="Access manager contract address"
              />
              <div className="text-gray text-sm font-normal mt-3">
                Loram ipsum dioole jxugio vsheip awci
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 col-span-12">
            <div className="col-span-6 flex flex-col mt-8">
              <textarea
                className="border border-solid border-gray bg-transparent
                             rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-20 text-white text-lg"
                type="text"
                placeholder="Access manager data"
                row="5"
              ></textarea>
              <div className="text-gray text-sm font-normal mt-3">
                Loram ipsum dioole jxugio vsheip awci
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-right mt-10">
        <button
          className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
         h-14 bg-primary rounded-lg"
          onClick={() => {
            updateShowModal(true);
          }}
        >
          Submit Form
        </button>
      </div>
      {/* </form> */}
      <Modal
        open={showModal}
        type="inprogress"
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => updateShowModal(false)}
      />
    </div>
  );
}
