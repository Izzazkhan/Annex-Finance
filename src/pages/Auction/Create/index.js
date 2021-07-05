import React, { useState, useContext } from 'react';
import Modal from './modal';
import Form from './form';
import * as constants from '../../../utilities/constants';
import subGraphContext from '../../../contexts/subgraph';
import { gql } from '@apollo/client';
import { useSubgraph } from 'thegraph-react';

export default function CreateAuction(props) {
  const [showModal, updateShowModal] = useState(false);
  const [modalType, updateModalType] = useState('inprogress');
  const subGraphInstance = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const { error, loading, data } = useQuery(gql`
    {
      uniswapFactories(first: 5) {
        id
        pairCount
        totalVolumeUSD
        totalVolumeETH
      }
      tokens(first: 5) {
        id
        symbol
        name
        decimals
      }
    }
  `);
  const hanldeShowModal = (val) => {
    updateModalType('inprogress');
    updateShowModal(val);
  };
  const options = React.useMemo(() => {
    return Object.keys(constants.CONTRACT_ABEP_ADDRESS).map((key, index) => ({
      id: constants.CONTRACT_TOKEN_ADDRESS[key].id,
      name: constants.CONTRACT_TOKEN_ADDRESS[key].symbol,
      logo: constants.CONTRACT_TOKEN_ADDRESS[key].asset,
    }));
  }, []);
  return (
    <div className="create-auction bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white text-4xl font-normal">Create An Auction</h2>
      <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
      {/* <form> */}
      <Form hanldeShowModal={hanldeShowModal} options={options} />
      {/* </form> */}
      <Modal
        open={showModal}
        type={modalType}
        handleSubmit={() => updateModalType('success')}
        onSetOpen={() => updateShowModal(true)}
        onCloseModal={() => updateShowModal(false)}
      />
      <div>
        <span>{error || loading ? 'Loading...' : JSON.stringify(data)}</span>
      </div>
    </div>
  );
}
