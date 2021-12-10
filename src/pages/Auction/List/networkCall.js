
import BigNumber from 'bignumber.js';
import { restService } from 'utilities';

const APICall = async (auctionStatus, setBatchCount, API, setData, setLoading, setError) => {
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    try {
        const response = await restService({
            third_party: true,
            api: API,
            method: 'GET',
            params: {}
        })
        console.log('DataWith API', response)
        if (auctionStatus === 'live') {
            const filteredData = response.data.data.filter(item =>
                new BigNumber(item.auctionEndDate).isGreaterThan(new BigNumber(currentTimeStamp))
                && new BigNumber(item.auctionStartDate).isLessThan(new BigNumber(currentTimeStamp)))
            setBatchCount(filteredData.length)
            setData(filteredData)
        }
        else if (auctionStatus === 'past') {
            const filteredData = response.data.data.filter(item =>
                new BigNumber(item.auctionEndDate).isLessThan(new BigNumber(currentTimeStamp))
                && new BigNumber(item.auctionStartDate).isLessThan(new BigNumber(currentTimeStamp)))
            setBatchCount(filteredData.length)
            setData(filteredData)
        }
        else {
            const filteredData = response.data.data.filter(item =>
                new BigNumber(item.auctionEndDate).isGreaterThan(new BigNumber(currentTimeStamp))
                && new BigNumber(item.auctionStartDate).isGreaterThan(new BigNumber(currentTimeStamp)))
            setBatchCount(filteredData.length)
            setData(filteredData)
        }
        setLoading(false)
    } catch (error) {
        setError('Error while loading data')
        setLoading(false)
    }
}

export default APICall