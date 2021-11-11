import styled from 'styled-components';
import React, { useState } from 'react';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';
import { bindActionCreators } from 'redux';
import { accountActionCreators, connectAccount } from '../../core';
import { CONTRACT_TOKEN_ADDRESS } from '../../utilities/constants';

const Footer = ({ settings }) => {
  const { chainId } = useActiveWeb3React();

  return (
    <div className="flex justify-end items-center space-x-5 mt-12 mb-6">
      {settings.blockNumber ? (
        <a
          target={'_blank'}
          rel={'noreferrer noopener'}
          href={getEtherscanLink(
            chainId,
            settings.blockNumber,
            'block',
          )}
          className="flex flex-row items-center space-x-4 no-underline focus:outline-none"
        >
          <div className="flex w-3 h-3 rounded-full bg-primary" />
          <div className="text-white no-underline focus:outline-none">
            Latest Block: {settings.blockNumber}
          </div>
        </a>
      ) : null}
      <a
        href={getEtherscanLink(
          chainId,
          CONTRACT_TOKEN_ADDRESS[chainId].ann.address,
          'token',
        )}
        target={'_blank'}
        rel={'noreferrer noopener'}
        className="text-white no-underline focus:outline-none"
      >
        ANN
      </a>
      <a
        href="https://t.me/Annex_finance_group"
        className="text-white no-underline focus:outline-none"
        target="_blank"
        rel="noreferrer"
      >
        Support
      </a>
      <a
        href="https://annex.finance/Whitepaper.pdf"
        className="text-white no-underline focus:outline-none"
        target="_blank"
        rel="noreferrer"
      >
        Whitepaper
      </a>
    </div>
  );
};

Footer.defaultProps = {
  settings: {},
};

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

export default connectAccount(mapStateToProps, mapDispatchToProps)(Footer);
