import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SVG from 'react-inlinesvg';

import Modal from '../UI/Modal';
import logoMini from '../../assets/icons/logoMini.svg';
import bigArrow from '../../assets/icons/bigArrow.svg';
import metaMask from '../../assets/icons/metaMask.svg';
import ledger from '../../assets/icons/ledger.svg';
import walletConnect from '../../assets/icons/walletConnect.svg';
import coinbaseWallet from '../../assets/icons/coinbaseWallet.svg';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { isMobile } from 'react-device-detect';
import { NetworkContextName } from '../../constants';
import usePrevious from '../../hooks/usePrevious';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import connectors from '../../connectors';
import getExplorerLink from '../../utils/getExplorerLink';
import useCopyClipboard from '../../hooks/useCopyClipboard';
import ExternalLinkIcon from '../../assets/icons/externalLink.svg';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import { useActiveWeb3React } from '../../hooks';

const WALLET_VIEWS = {
  OPTIONS: 'options',
  ACCOUNT: 'account',
};

function ConnectWalletModal({ open, onSetOpen, onCloseModal, setSetting }) {

  const { chainId: _chainId } = useActiveWeb3React();

  const [isCopied, setCopied] = useCopyClipboard();
  const { active, account, connector, activate, error, deactivate } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingError, setPendingError] = useState(false);

  useEffect(() => {
    if (open) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [open]);

  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);

  useEffect(() => {
    if (
      open &&
      ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, open, activePrevious, connectorPrevious]);

  const tryActivation = async (provider) => {
    const connector = provider.provider;

    if (provider.name === 'MetaMask' && !window.ethereum) {
      setPendingError('Install Metamask first!');
      return false;
    }
    setWalletView(WALLET_VIEWS.OPTIONS);

    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true)
        .then(async (res) => {
          setSetting({
            selectedAddress: account,
            account: 'accountConnected',
          });
          localStorage.setItem('connect', 'connected');
          localStorage.setItem('approveBiddingToken', false)
          const networkDetails = {
            chainId: `0x${(_chainId).toString(16)}`,
            chainName: `BSC ${_chainId === 97 ? 'Testnet' : 'Mainnet'}`,
            nativeCurrency: {
              name: 'Binance-Peg Binance',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls:
              _chainId === 97
                ? ['https://data-seed-prebsc-1-s1.binance.org:8545']
                : [process.env.REACT_APP_WEB3_PROVIDER],
          };

          await window?.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [networkDetails],
          });
        })
        .catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector);
          } else {
            setPendingError(error?.message || 'Something went wrong');
          }
        });
  };

  // console.log('settings', settings);

  const title =
    account && walletView === WALLET_VIEWS.ACCOUNT ? (
      <div className="flex flex-col justify-center items-center space-y-6 mt-10 mb-4">
        <div className="text-2xl font-bold">Your Wallet</div>
      </div>
    ) : (
      <div className="flex flex-col justify-center items-center space-y-6 mt-10">
        <div className="rounded-full w-16 h-16">
          <img src={logoMini} alt="logo" className={'w-16 h-16'} />
        </div>
        <div className="text-2xl font-bold">Connect Wallet</div>
        <div className="text-sm">To start using AToken</div>
      </div>
    );

  const logout = () => {
    deactivate();
    setSetting({
      selectedAddress: account,
      account: 'accountDisconnected',
    });
    localStorage.setItem('connect', 'disConnected');
  };

  const content =
    account && walletView === WALLET_VIEWS.ACCOUNT ? (
      <div className="px-14">
        <div className=" border-t border-gray py-14">
          <div className="flex flex-col items-center justify-between">
            <div className="text-primary font-bold mb-14">{account}</div>
            <div className="flex flex-row items-center justify-center mb-14">
              <a
                href={getExplorerLink(account, 'address')}
                className="text-white mr-10 flex items-center"
                target={'_blank'}
                rel={'noreferrer noopener'}
              >
                View on BscScan &nbsp;
                <SVG src={ExternalLinkIcon} />
              </a>
              <div
                onClick={setCopied.bind(this, account)}
                className="cursor-pointer text-white flex items-center"
              >
                {isCopied ? 'Copied!' : 'Copy Address'} &nbsp;
                <SVG src={ExternalLinkIcon} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch lg:items-center justify-center">
              <button
                className="
                  bg-primary text-black rounded-full px-20 py-5 uppercase font-bold focus:outline-none
                  "
                onClick={logout}
              >
                Logout
              </button>
              <button
                className="mt-1 sm:ml-2
                  bg-primary text-black rounded-full px-20 py-5 uppercase font-bold focus:outline-none
                  "
                onClick={onCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="p-14">
        <div className="flex flex-col space-y-8">
          <div
            className="flex justify-between items-center  cursor-pointer"
            onClick={tryActivation.bind(this, connectors.injected)}
          >
            <div className="flex items-center space-x-4">
              <img className="w-12" src={metaMask} alt="arrow" />
              <div className="text-white text-xl">MetaMask</div>
            </div>
            <img className="w-7" src={bigArrow} alt="arrow" />
          </div>
          {!isMobile && (
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={tryActivation.bind(this, connectors.ledger)}
            >
              <div className="flex items-center space-x-4">
                <img className="w-12" src={ledger} alt="arrow" />
                <div className="text-white text-xl">Ledger</div>
              </div>
              <img className="w-7" src={bigArrow} alt="arrow" />
            </div>
          )}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={tryActivation.bind(this, connectors.walletConnect)}
          >
            <div className="flex items-center space-x-4">
              <img className="w-12" src={walletConnect} alt="arrow" />
              <div className="text-white text-xl">Wallet Connect</div>
            </div>
            <img className="w-7" src={bigArrow} alt="arrow" />
          </div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={tryActivation.bind(this, connectors.coinbase)}
          >
            <div className="flex items-center space-x-4">
              <img className="w-12" src={coinbaseWallet} alt="arrow" />
              <div className="text-white text-xl">Coinbase Wallet</div>
            </div>
            <img className="w-7" src={bigArrow} alt="arrow" />
          </div>
        </div>
        {pendingError ? (
          <div className="text-center text-red mt-10">{pendingError}</div>
        ) : (
          <div className="text-center mt-10">
            By connecting, I accept AToken
            <a
              href="https://www.annex.finance/terms"
              className="text-primary ml-2"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>
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
        afterCloseModal={() => { }}
        width="max-w-xl"
      />
    </div>
  );
}

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
    },
    dispatch,
  );
};
export default connectAccount(mapStateToProps, mapDispatchToProps)(ConnectWalletModal);
