import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/common/Navigation';
import menu from '../../assets/icons/menu.svg';
import RouteMap from '../../routes/RouteMap';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import { getXaiTokenContract, methods } from '../../utilities/ContractService';
import BigNumber from 'bignumber.js';
import { checkIsValidNetwork } from '../../utilities/common';
import { useLocation } from 'react-router-dom';

function Header({ onOpen, title, settings }) {
  const [totalXaiMinted, setTotalXaiMinted] = useState('0');

  // const getTotalXaiMinted = async () => {
  //   // total xai minted
  //   const xaiContract = getXaiTokenContract();
  //   let tvm = await methods.call(xaiContract.methods.totalSupply, []);
  //   tvm = new BigNumber(tvm).div(
  //     new BigNumber(10).pow(Number(process.env.REACT_APP_XAI_DECIMALS) || 18),
  //   );

  //   setTotalXaiMinted(tvm);
  // };

  useEffect(() => {
    // if (checkIsValidNetwork('metamask')) {
    //   getTotalXaiMinted();
    // }
  }, [settings.markets]);

  const [currentTitle, setCurrentTitle] = useState('');
  const { pathname, search } = useLocation();
  const path = `${pathname}${search}`;
  useEffect(() => {
    let currentTitle = '';
    const titles = {
      dashboard: 'Lending',
      vote: 'vote',
      annex: 'annex',
      auction: 'ido',
      market: 'market',
      vault: 'vault',
      swap: 'swap',
      liquidity: 'liquidity',
      farms: 'farms',
      pools: 'pools',
    };
    Object.keys(titles)?.forEach((title) => {
      if (path?.includes(title)) {
        currentTitle = titles[title];
      }
    });
    setCurrentTitle(currentTitle);
  }, [path]);

  return (
    <header
      className="bg-fadeBlack flex justify-between items-center py-6 px-4
                       pl-6 lg:pr-8 rounded-lg w-full"
    >
      <div className="ml-2 flex items-center">
        <div className="w-14 cursor-pointer" onClick={onOpen}>
          <img className="w-full" src={menu} alt="" />
        </div>
        <h2 className="text-white ml-5 text-4xl font-bold uppercase">{title || currentTitle}</h2>
      </div>
      {pathname?.includes(RouteMap.auction) && pathname !== `${RouteMap.auction}/create` ? (
        <Link
          to="/auction/create"
          className="focus:outline-none bg-transparent border border-primary py-2 px-4 rounded-3xl text-white ml-10 w-80 text-center"
        >
          Create an IDO{' '}
        </Link>
      ) : (
        ''
      )}
      <Navigation
        wrapperClassName="hidden lg:block"
        totalLiquidity={settings.totalLiquidity}
      // totalXaiMinted={totalXaiMinted}
      />
    </header>
  );
}

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { setSetting, getGovernanceAnnex } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
      getGovernanceAnnex,
    },
    dispatch,
  );
};

export default connectAccount(mapStateToProps, mapDispatchToProps)(Header);
