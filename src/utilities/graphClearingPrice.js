import { BigNumber } from '@ethersproject/bignumber';
import toHex from 'to-hex';
const BASE_POINT = BigNumber.from(10).pow(18);
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
    userId: BigNumber.from('0x' + bytes.substring(2, 18)).toHexString(),
    sellAmount: BigNumber.from('0x' + bytes.substring(43, 66)).toHexString(),
    buyAmount: BigNumber.from('0x' + bytes.substring(19, 42)).toHexString(),
  };
}

const order = {
  userId: BigNumber.from(0),
  sellAmount: BigNumber.from('0x98a7d9b8314c0000'),
  buyAmount: BigNumber.from('0xd02ab486cedc0000'),
};

// const orders = [
//   {
//     userId: BigNumber.from(1),
//     buyAmount: ethers.utils.parseEther("2"),
//     sellAmount: ethers.utils.parseEther("18"),
//   },
//   {
//     userId: BigNumber.from(2),
//     buyAmount: ethers.utils.parseEther("3"),
//     sellAmount: ethers.utils.parseEther("8"),
//   },
//   {
//     userId: BigNumber.from(3),
//     buyAmount: ethers.utils.parseEther("5"),
//     sellAmount: ethers.utils.parseEther("35"),
//   },
//   {
//     userId: BigNumber.from(4),
//     buyAmount: ethers.utils.parseEther("4"),
//     sellAmount: ethers.utils.parseEther("24"),
//   },
//   {
//     userId: BigNumber.from(6),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.3"),
//   },
//   {
//     userId: BigNumber.from(7),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.2"),
//   },
//   {
//     userId: BigNumber.from(8),
//     buyAmount: ethers.utils.parseEther("1"),
//     sellAmount: ethers.utils.parseEther("2.1"),
//   },
// ];

function hasLowerClearingPrice(order1, order2) {
  if (order1.buyAmount.mul(order2.sellAmount).lt(order2.buyAmount.mul(order1.sellAmount)))
    return -1;
  if (order1.buyAmount.lt(order2.buyAmount)) return -1;
  if (order1.buyAmount.mul(order2.sellAmount).eq(order2.buyAmount.mul(order1.sellAmount))) {
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
  let totalSellVolume = BigNumber.from(0);

  for (const order of sellOrders) {
    totalSellVolume = totalSellVolume.add(order.sellAmount);
    if (
      totalSellVolume.mul(order.buyAmount).div(order.sellAmount).gte(initialAuctionOrder.sellAmount)
    ) {
      const coveredBuyAmount = initialAuctionOrder.sellAmount.sub(
        totalSellVolume.sub(order.sellAmount).mul(order.buyAmount).div(order.sellAmount),
      );
      const sellAmountClearingOrder = coveredBuyAmount.mul(order.sellAmount).div(order.buyAmount);
      if (sellAmountClearingOrder.gt(BigNumber.from(0))) {
        return order;
      } else {
        return {
          userId: BigNumber.from(0),
          buyAmount: initialAuctionOrder.sellAmount,
          sellAmount: totalSellVolume.sub(order.sellAmount),
        };
      }
    }
  }
  // otherwise, clearing price is initialAuctionOrder
  if (totalSellVolume.gt(initialAuctionOrder.buyAmount)) {
    return {
      userId: BigNumber.from(0),
      buyAmount: initialAuctionOrder.sellAmount,
      sellAmount: totalSellVolume,
    };
  } else {
    return {
      userId: BigNumber.from(0),
      buyAmount: initialAuctionOrder.sellAmount,
      sellAmount: initialAuctionOrder.buyAmount,
    };
  }
}

export function calculateClearingPrice(orders, auctionDecimal, biddingDecimal) {
  orders = getConvertedOrders(orders, auctionDecimal, biddingDecimal);

  const initialOrder = orders[0]
    ? orders[0]
    : {
        userId: BigNumber.from(0),
        sellAmount: BigNumber.from(0),
        buyAmount: BigNumber.from(0),
      };

  const interimOrder = {
    userId: BigNumber.from(0),
    sellAmount: BigNumber.from(0),
    buyAmount: BigNumber.from(0),
  };
  orders.sort(function (a, b) {
    return hasLowerClearingPrice(a, b);
  });

  const clearingPriceOrder = findClearingPrice(orders, initialOrder);
  let numberOfOrdersToClear;
  if (
    interimOrder ===
    {
      userId: BigNumber.from(0),
      sellAmount: BigNumber.from(0),
      buyAmount: BigNumber.from(0),
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
  //   printInDecimals(clearingPriceOrder);
  //   console.log(orders);
  return { orders, clearingPriceOrder: formatedClearingPriceOrder };
}

function getConvertedOrders(orders, auctionDecimal, biddingDecimal) {
  let convertedOrder = [];
  for (let index = 0; index < orders.length; index++) {
    const element = orders[index];
    // let sellAmount = BigNumber.from(element.sellAmount);
    // let buyAmount = BigNumber.from(element.buyAmount);
    // auctionDecimal = BigNumber.from(10).pow(auctionDecimal);
    // biddingDecimal = BigNumber.from(10).pow(biddingDecimal);
    let buyAmount = toHex(element.buyAmount / Number('1e' + auctionDecimal));
    let sellAmount = toHex(element.sellAmount / Number('1e' + biddingDecimal));
    sellAmount = BigNumber.from(sellAmount);
    buyAmount = BigNumber.from(buyAmount);
    convertedOrder.push({
      userId: BigNumber.from(element.userId['id']),
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
    let price = element.sellAmount.toString() / element.buyAmount.toString();
    formatOrders.push({
      userId: element.userId.toString(),
      price,
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
  console.log(order.sellAmount.mul(BASE_POINT).div(order.buyAmount).toBigInt()); // calculating price
}
