
import BigNumber from 'bignumber.js';
import { restService } from 'utilities';

const APICall = (auctionStatus, setBatchCount, API) => {
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async () => {
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
    return { data, loading, error }
}

export default APICall