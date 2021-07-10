import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import {Provider} from "react-redux";

import getLibrary from './utils/getLibrary';
import { NetworkContextName } from "./constants";
import {store} from "./core";
import APIProvider from "./APIProvider";
import React from "react";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const Providers = props => {
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ProviderNetwork getLibrary={getLibrary}>
				<Provider store={store}>
					<APIProvider/>
					{props.children}
				</Provider>
			</Web3ProviderNetwork>
		</Web3ReactProvider>
	)
}

export default Providers;
