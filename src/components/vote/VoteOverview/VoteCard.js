import {withRouter} from "react-router-dom";
import {compose} from "redux";
import commaNumber from "comma-number";
import {useEffect, useState} from "react";
import BigNumber from "bignumber.js";
import RouteMap from "../../../routes/RouteMap";
import Web3 from "web3";

const format = commaNumber.bindWith(',', '.');

const VoteCard = ({
    history,
    label,
    forNumber,
    againstNumber,
    type,
    addressNumber,
    emptyNumber,
    list,
    onViewAll
}) => {
    const [isViewAll, setIsViewAll] = useState(true);
    const [forPercent, setForPercent] = useState(0);
    const [againstPercent, setAgainstPercent] = useState(0);

    useEffect(() => {
        const total = new BigNumber(forNumber).plus(new BigNumber(againstNumber));
        setForPercent(
            new BigNumber(forNumber * 100).div(total).isNaN()
                ? '0'
                : new BigNumber(forNumber * 100).div(total).toString(10)
        );
        setAgainstPercent(
            new BigNumber(againstNumber * 100).div(total).isNaN()
                ? '0'
                : new BigNumber(againstNumber * 100).div(total).toString(10)
        );
    }, [forNumber, againstNumber]);

    const handleAddLink = v => {
        history.push(RouteMap.vote.proposerOverview?.replace(':address', v));
    };

    const emptyList = [];
    if (emptyNumber > 0) {
        for (let i = 0; i < emptyNumber; i += 1) {
            emptyList.push(i);
        }
    }

    return (
        <div className="bg-fadeBlack py-4 px-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-solid border-primary py-4">
                <div className="text-white text-36">{label}</div>
                <div className="text-white text-xl">
                    {format(
                        new BigNumber(
                            Web3.utils.fromWei(
                                type === 'agree' ? forNumber : againstNumber,
                                'ether'
                            )
                        )
                            .dp(8, 1)
                            .toString(10)
                    )}
                </div>
            </div>
            <div className="flex justify-between border-b border-solid border-lightGray py-2 mt-12">
                <div className="text-gray text-xl">{addressNumber} addresses</div>
                <div className="text-gray text-xl">Vote</div>
            </div>
            {list.map((l, index) => (
                <div
                    key={index}
                    className="flex justify-between cursor-pointer
                         border-b border-solid border-lightGray  py-2"
                    onClick={() => handleAddLink(l.label)}
                >
                    <div className="text-white text-xl">
                        {l.label
                            ? `${l.label.substr(0, 5)}...${l.label.substr(-4, 4)}`
                            : ''}
                    </div>
                    <div className="text-white text-xl">
                        {format(
                            new BigNumber(Web3.utils.fromWei(l.value, 'ether'))
                                .dp(8, 1)
                                .toString(10)
                        )}
                    </div>
                </div>
            ))}

            {emptyList.map(v => (
                <div
                    key={v}
                    className="flex justify-between border-b border-solid border-lightGray py-2"
                >
                    <div className="text-white">-</div>
                    <div className="text-white">-</div>
                </div>
            ))}

            {isViewAll && addressNumber > 3 && (
                <div
                    className="text-primary text-xl text-center mt-6"
                    onClick={() => {
                        setIsViewAll(false);
                        onViewAll();
                    }}
                >
                    View All
                </div>
            )}
        </div>
    )
}


VoteCard.defaultProps = {
    history: {},
    label: '',
    forNumber: '0',
    againstNumber: '0',
    type: 'agree',
    addressNumber: 0,
    emptyNumber: 0,
    list: []
};

export default compose(withRouter)(VoteCard);
