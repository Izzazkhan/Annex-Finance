import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import FixedAuctionContext from '../contexts/fixedAuction';
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

const getFixedAuctionSource = (path) => {
  switch (path) {
    case '/auction/past': {
      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_FIXED_AUCTION_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_FIXED_AUCTION_DATASOURCE;
      }
    }
    case '/auction/live': {
      console.log('hello', process.env.REACT_APP_TEST_FIXED_AUCTION_DATASOURCE);

      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_FIXED_AUCTION_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_FIXED_AUCTION_DATASOURCE;
      }
    }
    default: {
      if (process.env.REACT_APP_ENV === 'dev') {
        return process.env.REACT_APP_TEST_FIXED_AUCTION_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_FIXED_AUCTION_DATASOURCE;
      }
    }
  }
};
export const FixedAuctionProvider = (props) => {
  const location = useLocation();
  const FIXED_AUCTION_DATASOURCE = getFixedAuctionSource(location.pathname);
  console.log('FIXED_AUCTION_DATASOURCE **', FIXED_AUCTION_DATASOURCE);
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
