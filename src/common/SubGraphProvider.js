import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import SubGraphContext from '../contexts/subgraph';
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

const getSubGraphDataSource = (path) => {
  console.log('pathname', path);
  switch (path) {
    case '/auction/past': {
      return process.env.REACT_APP_SUBGRAPH_DATASOURCE;
    }
    case '/auction/live': {
      return process.env.REACT_APP_SUBGRAPH_DATASOURCE;
    }
    // default: {
    //   return process.env.REACT_APP_SUBGRAPH_DATASOURCE_FOR_TRADE;
    // }
  }
};
export const SubGraphProvider = (props) => {
  const location = useLocation();
  console.log('path', location);
  const SUBGRAPH_DATASOURCE = getSubGraphDataSource(location.pathname);
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
