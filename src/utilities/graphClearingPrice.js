// import { BigNumber } from '@ethersproject/bignumber';
import { BigNumber } from 'bignumber.js';
import toHex from 'to-hex';
const BASE_POINT = new BigNumber(10).pow(18);
// encoding

function encodeOrder(order) {
  return (
    '0x' +
    order.userId.toHexString().slice(2).padStart(16, '0') +
    order.buyAmount.toHexString().slice(2).padStart(24, '0') +
    order.sellAmount.toHexString().slice(2).padStart(24, '0')
  );
}

function decodeOrder(bytes) {
  return {
    userId: new BigNumber('0x' + bytes.substring(2, 18)).toHexString(),
    sellAmount: new BigNumber('0x' + bytes.substring(43, 66)).toHexString(),
    buyAmount: new BigNumber('0x' + bytes.substring(19, 42)).toHexString(),
  };
}

const order = {
  userId: new BigNumber(0),
  sellAmount: new BigNumber('0x98a7d9b8314c0000'),
  buyAmount: new BigNumber('0xd02ab486cedc0000'),
};

// const orders = [
//   {
//     userId: new BigNumber(1),
//     buyAmount: ethers.utils.parseEther("2"),
//     sellAmount: ethers.utils.parseEther("18"),
//   },
//   {
//     userId: new BigNumber(2),
//     buyAmount: ethers.utils.parseEther("3"),
//     sellAmount: ethers.utils.parseEther("8"),
//   },
//   {
//     userId: new BigNumber(3),
//     buyAmount: ethers.utils.parseEther("5"),
//     sellAmount: ethers.utils.parseEther("35"),
//   },
//   {
//     userId: new BigNumber(4),
//     buyAmount: ethers.utils.parseEther("4"),
//     sellAmount: ethers.utils.parseEther("24"),
//   },
//   {
//     userId: new BigNumber(6),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.3"),
//   },
//   {
//     userId: new BigNumber(7),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.2"),
//   },
//   {
//     userId: new BigNumber(8),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.1"),
//   },
// ];

function hasLowerClearingPrice(order1, order2) {
  if (
    order1.buyAmount
      .multipliedBy(order2.sellAmount)
      .lt(order2.buyAmount.multipliedBy(order1.sellAmount))
  )
    return -1;
  if (order1.buyAmount.lt(order2.buyAmount)) return -1;
  if (
    order1.buyAmount
      .multipliedBy(order2.sellAmount)
      .eq(order2.buyAmount.multipliedBy(order1.sellAmount))
  ) {
    if (order1.userId < order2.userId) return -1;
  }
  return 1;
}

function findClearingPrice(sellOrders, initialAuctionOrder) {
  sellOrders.forEach(function (order, index) {
    if (index > 1) {
      if (!hasLowerClearingPrice(sellOrders[index - 1], order)) {
        throw Error('The orders must be sorted');
      }
    }
  });
  let totalSellVolume = new BigNumber(0);

  for (const order of sellOrders) {
    totalSellVolume = totalSellVolume.plus(order.sellAmount);
    if (
      totalSellVolume
        .multipliedBy(order.buyAmount)
        .div(order.sellAmount)
        .gte(initialAuctionOrder.sellAmount)
    ) {
      const coveredBuyAmount = initialAuctionOrder.sellAmount.minus(
        totalSellVolume.minus(order.sellAmount).multipliedBy(order.buyAmount).div(order.sellAmount),
      );
      const sellAmountClearingOrder = coveredBuyAmount
        .multipliedBy(order.sellAmount)
        .div(order.buyAmount);
      if (sellAmountClearingOrder.gt(new BigNumber(0))) {
        return order;
      } else {
        return {
          userId: new BigNumber(0),
          buyAmount: initialAuctionOrder.sellAmount,
          sellAmount: totalSellVolume.minus(order.sellAmount),
        };
      }
    }
  }
  // otherwise, clearing price is initialAuctionOrder
  if (totalSellVolume.gt(initialAuctionOrder.buyAmount)) {
    return {
      userId: new BigNumber(0),
      buyAmount: initialAuctionOrder.sellAmount,
      sellAmount: totalSellVolume,
    };
  } else {
    return {
      userId: new BigNumber(0),
      buyAmount: initialAuctionOrder.sellAmount,
      sellAmount: initialAuctionOrder.buyAmount,
    };
  }
}

export function calculateClearingPrice(orders, auctionDecimal, biddingDecimal) {
  orders = getConvertedOrders(orders, auctionDecimal, biddingDecimal);
  console.log('order converted');
  const initialOrder = orders[0]
    ? orders[0]
    : {
        userId: new BigNumber(0),
        sellAmount: new BigNumber(0),
        buyAmount: new BigNumber(0),
      };

  const interimOrder = {
    userId: new BigNumber(0),
    sellAmount: new BigNumber(0),
    buyAmount: new BigNumber(0),
  };
  orders.sort(function (a, b) {
    return hasLowerClearingPrice(a, b);
  });

  const clearingPriceOrder = findClearingPrice(orders, initialOrder);
  let numberOfOrdersToClear;
  if (
    interimOrder ===
    {
      userId: new BigNumber(0),
      sellAmount: new BigNumber(0),
      buyAmount: new BigNumber(0),
    }
  ) {
    numberOfOrdersToClear = orders.filter((order) =>
      hasLowerClearingPrice(order, clearingPriceOrder),
    ).length;
  } else {
    numberOfOrdersToClear = orders.filter(
      (order) =>
        hasLowerClearingPrice(order, clearingPriceOrder) &&
        hasLowerClearingPrice(interimOrder, order),
    ).length;
  }
  orders = formatOrders(orders);
  let formatedClearingPriceOrder = formatClearingPrice(clearingPriceOrder);
  orders = orders.sort(function (a, b) {
    return a.price - b.price;
  });
  //   printInDecimals(clearingPriceOrder);
  //   console.log(orders);
  return { orders, clearingPriceOrder: formatedClearingPriceOrder };
}

function getConvertedOrders(orders, auctionDecimal, biddingDecimal) {
  let convertedOrder = [];
  for (let index = 0; index < orders.length; index++) {
    const element = orders[index];
    // let buyAmount = toHex(element.buyAmount / Number('1e' + auctionDecimal));
    // let sellAmount = toHex(element.sellAmount / Number('1e' + biddingDecimal));
    // console.log('Buy AMount', buyAmount);
    // console.log(
    //   'Sell AMount',
    //   sellAmount,
    //   toHex(element.sellAmount / Number('1e' + biddingDecimal)),
    // );
    let sellAmount = new BigNumber(element.sellAmount / Number('1e' + biddingDecimal));
    let buyAmount = new BigNumber(element.buyAmount / Number('1e' + auctionDecimal));
    convertedOrder.push({
      userId: new BigNumber(element.userId['id']),
      sellAmount,
      buyAmount,
    });
  }
  return convertedOrder;
}
// calculateClearingPrice(orders);
function formatOrders(orders) {
  let formatOrders = [];
  for (let index = 0; index < orders.length; index++) {
    const element = orders[index];
    let sellAmount = element.sellAmount.toString();
    let buyAmount = element.buyAmount.toString();
    let price = sellAmount / buyAmount;
    formatOrders.push({
      userId: element.userId.toString(),
      price,
      sellAmount,
      buyAmount,
    });
  }
  return formatOrders;
}
function formatClearingPrice(order) {
  let price = order.sellAmount.toString() / order.buyAmount.toString();
  return {
    userId: order.userId.toString(),
    price,
  };
}
function printInDecimals(order) {
  console.log(order.userId.toBigInt());
  console.log(order.sellAmount.toBigInt());
  console.log(order.buyAmount.toBigInt());
  console.log(order.sellAmount.multipliedBy(BASE_POINT).div(order.buyAmount).toBigInt()); // calculating price
}
