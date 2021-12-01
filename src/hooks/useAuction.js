import { calculateClearingPrice } from '../utilities/graphClearingPrice';
import moment from 'moment';
import BigNumber from 'bignumber.js';

export function useAuction(data, props) {
    console.log('data', data)
    let arr = [];
    data.forEach((element) => {
        let auctionDecimal = (element['auctioningToken']);
        auctionDecimal = JSON.parse(auctionDecimal)
        auctionDecimal = JSON.parse(auctionDecimal.decimals)
        let biddingDecimal = (element['biddingToken']);
        biddingDecimal = JSON.parse(biddingDecimal)
        biddingDecimal = JSON.parse(biddingDecimal.decimals)
        let auctionEndDate = element['auctionEndDate'];
        let clearingPrice = element['clearingPrice'];
        clearingPrice = convertExponentToNum(clearingPrice)
        let initialAuctionOrder = element['initialAuctionOrder'];
        let { orders } = calculateClearingPrice(
            initialAuctionOrder,
            element.orders,
            auctionDecimal,
            biddingDecimal,
            auctionEndDate,
        );
        let minFundingThreshold = convertExponentToNum(
            new BigNumber(element['minFundingThreshold_eth']).dividedBy(1000000).toNumber(),
        );
        let formatedAuctionDate = moment
            .unix(element['auctionEndDate'])
            .format('MM/DD/YYYY HH:mm:ss');
        let graphData = [];
        orders && orders.length
        orders.forEach((item) => {
            graphData.push({
                ...item,
                isSuccessfull: item.price >= new BigNumber(clearingPrice),
                auctionEndDate: auctionEndDate,
            });
        });
        arr.push({
            ...element,
            chartType: 'block',
            data: graphData,
            status: props.auctionStatus === 'live' ? 'Live' : props.auctionStatus === 'past' ? 'Past' : 'Upcoming',
            statusClass: props.auctionStatus === 'live' ? 'live' : props.auctionStatus === 'past' ? 'past' : 'upcoming',
            dateLabel: 'Completion Date',
            formatedAuctionDate,
            minFundingThreshold,
            title: element.type + ' Auction',
        });
    });

    return arr
}

const convertExponentToNum = (x) => {
    if (Math.abs(x) < 1.0) {
        let e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + new Array(e).join('0') + x.toString().substring(2);
        }
    } else {
        let e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += new Array(e + 1).join('0');
        }
    }
    return x;
};