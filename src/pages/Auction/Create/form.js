import { Fragment, useState } from 'react';
import styled from 'styled-components';
import ArrowIcon from '../../../assets/icons/lendingArrow.svg';
import SVG from 'react-inlinesvg';
import Select from '../../../components/UI/Select';

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
        value: '',
      },
      {
        type: 'select',
        placeholder: 'Bidding token ',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        options: props.options,
        value: props.options[0] ? props.options[0] : [],
      },
      {
        type: 'date',
        placeholder: 'Auction end date',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'date',
        placeholder: 'Order cancellation date',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'text',
        placeholder: 'Auction sell amount',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'text',
        placeholder: 'Minimum buy amount',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'text',
        placeholder: 'Minimum bidding amount per order',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'text',
        placeholder: 'Minimum funding threshold',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
    ],
    advanceInputs: [
      {
        type: 'checkbox',
        placeholder: '',
        description: 'Action will settle auto ?',
        value: false,
      },
      {
        type: 'text',
        placeholder: 'Access manager contract address',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
      {
        type: 'textarea',
        placeholder: 'Access manager data',
        description: 'Loram ipsum dioole jxugio vsheip awci',
        value: '',
      },
    ],
  });

  const validateForm = () => {
    var form = document.getElementsByClassName('needs-validation')[0];
    let isValid = true;
    if (form.checkValidity() === false) {
      isValid = false;
      form.classList.add('was-validated');
    }
    return isValid;
  };
  const handleInputChange = (e, type, index, isAdvance) => {
    let key = isAdvance ? 'advanceInputs' : 'inputs';
    let inputs = isAdvance ? [...state.advanceInputs] : [...state.inputs];
    let input = inputs[index];
    if (input) {
      let value = '';
      if (type === 'text' || type === 'date' || type === 'textarea') {
        value = e.target.value;
      } else if (type === 'select') {
        value = e;
      } else if (type === 'checkbox') {
        value = !input['value'];
      }
      input['value'] = value;
    }
    setState({
      ...state,
      [key]: inputs,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = validateForm();
    if (isValid) {
      props.hanldeShowModal(true);
    }
  };
  return (
    <form className="needs-validation" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-10">
        {state.inputs.map((input, index) => {
          return input.type === 'select' ? (
            <SelectInput
              {...input}
              id={index}
              key={index}
              isAdvance={false}
              handleInputChange={handleInputChange}
            />
          ) : (
            <Input
              key={index}
              id={index}
              {...input}
              isAdvance={false}
              handleInputChange={handleInputChange}
            />
          );
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
                  <Checkbox
                    {...input}
                    id={index}
                    isAdvance={true}
                    handleInputChange={handleInputChange}
                  />
                ) : input.type === 'textarea' ? (
                  <Textarea
                    {...input}
                    id={index}
                    isAdvance={true}
                    handleInputChange={handleInputChange}
                  />
                ) : (
                  <Input
                    {...input}
                    id={index}
                    isAdvance={true}
                    handleInputChange={handleInputChange}
                  />
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
          type="button"
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          Submit Form
        </button>
      </div>
    </form>
  );
}

const Input = ({ id, type, placeholder, value, isAdvance, description, handleInputChange }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <input
        className="border border-solid border-gray bg-transparent
                 rounded-xl w-full focus:outline-none font-normal px-4 h-14 text-white text-lg"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e, type, id, isAdvance)}
        required
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
      {/* <div className="invalid-feedback">title is required.</div> */}
    </div>
  );
};

const Textarea = ({ id, type, placeholder, value, isAdvance, description, handleInputChange }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <textarea
        className="border border-solid border-gray bg-transparent
               rounded-xl w-full focus:outline-none font-normal px-4 py-2 h-20 text-white text-lg"
        type="text"
        placeholder={placeholder}
        row="5"
        onChange={(e) => handleInputChange(e, type, id, isAdvance)}
        value={value}
      ></textarea>
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};

const Checkbox = ({ id, type, description, value, isAdvance, handleInputChange }) => {
  return (
    <div className="col-span-6 flex mt-8 items-center custom-check">
      <label className="container text-base ml-2 font-normal">
        {description}
        <input
          type={type}
          checked={value}
          onChange={(e) => handleInputChange(e, type, id, isAdvance)}
        />
        <span className="checkmark"></span>
      </label>
    </div>
  );
};

const SelectInput = ({ id, options, value, type, isAdvance, handleInputChange, description }) => {
  return (
    <div className="col-span-6 flex flex-col mt-8">
      <Select
        options={options}
        onChange={(val) => handleInputChange(val, type, id, isAdvance)}
        width="w-66"
        value={value}
        type="basic-xl"
      />
      <div className="text-gray text-sm font-normal mt-3">{description}</div>
    </div>
  );
};
