import {withRouter} from "react-router-dom";
import {compose} from "redux";
import commaNumber from "comma-number";
import {useEffect, useState} from "react";
import moment from "moment";
import BigNumber from "bignumber.js";

import arrowUp from '../../../assets/icons/arrowUp.svg';
import arrowDown from '../../../assets/icons/arrowDown.png';

const format = commaNumber.bindWith(',', '.');

const Transactions = ({ address, transactions }) => {
    const [data, setData] = useState([]);
    const getDate = timestamp => {
        const startDate = moment(timestamp * 1000);
        const curDate = moment(new Date());
        const duration = moment.duration(curDate.diff(startDate));

        const days = Math.floor(duration.asDays());
        const hours = Math.floor(duration.asHours()) - days * 24;
        return `${days} days${hours ? `, ${hours}hrs` : ''} ago`;
    };

    useEffect(() => {
        const tempData = [];
        transactions.forEach(tx => {
            if (tx.type === 'vote') {
                tempData.push({
                    action: tx.support ? 'Received Votes' : 'Lost Votes',
                    age: getDate(tx.blockTimestamp),
                    result: format(
                        new BigNumber(tx.votes)
                            .div(new BigNumber(10).pow(18))
                            .dp(4, 1)
                            .toString(10)
                    ),
                    isReceived: tx.support
                });
            } else {
                tempData.push({
                    action:
                        tx.to.toLowerCase() === address.toLowerCase()
                            ? 'Received ANN'
                            : 'Sent ANN',
                    age: getDate(tx.blockTimestamp),
                    result: format(
                        new BigNumber(tx.amount)
                            .div(new BigNumber(10).pow(18))
                            .dp(4, 1)
                            .toString(10)
                    ),
                    isReceived: tx.to.toLowerCase() === address.toLowerCase()
                });
            }
        });
        setData([...tempData]);
    }, [transactions, address]);

    const handleLink = () => {
        window.open(
            `${process.env.REACT_APP_BSC_EXPLORER}/address/${address}`,
            '_blank'
        );
    };

    return (
        <div className="col-span-5 bg-fadeBlack pt-8 pb-8 px-6 rounded-2xl">
            <div className="text-primary text-xl">Transactions</div>
            <div
                className="flex justify-between
                          border-b border-solid border-darkBlue2 py-2 mt-4"
            >
                <div className="text-gray text-xl">Action</div>
                <div className="text-gray text-xl">Age</div>
                <div className="text-gray text-xl">Result</div>
            </div>
            {data.length === 0 && (
                <div className="flex items-center justify-center font-medium text-lg text-white py-8">
                    No Transactions
                </div>
            )}
            {data &&
                data.map((item, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-solid border-darkBlue2 py-4">
                    <div className="justify-self-start text-white text-xl text-center">
                        {item.action}
                    </div>
                    <div className="text-white text-xl text-center">{item.age}</div>
                    <div className="justify-self-end flex space-x-10">.
                        {item.isReceived ? (
                            <img src={arrowUp} alt="" />
                        ) : (
                            <img src={arrowDown} alt="" />
                        )}
                        <div className="text-white text-xl pr-4">{item.result}</div>
                    </div>
                </div>
            ))}
            {data.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        className="focus:outline-none bg-primary text-black text-xl py-2 px-14 rounded"
                        onClick={handleLink}
                    >
                        View More
                    </button>
                </div>
            )}
        </div>
    )
}

export default compose(withRouter)(Transactions);
