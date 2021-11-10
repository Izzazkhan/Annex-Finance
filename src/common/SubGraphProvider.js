import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import SubGraphContext from '../contexts/subgraph';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useActiveWeb3React } from "../hooks";

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

const getSubGraphDataSource = (path, chainId) => {
  switch (path) {
    case '/auction/past': {
      if (chainId === 97) {
        return process.env.REACT_APP_TEST_SUBGRAPH_DATASOURCE;
      } else if (chainId === 56) {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      }
    }
    case '/auction/live': {
      if (chainId === 97) {
        return process.env.REACT_APP_TEST_SUBGRAPH_DATASOURCE;
      } else if (chainId === 56) {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      }
    }
    default: {
      if (chainId === 97) {
        return process.env.REACT_APP_TEST_SUBGRAPH_DATASOURCE;
      } else if (chainId === 56) {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      } else {
        return process.env.REACT_APP_MAIN_SUBGRAPH_DATASOURCE;
      }
    }
  }
};
export const SubGraphProvider = (props) => {
  const { chainId } = useActiveWeb3React();
  const location = useLocation();
  const SUBGRAPH_DATASOURCE = getSubGraphDataSource(location.pathname, chainId);
  const subGraphInstance = useCreateSubgraph({
    [Chains.MAINNET]: SUBGRAPH_DATASOURCE,
  });
  const subgraphs = useMemo(() => {
    return [subGraphInstance];
  }, [subGraphInstance]);
  const apolloClient = new ApolloClient({
    uri: SUBGRAPH_DATASOURCE,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
  return (
    <TheGraphProvider chain={Chains.MAINNET} subgraphs={subgraphs}>
      <SubGraphContext.Provider value={{ subGraphInstance, apolloClient }}>
        {props.children}
      </SubGraphContext.Provider>
    </TheGraphProvider>
  );
};
