import { useMemo } from 'react';
import { Chains, TheGraphProvider, useCreateSubgraph } from 'thegraph-react';
import SubGraphContext from './contexts/subgraph';

export const SUBGRAPH_DATASOURCE = process.env.REACT_APP_SUBGRAPH_DATASOURCE
  ? process.env.REACT_APP_SUBGRAPH_DATASOURCE
  : process.env.REACT_APP_SUBGRAPH_DATASOURCE;

export const SubGraphProvider = (props) => {
  const subGraphInstance = useCreateSubgraph({
    [Chains.MAINNET]: SUBGRAPH_DATASOURCE, //'https://api.thegraph.com/subgraphs/name/aave/protocol',
  });
  const subgraphs = useMemo(() => {
    return [subGraphInstance];
  }, [subGraphInstance]);
  return (
    <TheGraphProvider chain={Chains.MAINNET} subgraphs={subgraphs}>
      <SubGraphContext.Provider value={subGraphInstance}>{props.children}</SubGraphContext.Provider>
    </TheGraphProvider>
  );
};
