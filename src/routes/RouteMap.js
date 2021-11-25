export default {
  dashboard: '/dashboard',
  annex: '/annex',
  farms: '/farms',
  market: {
    index: '/market',
    marketDetails: '/market/:asset',
  },
  pools: '/pools',
  games: '/games',
  trade: '/trade',
  vault: '/vault',
  auction: '/auction',
  vote: {
    index: '/vote',
    allProposals: '/vote/all',
    voteOverview: `/vote/proposal/:id`,
    proposerOverview: '/vote/address/:address',
    leaderboard: '/vote/leaderboard',
  },
  faucet: '/faucet',
  newAuction: '/newAuction',
};
