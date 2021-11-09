import { accountActionCreators, connectAccount } from '../../../core';
import { bindActionCreators, compose } from 'redux';
import MarkdownIt from 'markdown-it';
import React, { useEffect, useState } from 'react';
import Form, { Field, useForm } from 'rc-field-form';
import { encodeParameters, getArgs } from '../../../utilities/common';
import Modal from '../../UI/Modal';
import edit from '../../../assets/icons/edit.svg';
import closeCirclePrimary from '../../../assets/icons/closeCirclePrimary.svg';

import crossPrimary from '../../../assets/icons/crossPrimary.svg';
import Loading from '../../UI/Loading';
import { getVoteContract, methods } from '../../../utilities/ContractService';
import { useActiveWeb3React } from "../../../hooks";
import MdEditor from 'react-markdown-editor-lite';

const mdParser = new MarkdownIt();

const ProposalModal = ({ address, visible, maxOperation, onCancel, getProposals, ...props }) => {
  const { chainId } = useActiveWeb3React();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activePanelKey, setActivePanelKey] = useState(['0']);
  const [editingActions, setEditingActions] = useState([]);

  const [formData, setFormData] = useState([
    {
      targetAddress: '',
      value: '',
      signature: '',
      callData: [],
    },
  ]);

  const [form] = useForm();

  useEffect(() => {
    if (!visible) {
      if (form.__INTERNAL__?.name) {
        form.resetFields();
      }
      setIsLoading(false);
      setErrorMsg('');
      setDescription('');
      setFormData([
        {
          targetAddress: '',
          value: '',
          signature: '',
          callData: [],
        },
      ]);
    }
  }, [visible, form]);

  const handleSubmit = (formValues) => {
    const targetAddresses = [];
    const values = [];
    const signatures = [];
    const callDatas = [];
    if (description.trim().length === 0) {
      setErrorMsg('Description is required');
    } else {
      setErrorMsg('');
    }

    const proposalDescription = `${formValues?.title}\n${description}`;
    try {
      for (let i = 0; i < formData.length; i += 1) {
        const callDataValues = [];
        let callDataTypes = [];
        targetAddresses.push(formValues[`targetAddress${i}`]);
        values.push(0);
        signatures.push(formValues[`signature${i}`]);
        callDataTypes = getArgs(formValues[`signature${i}`]);
        for (let j = 0; j < formData[i].callData.length; j += 1) {
          if (callDataTypes[j].toLowerCase() === 'bool') {
            callDataValues.push(formValues[`calldata_${i}_${j}`].toLowerCase() === 'true');
          } else if (callDataTypes[j].includes('[]')) {
            callDataValues.push(formValues[`calldata_${i}_${j}`].split(','));
          } else {
            callDataValues.push(formValues[`calldata_${i}_${j}`]);
          }
        }
        callDatas.push(encodeParameters(callDataTypes, callDataValues));
      }
    } catch (error) {
      setErrorMsg('Proposal parameters are invalid!');
      return;
    }
    setIsLoading(true);
    const appContract = getVoteContract(chainId);
    methods
      .send(
        appContract.methods.propose,
        [targetAddresses, values, signatures, callDatas, proposalDescription],
        address,
      )
      .then(() => {
        setErrorMsg('');
        setIsLoading(false);
        onCancel();
      })
      .catch(() => {
        setErrorMsg('Creating proposal is failed!');
        setIsLoading(false);
      });
  };

  const handleEditorChange = ({ text }) => {
    setDescription(text);
  };

  const handleAdd = (type, index) => {
    if (form.__INTERNAL__?.name) {
      form.resetFields();
    }
    if (type === 'next') {
      formData.splice(index + 1, 0, {
        targetAddress: '',
        value: '',
        signature: '',
        callData: [],
      });
    } else {
      formData.splice(index, 0, {
        targetAddress: '',
        value: '',
        signature: '',
        callData: [],
      });
    }
    setFormData([...JSON.parse(JSON.stringify(formData))]);
    setActivePanelKey(type === 'next' ? index + 1 : index);
  };

  const handleRemove = (idx) => {
    setFormData([
      ...formData.filter((_f, index) => index < idx),
      ...formData.filter((_f, index) => index > idx),
    ]);
  };

  const handleParseFunc = (funcStr, idx) => {
    if ((funcStr || '').trim().replace(/^s+|s+$/g, '')) {
      const parsedStr = getArgs(funcStr);
      formData[idx].signature = funcStr;
      formData[idx].callData = [...parsedStr];
      setFormData([...formData]);
    }
  };

  const handleKeyUp = (type, idx, subIdx, v) => {
    if (type === 'targetAddress') {
      formData[idx].targetAddress = v;
    } else if (type === 'value') {
      formData[idx].value = v;
    } else if (type === 'calldata') {
      formData[idx].callData[subIdx] = v;
    }
    setFormData([...formData]);
  };

  const title = (
    <div className="mx-10">
      <div
        className="grid grid-cols-5 items-center w-full mt-10 pb-8
                    border-b border-solid border-lightGray"
      >
        <div
          className="col-start-1 col-span-4 md:col-start-3 col-span-3 self-items-start
         md:self-items-center text-2xl font-bold"
        >
          Create Proposal
        </div>
        <div
          className="col-start-5 justify-self-end cursor-pointer"
          onClick={() => {
            onCancel();
          }}
        >
          <img className="" src={crossPrimary} alt="close" />
        </div>
      </div>
    </div>
  );

  const content = (
    <Form 
      form={form}
      onFinishFailed={(errorInfo) => {
        setErrorMsg(errorInfo.errorFields[0].errors[0]);
      }}
      onFinish={handleSubmit}
    >
      <div className="pt-14 pb-8 px-4 overflow-auto">
        <div className="mx-5 grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
          <div className="w-full">
            <div className="text-24 border-b border-solid border-lightGray pb-8">
              Proposal Description
            </div>
            <div className="mt-6">
              <div className="text-24">Title</div>
              <Field name={'title'}>
                <input
                  type="text"
                  className="border border-solid border-primary bg-black
                                        rounded-xl w-full focus:outline-none font-bold py-3 sm:pl-4
                                        pr-4 text-white mt-2 mb-4"
                  placeholder="Add a New aToken!"
                />
              </Field>
            </div>
            <div className="mt-4">
              <div className="text-24">Overview</div>
              <MdEditor
                style={{
                  background: '#0A0A0E',
                  border: '1px solid #FF9800',
                  borderRadius: '10px',
                  fontWeight: '700',
                  overflow: 'hidden',
                  color: 'white',
                  height: 280,
                }}
                value={description}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                placeholder="Thorough description of all changes. Link to all relevant
                                    contact addresses. Markdown is supported."
              />
            </div>
          </div>

          <div className="w-full">
            <div className="text-24 font-bold border-b border-solid border-lightGray pb-8 mt-8 md:mt-0">
              Actions
            </div>
            <div className="mt-8 flex flex-col space-y-8">
              {formData.map((f, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className="flex items-center justify-between bg-black py-4 px-5">
                      <div className="text-18">Action {index + 1}</div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          if (editingActions.includes(index)) {
                            const newEditingActions = editingActions.filter((a) => a !== index);
                            setEditingActions(newEditingActions);
                            if (index > 0) {
                              handleRemove(index);
                            }
                          } else {
                            setEditingActions((prevState) => [...prevState, index]);
                          }
                        }}
                      >
                        {!editingActions.includes(index) || index === 0 ? (
                          <img src={edit} alt="" />
                        ) : index > 0 ? (
                          <img src={closeCirclePrimary} alt="" />
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={`
                                            px-10 pt-10 pb-6 bg-darkGray rounded-2xl
                                            ${editingActions.includes(index) ? 'block' : 'hidden'}
                                            `}
                    >
                      <Field
                        name={`targetAddress${index}`}
                        rules={[
                          { required: true, message: 'Address is required!' },
                          {
                            whitespace: true,
                            message: 'This field can not empty',
                          },
                        ]}
                      >
                        <input
                          placeholder="Address"
                          onChange={(e) =>
                            handleKeyUp('targetAddress', index, null, e.target.value)
                          }
                          type="text"
                          className="primary-placeholder border border-solid
                                                       border-primary bg-black
                                                       rounded-xl w-full focus:outline-none
                                                       font-bold py-5 px-4 text-white mb-4"
                        />
                      </Field>
                      <Field
                        name={`signature${index}`}
                        rules={[
                          { required: true, message: 'Signature is required!' },
                          {
                            whitespace: true,
                            message: 'This field can not empty',
                          },
                        ]}
                      >
                        <input
                          placeholder="assumeOwnership(address,string,uint256)"
                          onChange={(e) => handleParseFunc(e.target.value, index)}
                          type="text"
                          className="primary-placeholder border border-solid
                                                       border-primary bg-black
                                                       rounded-xl w-full focus:outline-none
                                                       font-bold py-5 px-4 text-white mb-4 mt-2"
                        />
                      </Field>
                      {f.callData.map((c, cIdx) => {
                        return (
                          <Field
                            key={cIdx}
                            name={`calldata_${index}_${cIdx}`}
                            rules={[
                              {
                                required: true,
                                message: 'Calldata is required!',
                              },
                              {
                                whitespace: true,
                                message: 'This field can not empty',
                              },
                            ]}
                          >
                            <input
                              type="text"
                              placeholder={`${c}`}
                              className="primary-placeholder border border-solid
                                                               border-primary bg-black
                                                               rounded-xl w-full focus:outline-none
                                                               font-bold py-5 px-4 text-white mb-4 mt-2"
                              onChange={(e) => handleKeyUp('calldata', index, cIdx, e.target.value)}
                            />
                          </Field>
                        );
                      })}

                      {formData.length < +maxOperation && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                          {index !== 0 && (
                            <button
                              type={'button'}
                              className="bg-primary focus:outline-none py-2 px-16
                                                            rounded-2xl text-base text-black"
                              onClick={() => handleAdd('previous', index)}
                            >
                              Add to previous
                            </button>
                          )}
                          <button
                            type={'button'}
                            className="bg-primary focus:outline-none py-2 px-12
                                                        rounded-2xl text-base text-black"
                            onClick={() => handleAdd('next', index)}
                          >
                            Add to next
                          </button>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex justify-center items-center text-center text-red mt-8 ">
            {errorMsg}
          </div>
        )}
        <div className="flex justify-center mt-8 md:mt-0">
          <button
            className="bgPrimaryGradient focus:outline-none py-2 px-12 mt-6
                            flex flex-row items-center justify-center
                         rounded-md text-24 text-black w-full"
            style={{ maxWidth: 320 }}
            disabled={
              isLoading || formData.length > maxOperation || description.trim().length === 0
            }
            type={'submit'}
          >
            {isLoading && <Loading size={'18px'} margin={'8px'} />} Create Proposal
          </button>
        </div>
      </div>
    </Form>
  );

  return (
    <div>
      <Modal
        title={title}
        content={content}
        open={visible}
        onCloseModal={onCancel}
        afterCloseModal={() => {}}
        width="max-w-1200"
      />
    </div>
  );
};

ProposalModal.defaultProps = {
  visible: false,
  address: '',
  maxOperation: 0,
  onCancel: () => {},
};

const mapDispatchToProps = (dispatch) => {
  const { getProposals } = accountActionCreators;

  return bindActionCreators(
    {
      getProposals,
    },
    dispatch,
  );
};

export default compose(connectAccount(undefined, mapDispatchToProps))(ProposalModal);
