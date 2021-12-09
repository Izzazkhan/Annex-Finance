import { calculateClearingPrice } from '../utilities/graphClearingPrice';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { convertExponentToNum } from '../utilities/convertExponentToNum'

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
