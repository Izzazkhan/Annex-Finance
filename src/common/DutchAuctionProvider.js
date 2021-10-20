import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import DutchAuctionContext from '../contexts/dutchAuction';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useLocation } from 'react-router-dom';

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
  switch (path) {
    case '/auction/past': {
      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_DUTCH_AUCTION_DATASOURCE;
      }
      break;
    }
    case '/auction/live': {
      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_DUTCH_AUCTION_DATASOURCE;
      }
      break;
    }
    default: {
      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_DUTCH_AUCTION_DATASOURCE;
      }
    }
  }
};
export const DutchAuctionProvider = (props) => {
  const location = useLocation();
  const DUTCH_AUCTION_DATASOURCE = getDutchAuctionSource(location.pathname);
  console.log('DUTCH_AUCTION_DATASOURCE **', DUTCH_AUCTION_DATASOURCE);
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
