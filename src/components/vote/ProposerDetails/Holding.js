import {withRouter} from "react-router-dom";
import {compose} from "redux";
import commaNumber from "comma-number";

import user from '../../../assets/icons/user.svg';
import Progress from "../../UI/Progress";

const format = commaNumber.bindWith(',', '.');

const Holding = ({ address, holdingInfo }) => {
    return (
        <div className="col-span-3 bg-fadeBlack pt-4 pb-6 px-6 rounded-2xl">
            <div className="text-primary text-xl border-b border-solid border-lightGray py-4">
                Holding
            </div>
            <div className="border-b border-solid border-lightGray py-2">
                <div className="text-white text-base">Annex Balance</div>
                <div className="text-white text-xl">{format(holdingInfo.balance || '0.0000')}</div>
            </div>
            <div className="border-b border-solid border-lightGray py-2">
                <div className="flex justify-between ">
                    <div className="">
                        <div className="text-white text-base">Votes</div>
                        <div className="text-white text-xl">
                            {format(holdingInfo.votes || '0.0000')}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <img src={user} alt="" />
                        <div className="text-white text-base">
                            {holdingInfo.delegateCount || 0}
                        </div>
                    </div>
                </div>
                <Progress wrapperClassName="mt-2 mb-4" percent={100} />
            </div>
            <div className="text-white mt-8">
                <div className="text-14">Delegating To</div>
                <div className="text-base">
                    {holdingInfo.delegates !==
                    '0x0000000000000000000000000000000000000000' &&
                    holdingInfo.delegates !== address.toLowerCase()
                        ? 'Delegated'
                        : 'Undelegated'}
                </div>
            </div>
        </div>
    )
}



export default compose(withRouter)(Holding);
