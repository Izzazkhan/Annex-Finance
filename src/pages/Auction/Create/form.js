import { Fragment, useState } from 'react';
import styled from 'styled-components';
import ArrowIcon from '../../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';

const ArrowContainer = styled.div`
  transform: ${({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: 0.3s ease all;
  will-change: transform;
`;

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

export default function Form(props) {
  const [showDetails, setShowDetails] = useState(false);
  const [state, setState] = useState({
    inputs: [
      {
        type: 'text',
        placeholder: 'Auction token',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'text',
        placeholder: 'Bidding token ',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'date',
        placeholder: 'Auction end date',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'date',
        placeholder: 'Order cancellation date',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'text',
        placeholder: 'Auction sell amount',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'text',
        placeholder: 'Minimum buy amount',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'text',
        placeholder: 'Minimum bidding amount per order',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'text',
        placeholder: 'Minimum funding threshold',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
    ],
    advanceInputs: [
      {
        type: 'checkbox',
        placeholder: '',
        description: 'Action will settle auto ?',
      },
      {
        type: 'text',
        placeholder: 'Access manager contract address',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
      {
        type: 'textarea',
        placeholder: 'Access manager data',
        description: 'Loram ipsum dioole jxugio vsheip awci',
      },
    ],
  });
  return (
    <Fragment>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
        {state.inputs.map((input, index) => {
          return <Input key={index} {...input} />;
        })}
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
          {state.advanceInputs.map((input, index) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-12 col-span-12" key={index}>
                {input.type === 'checkbox' ? (
                  <Checkbox {...input} />
                ) : input.type === 'textarea' ? (
                  <Textarea {...input} />
                ) : (
                  <Input {...input} />
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="text-right mt-10">
        <button
          className="focus:outline-none py-2 md:px-12 px-6 text-black text-xl 2xl:text-24
     h-14 bg-primary rounded-lg"
          onClick={() => {
            props.hanldeShowModal(true);
          }}
        >
          Submit Form
        </button>
      </div>
    </Fragment>
  );
}

const Input = ({ type, placeholder, description }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <input
        className="border border-solid border-gray bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
        type={type}
        placeholder={placeholder}
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};

const Textarea = ({ placeholder, description }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <textarea
        className="border border-solid border-gray bg-transparent
               rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-20 text-white text-lg"
        type="text"
        placeholder={placeholder}
        row="5"
      ></textarea>
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};

const Checkbox = ({ description }) => {
  return (
    <div className="col-span-6 flex mt-8 items-center custom-check">
      <label className="container text-base ml-2 font-normal">
        {description}
        <input type="checkbox" />
        <span className="checkmark"></span>
      </label>
    </div>
  );
};
