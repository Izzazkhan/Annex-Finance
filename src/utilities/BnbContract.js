import Web3 from 'web3';
import * as constants from './constants';

export const sendSupply = async (from, amount, chainId, callback) => {
  const web3 = new Web3(window.web3.currentProvider);
  try {
    const contract = new web3.eth.Contract(
      JSON.parse(constants.CONTRACT_ABNB_ABI),
      constants.CONTRACT_ABEP_ADDRESS[chainId].bnb.address
    );
    const contractData = contract.methods.mint().encodeABI();

    const tx = {
      from,
      to: constants.CONTRACT_ABEP_ADDRESS[chainId].bnb.address,
      value: amount,
      data: contractData
    };
    // // Send transaction
    await web3.eth.sendTransaction(tx, err => {
      if (!err) {
        callback(true);
      }
      callback(false);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    callback(false);
  }
};

export const sendRepay = async (from, amount, chainId, callback) => {
  const web3 = new Web3(window.web3.currentProvider);
  try {
    const contract = new web3.eth.Contract(
      JSON.parse(constants.CONTRACT_ABNB_ABI),
      constants.CONTRACT_ABEP_ADDRESS[chainId].bnb.address
    );
    const contractData = contract.methods.repayBorrow().encodeABI();

    const tx = {
      from,
      to: constants.CONTRACT_ABEP_ADDRESS[chainId].bnb.address,
      value: amount,
      data: contractData
    };
    // Send transaction
    await web3.eth.sendTransaction(tx, err => {
      if (!err) {
        callback(true);
      }
      callback(false);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    callback(false);
  }
};
