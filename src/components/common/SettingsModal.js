/* eslint-disable */
import React, {useEffect, useState} from 'react';
import Modal from '../UI/Modal';
import {useUserDeadline, useUserSlippageTolerance} from "../../core";
import QuestionHelper from "./QuestionHelper";

const MAX_SLIPPAGE = 5000;
const RISKY_SLIPPAGE_LOW = 50;
const RISKY_SLIPPAGE_HIGH = 500;

const predefinedValues = [
    { key: 1, label: "0.1%", value: 0.1 },
    { key: 2, label: "0.5%", value: 0.5 },
    { key: 3, label: "1%", value: 1 },
];

function SettingsModal({ open, onSetOpen, onCloseModal }) {
    const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
    const [value, setValue] = useState(userSlippageTolerance / 100);
    const [error, setError] = useState(null);


    const [deadline, setDeadline] = useUserDeadline();
    const [valueDeadline, setValueDeadline] = useState(deadline / 60); // deadline in minutes
    const [errorDeadline, setErrorDeadline] = useState(null);


    const handleChange = (evt) => {
        const { value: inputValue } = evt.target;
        setValue(parseFloat(inputValue));
    };


    const handleChangeDeadline = (evt) => {
        const { value: inputValue } = evt.target;
        setValueDeadline(parseInt(inputValue, 10));
    };

    useEffect(() => {
        try {
            const rawValue = value * 100;
            if (!Number.isNaN(rawValue) && rawValue > 0 && rawValue < MAX_SLIPPAGE) {
                setUserslippageTolerance(rawValue);
                setError(null);
            } else {
                setError("Enter a valid slippage percentage");
            }
        } catch {
            setError("Enter a valid slippage percentage");
        }
    }, [value, setError, setUserslippageTolerance]);


    // Notify user if slippage is risky
    useEffect(() => {
        if (userSlippageTolerance < RISKY_SLIPPAGE_LOW) {
            setError("Your transaction may fail");
        } else if (userSlippageTolerance > RISKY_SLIPPAGE_HIGH) {
            setError("Your transaction may be frontrun");
        }
    }, [userSlippageTolerance, setError]);


    useEffect(() => {
        try {
            const rawValue = valueDeadline * 60;
            if (!Number.isNaN(rawValue) && rawValue > 0) {
                setDeadline(rawValue);
                setErrorDeadline(null);
            } else {
                setErrorDeadline("Enter a valid deadline");
            }
        } catch {
            setErrorDeadline("Enter a valid deadline");
        }
    }, [valueDeadline, setErrorDeadline, setDeadline]);


    const title = <div className="text-left text-2xl mt-10 mx-6">Settings</div>;

  const content = (
    <div className="pt-10 pb-12 px-6">
      <div className="">
          Slippage tolerance
          <QuestionHelper
              text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
      </div>
      <div className="flex items-center space-x-4 mt-8">

          {predefinedValues.map(({ label, value: predefinedValue }) => {
              const handleClick = () => setValue(predefinedValue);

              return (
                  <button
                      key={predefinedValue}
                      className={`focus:outline-none py-4 px-8 rounded-md
                            text-lg font-bold ${
                          value === predefinedValue ? 'bg-primary text-black' : 'bg-fadeBlue text-white '
                      }`}
                      onClick={handleClick}
                  >
                      {label}
                  </button>
              );
          })}
          <div className={`${[0.1, 0.5, 1].includes(value) ? 'bg-fadeBlue text-white' : "bg-primary text-black"} py-4 px-8 rounded-md font-bold text-lg flex items-center`}>
              <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  placeholder="5%"
                  value={value}
                  onChange={handleChange}
                  className="w-40 border-none bg-transparent focus:outline-none focus:bg-transparent focus:border-none font-bold"/>
              <div className="text-xl">%</div>
          </div>

      </div>
        {error && (
            <div className="text-darkRed mt-8">
                {error}
            </div>
        )}
      <div className="text-xl mt-8">
          Transaction deadline
          <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
      </div>
      <div className="flex items-center space-x-4 mt-6">
          <div className="bg-fadeBlue py-4 px-10 rounded-md text-white font-bold text-lg flex items-center">
              <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder={'20'}
                  value={valueDeadline}
                  onChange={handleChangeDeadline}
                  className="w-40 border-none bg-transparent font-bold focus:outline-none focus:bg-transparent focus:border-none text-white"/>
          </div>
        <div className="">Minutes</div>
      </div>

        {errorDeadline && (
            <div className="text-darkRed mt-8">
                {errorDeadline}
            </div>
        )}
    </div>
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
        width=""
      />
    </div>
  );
}

export default SettingsModal;
