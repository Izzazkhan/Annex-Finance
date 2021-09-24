/* eslint-disable */
import React, { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import usdc from '../../assets/images/coins/usdc.png';
import styled from 'styled-components';
import * as constants from '../../utilities/constants';

const ListboxOptions = styled(Listbox.Options)`
  border-radius: 24px;
`;

const defaultOptions = [
  { name: 'usdc', logo: <img alt={'usdc'} src={usdc} style={{ width: 32, height: 32 }} /> },
];

function Select({
  type,
  options = defaultOptions,
  width,
  label,
  labelClassName,
  logoClassName,
  selectedClassName,
  selectedTextClassName,
  dropDownClass,
  onChange,
}) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <div className={width}>
      <Listbox
        value={selected}
        onChange={(val) => {
          setSelected(val);
          if (onChange) {
            onChange(val);
          }
        }}
      >
        {({ open }) => (
          <>
            <div className="relative" style={{ zIndex: 1 }}>
              <Listbox.Button
                className={`relative w-full pl-3 pr-10 text-left
              shadow-md cursor-default focus:outline-none
              focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white
               focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2
               focus-visible:border-indigo-500 sm:text-sm bg-transparent border border-solid ${
                 type === 'primary'
                   ? 'border-primary rounded-4xl'
                   : type === 'custom-primary'
                   ? 'border-primary rounded-lg '
                   : type === 'basic'
                   ? 'border-gray rounded-md py-2'
                   : type === 'mini'
                   ? 'border-none shadow-none'
                   : type === 'basic-xl'
                   ? 'border-gray  rounded-xl px-4 h-14'
                   : 'bg-primary rounded-4xl py-1.5'
               } ${selectedClassName}`}
              >
                <div className="flex items-center space-x-4">
                  {selected?.logo && (
                    <div className={logoClassName ? logoClassName : ''}>
                      <img
                        alt={selected?.name}
                        src={selected?.logo}
                        style={{ width: 28, height: 28 }}
                      />
                    </div>
                  )}
                  <div>
                    {label && <div className={labelClassName}>{label}</div>}
                    <span
                      className={`block truncate ${
                        type === 'primary'
                          ? 'text-primary font-bold'
                          : type === 'custom-primary'
                          ? 'text-white text-lg'
                          : type === 'basic'
                          ? 'text-white'
                          : type === 'mini'
                      } ${selectedTextClassName}`}
                    >
                      {selected.name}
                    </span>
                  </div>
                </div>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDownIcon
                    className={`w-6 hover:text-violet-100 mr-2 ${
                      type === 'primary'
                        ? 'text-primary'
                        : type === 'custom-primary'
                        ? 'text-primary'
                        : type === 'basic'
                        ? 'text-white'
                        : type === 'mini'
                    } ${dropDownClass}`}
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transform transition ease-in duration-200"
                leaveFrom="opacity-100 scale-100 "
                leaveTo="opacity-0 scale-95 "
              >
                <ListboxOptions
                  static
                  className="absolute w-full py-1 mt-1 overflow-auto text-base text-white bg-fadeBlack rounded-xl
                   rounded-b-md shadow-lg max-h-58 ring-1 ring-black ring-opacity-5
                   border border-solid border-gray focus:outline-none sm:text-sm"
                >
                  {options.map((option, optionIdx) => (
                    <Listbox.Option
                      key={optionIdx}
                      className={({ active }) =>
                        `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                          select-none relative py-1 pl-4 pr-4 cursor-pointer`
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <div className="flex items-center space-x-2">
                          {option?.logo && (
                            <div className={logoClassName ? logoClassName : ''}>
                              <img
                                alt={option?.name}
                                src={option?.logo}
                                style={{ width: 32, height: 32 }}
                              />
                            </div>
                          )}
                          <span
                            className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}
                          >
                            {option.name}
                          </span>
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}

Select.defaultProps = {
  type: 'primary',
  width: 'w-56',
};

export default Select;
