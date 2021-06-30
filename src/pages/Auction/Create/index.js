import { useState } from 'react';
import Modal from './modal';

export default function CreateAuction(props) {
  const [showModal, updateShowModal] = useState(false);
  return (
    <div className="col-span-12 p-6 flex flex-col">
      <h2 className="text-white mb-2 text-4xl font-normal">Create Auction</h2>
      <button
        className="focus:outline-none bgPrimaryGradient py-2 px-4 rounded-3xl text-white"
        onClick={() => {
          updateShowModal(true);
        }}
      >
        Show Modal
      </button>
      <Modal
        open={showModal}
        type="inprogress"
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => updateShowModal(false)}
      />
    </div>
  );
}
