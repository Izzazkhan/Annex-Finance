import React, { useState } from 'react';
import Form from './form';
import * as constants from '../../../utilities/constants';
import { useActiveWeb3React } from '../../../hooks';

export default function CreateAuction(props) {
  const { account } = useActiveWeb3React();
  const options = React.useMemo(() => {
    return Object.keys(constants.BIDDING_AUCTION_TOKEN).map((key, index) => ({
      id: constants.BIDDING_AUCTION_TOKEN[key].id,
      name: constants.BIDDING_AUCTION_TOKEN[key].symbol,
      logo: constants.CONTRACT_TOKEN_ADDRESS[key].asset,
      addr: constants.BIDDING_AUCTION_TOKEN[key].address,
      decimal: constants.BIDDING_AUCTION_TOKEN[key].decimals,
    }));
  }, []);
  return (
    <div className="create-auction bg-fadeBlack rounded-2xl text-white text-xl font-bold p-6 mt-4">
      <h2 className="text-white text-4xl font-normal">Create An Auction</h2>
      <div className="text-gray text-sm font-normal mt-2">Please fill in the form below</div>
      {/* <form> */}
      <Form options={options} account={account} />
      {/* </form> */}
    </div>
  );
}
