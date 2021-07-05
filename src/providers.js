import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import getLibrary from './utils/getLibrary';
import { NetworkContextName } from './constants';
import { store } from './core';
import { SubGraphProvider } from './SubGraphProvider';
import APIProvider from './APIProvider';
import React from 'react';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const Providers = (props) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <Router>
            <APIProvider />
            <SubGraphProvider>{props.children}</SubGraphProvider>
          </Router>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

export default Providers;
