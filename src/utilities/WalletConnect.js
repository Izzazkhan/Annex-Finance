import Web3 from 'web3';
import WalletConnect from '@walletconnect/client';
import * as constants from './constants';

const TOKEN_ABI = {
  // sxp: constants.CONTRACT_SXP_TOKEN_ABI,
  usdc: constants.CONTRACT_USDC_TOKEN_ABI,
  usdt: constants.CONTRACT_USDT_TOKEN_ABI,
  busd: constants.CONTRACT_BUSD_TOKEN_ABI,
  ann: constants.CONTRACT_ANN_TOKEN_ABI,
  btcb: constants.CONTRACT_BTCB_TOKEN_ABI,
  btc: constants.CONTRACT_BTCB_TOKEN_ABI,
  eth: constants.CONTRACT_ETH_TOKEN_ABI,
  // ltc: constants.CONTRACT_LTC_TOKEN_ABI,
  // xrp: constants.CONTRACT_XRP_TOKEN_ABI,
  // bch: constants.CONTRACT_BCH_TOKEN_ABI,
  dot: constants.CONTRACT_DOT_TOKEN_ABI,
  ada: constants.CONTRACT_ADA_TOKEN_ABI,
  // link: constants.CONTRACT_LINK_TOKEN_ABI,
  // dai: constants.CONTRACT_DAI_TOKEN_ABI,
  // fil: constants.CONTRACT_FIL_TOKEN_ABI,
  // beth: constants.CONTRACT_BETH_TOKEN_ABI
};

export default class WalletConnectClass {
  constructor(setConnect, setDisconnect) {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org'
    });
    this.connector.on('connect', setConnect);
    this.connector.on('session_update', setConnect);
    this.connector.on('disconnect', setDisconnect);

    this.web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_WEB3_PROVIDER)
    );
    window.web3 = this.web3;
  }

  static initialize() {
    return new WalletConnectClass();
  }

  async createSession() {
    if (!this.connector.connected) {
      try {
        await this.connector.createSession();
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return true;
    }
  }

  killSession() {
    if (this.connector && this.connector.connected) {
      this.connector.killSession();
      this.connector = null;
    } else {
      this.connector = null;
    }
  }

  async getEthBalance(address) {
    if (this.web3.utils.isAddress(address)) {
      try {
        const weiBalance = await this.web3.eth.getBalance(address);
        const balance = Number(this.web3.utils.fromWei(weiBalance, 'ether'));
        return balance;
      } catch (err) {
        return new Error(err);
      }
    } else {
      return new Error(constants.INVALID_ADDRESS);
    }
  }

  getEthBalanceAsync(address, callback) {
    if (this.web3.utils.isAddress(address)) {
      this.web3.eth
        .getBalance(address)
        .then(weiBalance => {
          const balance = Number(this.web3.utils.fromWei(weiBalance, 'ether'));
          callback(balance, null);
        })
        .catch(err => {
          callback(null, new Error(err));
        });
    } else {
      callback(null, new Error(constants.INVALID_ADDRESS));
    }
  }

  fromWei(weiBalance) {
    return Number(this.web3.utils.fromWei(weiBalance, 'ether'));
  }

  // getXaiTokenContract() {
  //   return new this.web3.eth.Contract(
  //     JSON.parse(constants.CONTRACT_XAI_TOKEN_ABI),
  //     constants.CONTRACT_XAI_TOKEN_ADDRESS
  //   );
  // }

  // getXaiControllerContract() {
  //   return new this.web3.eth.Contract(
  //     JSON.parse(constants.CONTRACT_XAI_CONTROLLER_ABI),
  //     constants.CONTRACT_XAI_UNITROLLER_ADDRESS
  //   );
  // }

  // getXaiVaultContract() {
  //   return new this.web3.eth.Contract(
  //     JSON.parse(constants.CONTRACT_XAI_VAULT_ABI),
  //     constants.CONTRACT_XAI_VAULT_ADDRESS
  //   );
  // }

  getTokenContract(name, chainId) {
    return new this.web3.eth.Contract(
      JSON.parse(TOKEN_ABI[name]),
      constants.CONTRACT_TOKEN_ADDRESS[chainId][name || 'usdt']
        ? constants.CONTRACT_TOKEN_ADDRESS[chainId][name || 'usdt'].address
        : constants.CONTRACT_TOKEN_ADDRESS[chainId].usdt.address
    );
  }

  getAbepContract(name, chainId) {
    return new this.web3.eth.Contract(
      JSON.parse(
        name !== 'bnb'
          ? constants.CONTRACT_ABEP_ABI
          : constants.CONTRACT_ABNB_ABI
      ),
      constants.CONTRACT_ABEP_ADDRESS[chainId][name || 'usdt']
        ? constants.CONTRACT_ABEP_ADDRESS[chainId][name || 'usdt'].address
        : constants.CONTRACT_ABEP_ADDRESS[chainId].usdt.address
    );
  }

  getComptrollerContract(chainId) {
    return new this.web3.eth.Contract(
      JSON.parse(constants.CONTRACT_COMPTROLLER_ABI),
      constants.CONTRACT_COMPTROLLER_ADDRESS[chainId]
    );
  }

  getPriceOracleContract(
    address = constants.CONTRACT_PRICE_ORACLE_ADDRESS[chainId],
    chainId
  ) {
    return new this.web3.eth.Contract(
      JSON.parse(constants.CONTRACT_PRICE_ORACLE_ABI),
      address
    );
  }

  getVoteContract(chainId) {
    return new this.web3.eth.Contract(
      JSON.parse(constants.CONTRACT_VOTE_ABI),
      constants.CONTRACT_VOTE_ADDRESS[chainId]
    );
  }

  getInterestModelContract(address) {
    return new this.web3.eth.Contract(
      JSON.parse(constants.CONTRACT_INTEREST_MODEL_ABI),
      address
    );
  }

  getTokenBalanceAsync(contractAddress, address, callback) {
    let updatedAddress = address;
    if (address.slice(0, 2) === '0x') {
      updatedAddress = address.substring(2);
    }
    const contractData = `0x70a08231000000000000000000000000${updatedAddress}`;

    if (this.web3.utils.isAddress(address)) {
      this.web3.eth
        .call({ to: contractAddress, data: contractData })
        .then(weiBalance => {
          const balance = Number(this.web3.utils.fromWei(weiBalance, 'ether'));
          callback(balance, null);
        })
        .catch(err => {
          callback(null, new Error(err));
        });
    } else {
      callback(null, new Error(constants.INVALID_ADDRESS));
    }
  }

  // async getNonce(address) {
  //   try {
  //     return await this.web3.eth.getTransactionCount(address);
  //   } catch (err) {
  //     return null;
  //   }
  // }

  // async sendApprove(from, amount) {
  //   try {
  //     const nonce = await this.web3.eth.getTransactionCount(from);
  //     const value = this.web3.utils.toWei(amount, 'ether');

  //     const contract = new this.web3.eth.Contract(
  //       JSON.parse(constants.CONTRACT_TOKEN_ABI),
  //       constants.CONTRACT_TOKEN_ADDRESS
  //     );
  //     const contractData = contract.methods
  //       .approve(constants.CONTRACT_STAKE_ADDRESS, value)
  //       .encodeABI();

  //     const tx = {
  //       from,
  //       to: constants.CONTRACT_TOKEN_ADDRESS,
  //       data: contractData,
  //       nonce
  //     };
  //     // Send transaction
  //     await this.connector
  //       .sendTransaction(tx)
  //       .then(result => {
  //         // Returns transaction id (hash)
  //         console.log(result);
  //         return true;
  //       })
  //       .catch(error => {
  //         // Error returned when rejected
  //         console.error(error);
  //         return false;
  //       });
  //     return false;
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.log(err);
  //     return false;
  //   }
  // }

  // async sendSupply(from, amount) {
  //   try {
  //     const nonce = await this.web3.eth.getTransactionCount(from);
  //     const value = this.web3.utils.toWei(amount, 'ether');

  //     const contract = new this.web3.eth.Contract(
  //       JSON.parse(constants.CONTRACT_STAKE_ABI),
  //       constants.CONTRACT_STAKE_ADDRESS
  //     );
  //     const contractData = contract.methods.stake(value).encodeABI();

  //     const tx = {
  //       from,
  //       to: constants.CONTRACT_STAKE_ADDRESS,
  //       data: contractData,
  //       nonce
  //     };
  //     // Send transaction
  //     await this.connector
  //       .sendTransaction(tx)
  //       .then(result => {
  //         // Returns transaction id (hash)
  //         console.log(result);
  //         return true;
  //       })
  //       .catch(error => {
  //         // Error returned when rejected
  //         console.error(error);
  //         return false;
  //       });
  //     return false;
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.log(err);
  //     return false;
  //   }
  // }

  // async sendWithdraw(from, amount) {
  //   try {
  //     const nonce = await this.web3.eth.getTransactionCount(from);
  //     const value = this.web3.utils.toWei(amount, 'ether');

  //     const contract = new this.web3.eth.Contract(
  //       JSON.parse(constants.CONTRACT_STAKE_ABI),
  //       constants.CONTRACT_STAKE_ADDRESS
  //     );
  //     const contractData = contract.methods.withdraw(value).encodeABI();

  //     const tx = {
  //       from,
  //       to: constants.CONTRACT_STAKE_ADDRESS,
  //       data: contractData,
  //       nonce
  //     };

  //     // Send transaction
  //     await this.connector
  //       .sendTransaction(tx)
  //       .then(result => {
  //         // Returns transaction id (hash)
  //         console.log(result);
  //         return true;
  //       })
  //       .catch(error => {
  //         // Error returned when rejected
  //         console.error(error);
  //         return false;
  //       });
  //     return false;
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.log(err);
  //     return false;
  //   }
  // }
}
