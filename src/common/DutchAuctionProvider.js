import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import DutchAuctionContext from '../contexts/dutchAuction';
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

const getDutchAuctionSource = (path) => {

  const { account, chainId } = useActiveWeb3React();

  switch (path) {
    case '/auction/past': {
      return constants.DUTCH_AUCTION_DATASOURCE[chainId];
    }
    case '/auction/live': {
      return constants.DUTCH_AUCTION_DATASOURCE[chainId];
    }
    default: {
      return constants.DUTCH_AUCTION_DATASOURCE[chainId];
    }
  }
};
export const DutchAuctionProvider = (props) => {
  const location = useLocation();
  const DUTCH_AUCTION_DATASOURCE = getDutchAuctionSource(location.pathname);
  const dutchAuctionInstance = useCreateSubgraph({
    [Chains.MAINNET]: DUTCH_AUCTION_DATASOURCE,
  });
  const dutchAuction = useMemo(() => {
    return [dutchAuctionInstance];
  }, [dutchAuctionInstance]);
  const apolloClient = new ApolloClient({
    uri: DUTCH_AUCTION_DATASOURCE,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return (
    <TheGraphProvider chain={Chains.MAINNET} subgraphs={dutchAuction}>
      <DutchAuctionContext.Provider value={{ dutchAuctionInstance, apolloClient }}>
        {props.children}
      </DutchAuctionContext.Provider>
    </TheGraphProvider>
  );
};
