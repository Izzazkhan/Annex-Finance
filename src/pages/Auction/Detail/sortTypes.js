export const sortTypes = {
  up: {
    class: 'sort-up',
    fn: (a, b) => a.blockNumber - b.blockNumber,
  },
  down: {
    class: 'sort-down',
    fn: (a, b) => b.blockNumber - a.blockNumber,
  },
  default: {
    class: 'sort',
    fn: (a, b) => b.blockNumber - a.blockNumber,
  },
  priceUp: {
    class: 'price-sort-up',
    fn: (a, b) => a.price - b.price,
  },
  priceDown: {
    class: 'price-sort-down',
    fn: (a, b) => b.price - a.price,
  },
  priceDefault: {
    class: 'price-sort',
    fn: (a, b) => b.price - a.price,
  },
};
