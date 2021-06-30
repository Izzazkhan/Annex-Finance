import React, { useEffect, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import dashboard from '../../assets/icons/dashboard.svg';
import vote from '../../assets/icons/vote.svg';
import annex from '../../assets/icons/annex.svg';
import market from '../../assets/icons/market.svg';
import vault from '../../assets/icons/vault.svg';
import trade from '../../assets/icons/trade.svg';
import farms from '../../assets/icons/farms.svg';
import pools from '../../assets/icons/pools.svg';
import underscore from '../../assets/icons/underscore.svg';
import filledArrow from '../../assets/icons/filledArrow.svg';
import logo from '../../assets/icons/logo.svg';
import Navigation from '../../components/common/Navigation';
import RouteMap from '../../routes/RouteMap';
import { getXaiTokenContract, methods } from '../../utilities/ContractService';
import BigNumber from 'bignumber.js';
import { checkIsValidNetwork } from '../../utilities/common';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import {
  AnnexIcon,
  DashboardIcon,
  FarmsIcon,
  MarketIcon,
  PoolsIcon,
  TradeIcon,
  VaultIcon,
  VoteIcon,
  Auction,
} from '../../components/common/Icons';

const Wrapper = styled.aside`
  @media (min-width: 1024px) {
    min-width: 244px;
  }
`;

const Logo = styled.img`
  width: 160px;
  height: 40px;
`;

const sidebarItems = [
  {
    key: 1,

    // eslint-disable-next-line react/display-name
    icon: (fill) => <DashboardIcon fill={fill} />,
    title: 'Lending',
    href: RouteMap.dashboard,
  },
  // eslint-disable-next-line react/display-name
  { key: 2, icon: (fill) => <VoteIcon fill={fill} />, title: 'Vote', href: RouteMap.vote.index },
  // eslint-disable-next-line react/display-name
  { key: 3, icon: (fill) => <AnnexIcon fill={fill} />, title: 'Annex', href: RouteMap.annex },
  // eslint-disable-next-line react/display-name
  { key: 4, icon: (fill) => <MarketIcon fill={fill} />, title: 'Market', href: RouteMap.market },
  // eslint-disable-next-line react/display-name
  { key: 5, icon: (fill) => <VaultIcon fill={fill} />, title: 'Vault', href: RouteMap.vault },
  {
    key: 6,
    // eslint-disable-next-line react/display-name
    icon: (fill) => <TradeIcon fill={fill} />,
    title: 'Trade',
    href: `${RouteMap.trade}`,
    subCats: [
      { key: 1, icon: underscore, title: 'Swap', href: `${RouteMap.trade}/swap` },
      { key: 2, icon: underscore, title: 'Liquidity', href: `${RouteMap.trade}/liquidity` },
    ],
  },
  // eslint-disable-next-line react/display-name
  { key: 7, icon: (fill) => <FarmsIcon fill={fill} />, title: 'Farms', href: RouteMap.farms },
  // eslint-disable-next-line react/display-name
  { key: 8, icon: (fill) => <PoolsIcon fill={fill} />, title: 'Pools', href: RouteMap.pools },
  {
    key: 9,
    // eslint-disable-next-line react/display-name
    icon: (fill) => <Auction fill={fill} />,
    title: 'Auction',
    href: `${RouteMap.auction}`,
    subCats: [
      { key: 1, icon: underscore, title: 'Live', href: `${RouteMap.auction}/live` },
      { key: 2, icon: underscore, title: 'Upcoming', href: `${RouteMap.auction}/upcoming` },
      { key: 3, icon: underscore, title: 'Past', href: `${RouteMap.auction}/past` },
    ],
  },
];

const primaryColor = '#FF9800';

const NavItems = ({
  wrapperClassName,
  items,
  pathname,
  search,
  history,
  activeMenu,
  toggleDropdown,
}) => (
  <div className={wrapperClassName}>
    <div className="flex flex-col space-y-4 text-white">
      {items?.map((i) => (
        <div key={i.key}>
          <div
            className={`sidebar-item gap-x-4 items-center cursor-pointer
                       py-2 pl-8 pr-6 rounded-3xl 2xl:pl-12 2xl:pr-20 ${
                         pathname?.includes(i?.href) ? 'bg-black' : ''
                       }`}
            onClick={() => {
              if (i.href) {
                history.push(i.href);
              }
            }}
          >
            <div className="flex items-center" onClick={() => toggleDropdown(i.title)}>
              <div className="w-10">{i.icon(i.href === pathname ? primaryColor : '')}</div>
              <div className="text-23">{i.title}</div>
            </div>
            {i.subCats && (
              <img
                className={activeMenu === i.title ? 'transform rotate-90' : ''}
                src={filledArrow}
                alt={i.title}
              />
            )}
          </div>
          {activeMenu === i.title && (
            <div
              className={`bg-blue-500 overflow-hidden pl-6 2xl:pl-10 transform transition-all duration-300 ease-in-out`}
            >
              {i.subCats?.map((cat) => (
                <div
                  className="flex items-center space-x-4 ml-12 mb-2 mt-4 cursor-pointer"
                  key={cat.key}
                  onClick={() => {
                    history.push(cat.href);
                  }}
                >
                  <img src={cat.icon} alt={cat.title} />
                  <div
                    className={
                      `${pathname}${search}`?.includes(cat?.href)
                        ? 'text-primary text-23'
                        : 'text-23'
                    }
                  >
                    {cat.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

function Sidebar({ isOpen, onClose, settings }) {
  const { pathname, search } = useLocation();
  const [totalXaiMinted, setTotalXaiMinted] = useState('0');
  const [activeMenu, updateActiveMenu] = useState('');
  const history = useHistory();

  const getTotalXaiMinted = async () => {
    // total xai minted
    const xaiContract = getXaiTokenContract();
    let tvm = await methods.call(xaiContract.methods.totalSupply, []);
    tvm = new BigNumber(tvm).div(
      new BigNumber(10).pow(Number(process.env.REACT_APP_XAI_DECIMALS) || 18),
    );

    setTotalXaiMinted(tvm);
  };

  useEffect(() => {
    let menuIndex = sidebarItems.findIndex((x) => pathname.includes(x.href));
    if (menuIndex !== -1) {
      let title = sidebarItems[menuIndex].title;
      if (activeMenu !== title) {
        updateActiveMenu(title);
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  useEffect(() => {
    if (checkIsValidNetwork('metamask')) {
      getTotalXaiMinted();
    }
  }, [settings.markets]);
  const toggleDropdown = (val) => {
    updateActiveMenu(val !== activeMenu ? val : '');
  };
  return (
    <>
      <Wrapper
        className={`bg-sidebar pt-6 px-2 fixed h-full overflow-auto flex flex-col
                   transform ease-in-out transition-all duration-300 z-30 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-center items-center mt-14 cursor-pointer" onClick={onClose}>
          <Logo src={logo} alt="Annex" />
        </div>
        <NavItems
          items={sidebarItems}
          wrapperClassName="pt-10 pb-5"
          search={search}
          history={history}
          pathname={pathname}
          activeMenu={activeMenu}
          toggleDropdown={toggleDropdown}
        />
        <Navigation
          isOpen={isOpen}
          wrapperClassName="block xl:hidden"
          onClose={onClose}
          totalLiquidity={settings.totalLiquidity}
          totalXaiMinted={totalXaiMinted}
        />
        <div className="mt-auto mb-10 pl-8">
          <div className="font-bold text-white">Annex Trading</div>
          <div className="text-gray text-sm">© 2021 All Rights Reserved</div>
        </div>
      </Wrapper>
    </>
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

export default connectAccount(mapStateToProps, mapDispatchToProps)(Sidebar);
