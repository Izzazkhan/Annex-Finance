import {withRouter} from "react-router-dom";
import {compose} from "redux";
import {useState} from "react";
import Pagination from "rc-pagination";
import rightArrow from "../../../assets/icons/rightArrow.svg";
import VoteHistoryItem from "./VoteHistoryItem";

const VotingHistory = ({ data, pageNumber, total, onChangePage }) => {
    const [current, setCurrent] = useState(pageNumber);
    const [pageSize, setPageSize] = useState(5);

    const handleChangePage = (page, size) => {
        setCurrent(page);
        setPageSize(size);
        onChangePage(page, (page - 1) * size, size);
    };

    const onNext = () => {
        handleChangePage(current + 1, 5);
    };

    const onPrev = () => {
        handleChangePage(current - 1, 5);
    };

    return (
        <div className="bg-fadeBlack py-6 px-10 rounded-3xl mt-6">
            <div className="text-primary text-xl font-bold mt-4">Voting History</div>
            {data && data.length === 0 && (
                <div className="flex items-center justify-center font-medium text-lg text-white py-8">
                    No votes
                </div>
            )}
            {data.map((item, index) => {
                return (
                    <VoteHistoryItem
                        proposal={item.proposal}
                        support={item.support}
                        key={index}
                    />
                )
            })}
            {data && data.length !== 0 && (
                <div className="flex justify-between mt-6">
                    <Pagination
                        defaultCurrent={1}
                        defaultPageSize={5}
                        current={current}
                        pageSize={pageSize}
                        total={total}
                        onChange={handleChangePage}
                    />
                    <div className="flex just-between align-center space-x-12">
                        {current > 1 && (
                            <div className="flex space-x-4" onClick={onPrev}>
                                <img src={rightArrow} alt="" className={'transform rotate-180'} />
                                <div className="text-lg text-primary">Prev</div>
                            </div>
                        )}
                        {current * pageSize < total && (
                            <div className="flex space-x-4" onClick={onNext}>
                                <div className="text-lg text-primary">Next</div>
                                <img src={rightArrow} alt="" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

    )
}


VotingHistory.defaultProps = {
    data: [],
    pageNumber: 1,
    total: 0
};


export default compose(withRouter)(VotingHistory);
