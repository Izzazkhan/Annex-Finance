import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import FixedAuctionContext from '../contexts/fixedAuction';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useActiveWeb3React } from '../hooks';
import * as constants from '../utilities/constants';

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const getFixedAuctionSource = (path) => {

  const { account, chainId } = useActiveWeb3React();

  switch (path) {
    case '/auction/past': {
      return constants.FIXED_AUCTION_DATASOURCE[chainId];
    }
    case '/auction/live': {
      return constants.FIXED_AUCTION_DATASOURCE[chainId];
    }
    default: {
      return constants.FIXED_AUCTION_DATASOURCE[chainId];
    }
  }
};
export const FixedAuctionProvider = (props) => {
  const location = useLocation();
  const FIXED_AUCTION_DATASOURCE = getFixedAuctionSource(location.pathname);
  const fixedAuctionInstance = useCreateSubgraph({
    [Chains.MAINNET]: FIXED_AUCTION_DATASOURCE,
  });
  const fixedAuction = useMemo(() => {
    return [fixedAuctionInstance];
  }, [fixedAuctionInstance]);
  const apolloClient = new ApolloClient({
    uri: FIXED_AUCTION_DATASOURCE,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return (
    <TheGraphProvider chain={Chains.MAINNET} subgraphs={fixedAuction}>
      <FixedAuctionContext.Provider value={{ fixedAuctionInstance, apolloClient }}>
        {props.children}
      </FixedAuctionContext.Provider>
    </TheGraphProvider>
  );
};
