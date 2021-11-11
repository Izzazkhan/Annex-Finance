import React, { useEffect, useMemo, useState } from 'react';
import coins from '../../assets/icons/coins.svg';
import MiniLogo from '../../components/UI/MiniLogo';
import ConnectWalletModal from './ConnectWalletModal';
import { useActiveWeb3React } from '../../hooks';
import { shortenAddress } from '../../utils/address';
import { AVAILABLE_NETWORKS } from '../../utilities/constants';
import commaNumber from 'comma-number';
import BigNumber from 'bignumber.js';
import { nFormatter } from '../../utils/data';
import { useCountUp } from 'react-countup';
import HeaderLogo from '../../assets/icons/headerLogo.svg';
import Select from 'components/UI/Select';
import styled from 'styled-components';

const Styles = styled.div`
  .custom-max-width {
    max-width: 500px;
  }
  .custom-font-size {
    font-size: 0.575rem;
  }
  @media (min-width: 1280px) {
    .custom-max-width {
      max-width: 650px;
    }
    .custom-font-size {
      font-size: 0.875rem;
    }
  }
`

const networkArrayOptions = [
  { name: "Binance", logo: null, value: 56 },
  { name: "Binance Testnet", logo: null, value: 97 },
  { name: "Cassini", logo: null, value: 339 },
  { name: "Cronos", logo: null, value: 25 },
]
const format = commaNumber.bindWith(',', '.');

function Navigation({ wrapperClassName, isOpen, totalLiquidity, onClose }) {
  const { account, active, chainId } = useActiveWeb3React();
  // console.log('account', account);
  const [connectWalletsOpen, setConnectWalletsOpen] = useState(false);

  const { countUp: mintedCountUp, update: mintedUpdate } = useCountUp({ end: 0 });
  const { countUp: liquidityCountUp, update: liquidityUpdate } = useCountUp({ end: 0 });

  const currentNetworkObj = useMemo(() => {
    if (chainId) {
      return networkArrayOptions.find((i) => i.value === chainId)
    }
    return networkArrayOptions[0]
  }, [chainId])

  useEffect(() => {
    liquidityUpdate(Number(totalLiquidity));
  }, [totalLiquidity]);

  // useEffect(() => {
  //   if(totalXaiMinted instanceof BigNumber) {
  //     mintedUpdate(Number(totalXaiMinted?.toNumber()));
  //   }
  // }, [totalXaiMinted])

  const ConnectWallet = ({ action }) => (
    <button
      className="focus:outline-none bgPrimaryGradient py-2 px-4 rounded-3xl text-white"
      onClick={() => {
        if (action) {
          action();
        }
        setConnectWalletsOpen(true);
      }}
    >
      {account ? shortenAddress(account) : 'Connect wallet'}
    </button>
  );

  const handleChangeNetwork = (chainId) => {
    if (AVAILABLE_NETWORKS[chainId]) {
      window.ethereum
        .request({
          method: 'wallet_addEthereumChain',
          params: [AVAILABLE_NETWORKS[chainId], account],
        })
        .then((result) => {
          console.log('result : ', result)
          if (!result) {
            console.log('error')
          }
        })
        .catch((error) => {
          console.log('error: ', error)
        });
      }
  }

  return (
    <Styles className={`w-full ${wrapperClassName}`}>
      <ConnectWalletModal
        open={connectWalletsOpen}
        onSetOpen={() => setConnectWalletsOpen(true)}
        onCloseModal={() => setConnectWalletsOpen(false)}
      />
      {!isOpen && (
        <ul className="hidden lg:flex justify-between items-center w-full custom-max-width ml-auto">
          <li className="flex items-center space-x-2">
            <img src={coins} alt="coins" />
            <div className="">
              <div
                className="text-2xl text-white text-left"
                style={{ color: 'rgb(255, 152, 0)', fontWeight: 'bold' }}
              >
                ${nFormatter(new BigNumber(liquidityCountUp).dp(2, 1).toString(10), 2)}
              </div>
              <div
                className="text-secondary custom-font-size "
                style={{ color: 'rgb(255, 152, 0)', fontWeight: 'bold' }}
              >
                Total Value Locked
              </div>
            </div>
          </li>
          <li className="">
            <Select options={networkArrayOptions}
              selectedOption={currentNetworkObj}
              onChange={(selected) => { handleChangeNetwork(selected.value) }}
              selectedClassName={'py-1.5 pl-5 rounded-full'}
              selectedTextClassName={"text-xl font-normal text-white"}
            />
          </li>
          <li className="">
            <ConnectWallet />
          </li>
          <li className="">
            <a href="https://annex.finance" target="_blank" rel="noreferrer">
              <img src={HeaderLogo} alt={'Annex'} className={'w-12 h-12 rounded-full block'} />
            </a>
          </li>
        </ul>
      )}
      <ul className="lg:hidden flex flex-col space-y-6 mt-4 pl-6">
        <li className="flex items-center space-x-2">
          <img className="w-8" src={coins} alt="coins" />
          <div className="">
            <div
              className="text-lg text-white"
              style={{ color: 'rgb(255, 152, 0)', fontWeight: 'bold' }}
            >
              ${nFormatter(new BigNumber(liquidityCountUp).dp(2, 1).toString(10), 2)}
            </div>
            <div
              className="text-secondary text-xs"
              style={{ color: 'rgb(255, 152, 0)', fontWeight: 'bold' }}
            >
              Total Value Locked
            </div>
          </div>
        </li>
        <li className="">
          <ConnectWallet action={onClose} />
        </li>
      </ul>
    </Styles>
  );
}

export default Navigation;
