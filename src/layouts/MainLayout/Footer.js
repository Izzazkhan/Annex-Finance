import styled from 'styled-components';
import React, { useState } from 'react';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';
import { bindActionCreators } from 'redux';
import { accountActionCreators, connectAccount } from '../../core';
import { CONTRACT_TOKEN_ADDRESS, NETWORK_ID } from '../../utilities/constants';

const Footer = ({ settings }) => {
  //   const { account, chainId, library } = useActiveWeb3React();
  //   const [blockNumber, setBlockNumber] = useState(undefined);

  //   const wrongNetwork = React.useMemo(() => {
  //     return (
  //       (process.env.REACT_APP_ENV === 'prod' && chainId !== 56) ||
  //       (process.env.REACT_APP_ENV === 'dev' && chainId !== 97)
  //     );
  //   }, [chainId]);

  //   React.useEffect(() => {
  //     if (library && account && !wrongNetwork) {
  //       library
  //         .getBlockNumber()
  //         .then((res) => {
  //           setBlockNumber(res);
  //         })
  //         .catch((e) => console.log(e));
  //     }
  //   }, [library, account, wrongNetwork]);

  return (
    <div className="flex justify-end items-center space-x-5 mt-12 mb-6">
      {settings.blockNumber ? (
        <a
          target={'_blank'}
          rel={'noreferrer noopener'}
          href={getEtherscanLink(
            NETWORK_ID,
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
          NETWORK_ID,
          CONTRACT_TOKEN_ADDRESS.ann.address,
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
