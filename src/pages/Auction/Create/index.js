import React, { useState } from 'react';
import Modal from './modal';
import Form from './form';

export default function CreateAuction(props) {
  const [showModal, updateShowModal] = useState(false);
  const [modalType, updateModalType] = useState('inprogress');
  const hanldeShowModal = (val) => {
    updateModalType('inprogress');
    updateShowModal(val);
  };
  return (
    <div className="create-auction bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white text-4xl font-normal">Create An Auction</h2>
      <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
      {/* <form> */}
      <Form hanldeShowModal={hanldeShowModal} />
      {/* </form> */}
      <Modal
        open={showModal}
        type={modalType}
        handleSubmit={() => updateModalType('success')}
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => updateShowModal(false)}
      />
    </div>
  );
}
