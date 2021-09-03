import React, { useEffect, useState } from 'react';
import coins from '../../assets/icons/coins.svg';
import MiniLogo from '../../components/UI/MiniLogo';
import ConnectWalletModal from './ConnectWalletModal';
import { useActiveWeb3React } from '../../hooks';
import { shortenAddress } from '../../utils/address';
import commaNumber from 'comma-number';
import BigNumber from 'bignumber.js';
import { nFormatter } from '../../utils/data';
import { useCountUp } from 'react-countup';
import HeaderLogo from '../../assets/icons/headerLogo.svg';

const format = commaNumber.bindWith(',', '.');

function Navigation({ wrapperClassName, isOpen, totalLiquidity, onClose }) {
  const { account } = useActiveWeb3React();
  const [connectWalletsOpen, setConnectWalletsOpen] = useState(false);

  const { countUp: mintedCountUp, update: mintedUpdate } = useCountUp({ end: 0 });
  const { countUp: liquidityCountUp, update: liquidityUpdate } = useCountUp({ end: 0 });

  useEffect(() => {
    liquidityUpdate(Number(totalLiquidity));
  }, [totalLiquidity]);

  console.log('totalLiquidity', totalLiquidity);

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

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <ConnectWalletModal
        open={connectWalletsOpen}
        onSetOpen={() => setConnectWalletsOpen(true)}
        onCloseModal={() => setConnectWalletsOpen(false)}
      />
      {!isOpen && (
        <ul className="hidden lg:flex justify-between items-center w-full max-w-450 ml-auto">
          <li className="flex items-center space-x-2">
            <img src={coins} alt="coins" />
            <div className="">
              <div className="text-2xl text-white text-left">
                ${nFormatter(new BigNumber(liquidityCountUp).dp(2, 1).toString(10), 2)}
              </div>
              <div className="text-secondary text-sm">Total Value Locked</div>
            </div>
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
            <div className="text-lg text-white">
              ${nFormatter(new BigNumber(liquidityCountUp).dp(2, 1).toString(10), 2)}
            </div>
            <div className="text-secondary text-xs">Total Value Locked</div>
          </div>
        </li>
        <li className="">
          <ConnectWallet action={onClose} />
        </li>
      </ul>
    </div>
  );
}

export default Navigation;
