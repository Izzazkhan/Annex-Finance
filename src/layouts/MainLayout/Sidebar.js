import React, { useEffect, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import * as constants from "../../utilities/constants";
import underscore from '../../assets/icons/underscore.svg';
import filledArrow from '../../assets/icons/filledArrow.svg';
import logo from '../../assets/icons/logo.svg';
import Navigation from '../../components/common/Navigation';
import RouteMap from '../../routes/RouteMap';
import { methods } from '../../utilities/ContractService';
import { addToken, getBigNumber, checkIsValidNetwork } from '../../utilities/common';
import { accountActionCreators, connectAccount } from '../../core';
import { bindActionCreators } from 'redux';
import { useCurrency } from '../../hooks/Tokens';
import { useTradeExactIn, useTradeExactOut } from '../../hooks/Trades';
import { tryParseAmount } from '../../core/modules/swap/hooks';

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
import plusButtonIcon from '../../assets/icons/plusButonIcon.svg';

const Wrapper = styled.aside`
  @media (min-width: 1024px) {
    min-width: 244px;
  }

  .certik-container {
    // position: fixed;
    display: flex;
    height: 45px;
    margin-bottom: 10px;
    margin-top: 10px;
    right: calc(50% - 111px);
    background: linear-gradient(#2e2e2e, #2e2e2e) padding-box,
      radial-gradient(
        99.67% 1137.19% at -5.59% 88.89%,
        #ff9d2d 0%,
        rgb(253 195 81) 34.07%,
        rgb(249 183 67) 55.73%,
        rgb(245 164 45) 76.44%,
        #f19920 100%
      )
      border-box;
    border: solid 3px transparent;
    border-radius: 16px;
    align-items: center;
    padding: 10px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
    pointer-events: none;
    @media (max-width: 1023px) {
      padding: 10px;
      right: calc(50% - 85px);
    }
    @media (max-width: 575px) {
      height: 45px;
      right: calc(50% - 75px);
    }
    &.visible {
      opacity: 1;
      pointer-events: auto;
    }
    &.large {
      & > .pending {
        position: absolute;
        left: -15px;
        top: -15px;
      }
      & > .txt {
        margin: 0 5px 0 5px;
        color: #5c6d78;
        font-size: 12px;
        white-space: nowrap;
        @media (max-width: 1023px) {
          margin: 0 5px 0 5px;
          font-size: 12px;
        }
        @media (max-width: 575px) {
          font-size: 10px;
        }
      }
      & > .logo {
        width: 65px;
        margin-right: 10px;
        @media (max-width: 1023px) {
          width: 60px;
          margin-right: 5px;
        }
        @media (max-width: 575px) {
          width: 60px;
        }
      }
      & > .skynet {
        width: 20px;
        height: 20px;
      }
      & > .pulsing-circle {
        position: relative;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #ffad4f;
        @media (max-width: 575px) {
          width: 5px;
          height: 5px;
        }
        &::before {
          content: '';
          position: absolute;
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ff9800;
          animation: pulsing-circle 1s ease infinite;
          left: 0;
          top: 0;
        }
      }
    }
  }
  @keyframes pulsing-circle {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  .margin-bottom-20 {
    margin-bottom: 20px;
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
  {
    key: 4,
    icon: (fill) => <MarketIcon fill={fill} />,
    title: 'Market',
    href: RouteMap.market.index,
  },
  {
    key: 5,
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
  { key: 6, icon: (fill) => <FarmsIcon fill={fill} />, title: 'Farms', href: RouteMap.farms },
  // eslint-disable-next-line react/display-name
  { key: 7, icon: (fill) => <PoolsIcon fill={fill} />, title: 'Pools', href: RouteMap.pools },
  {
    key: 8,
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
  // const [totalXaiMinted, setTotalXaiMinted] = useState('0');
  const [activeMenu, updateActiveMenu] = useState('');
  const history = useHistory();

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
    // if (checkIsValidNetwork('metamask')) {
    //   getTotalXaiMinted();
    // }
  }, [settings.markets]);
  const toggleDropdown = (val) => {
    updateActiveMenu(val !== activeMenu ? val : '');
  };

  function fetchANNCurrentPrice() {
    const inputCurrency = useCurrency(constants.CONTRACT_TOKEN_ADDRESS['ann'].address);
    const outputCurrency = useCurrency(constants.CONTRACT_TOKEN_ADDRESS['busd'].address);
    const isExactIn = true;
    const parsedAmount = tryParseAmount('1', isExactIn ? inputCurrency : outputCurrency);

    const bestTradeExactIn = useTradeExactIn(
      isExactIn ? parsedAmount : undefined,
      outputCurrency || undefined,
    );

    const bestTradeExactOut = useTradeExactOut(
      inputCurrency || undefined,
      !isExactIn ? parsedAmount : undefined,
    );

    const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

    return v2Trade?.executionPrice.toSignificant(6);
  }

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
          wrapperClassName="pt-10"
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
          // totalXaiMinted={totalXaiMinted}
        />
        <div className="mt-auto mb-10 pl-8 pr-8">
          <div className="font-bold text-white margin-bottom-20">{`ANN Price: ${fetchANNCurrentPrice()}`}</div>
          <div className="flex space-x-6 text-white">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => addToken('ann', settings.decimals['ann']?.token, 'token')}
            >
              <span>ANN</span>
              <img
                src={plusButtonIcon}
                alt="plusButtonIcon"
                className="ml-2 inline cursor-pointer"
              />
            </div>
            <div
              className="flex items-center font-medium cursor-pointer"
              onClick={() => addToken('ann', settings.decimals['ann']?.atoken, 'atoken')}
            >
              To Metamask
            </div>
          </div>
          <a
            className="certik-container large visible"
            href="https://www.certik.org/projects/annex"
            target="_blank"
            rel="noreferrer"
          >
            <img className="logo" src="/images/certik-full.svg" alt="" />
            <img className="check" src="/images/check-primary.svg" alt="" />
            <span className="txt">Skynet</span>
            <div className="pulsing-circle"></div>
          </a>
          <div className="font-bold text-white">Annex Finance</div>
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
