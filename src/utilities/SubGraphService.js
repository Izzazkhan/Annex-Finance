import { useContext } from 'react';
import { gql } from '@apollo/client';
import subGraphContext from '../contexts/subgraph';
import { useSubgraph } from 'thegraph-react';

export const executeQuery = (query) => {
  const subGraphInstance = useContext(subGraphContext);
  const { useQuery } = useSubgraph(subGraphInstance);
  const { error, loading, data } = useQuery(gql`
    {
      uniswapFactories(first: 5) {
        id
        pairCount
        totalVolumeUSD
        totalVolumeETH
      }
      tokens(first: 5) {
        id
        symbol
        name
        decimals
      }
    }
  `);
  return { error, loading, data };
};
