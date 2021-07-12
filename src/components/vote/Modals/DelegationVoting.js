import React, {useEffect, useState} from "react";
import {accountActionCreators, connectAccount} from "../../../core";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router-dom";
import {promisify} from "../../../utilities";
import Loading from "../../UI/Loading";
import {getEtherscanLink, shortenAddress} from "../../../utils";
import avatar from '../../../assets/icons/avatar.svg';
import expandBoxPrimary from '../../../assets/icons/expandBoxPrimary.svg';
import RouteMap from "../../../routes/RouteMap";
import {useActiveWeb3React} from "../../../hooks";

const DelegationVoting = ({ isLoading, onDelegate, getVoterAccounts, history }) => {
    const { chainId } = useActiveWeb3React();
    const [delegateAddress, setDelegateAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [voterAccounts, setVoterAccounts] = useState([])
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const getVoterLeaderboard = () => {
        setLoading(true);
        promisify(getVoterAccounts, { limit: 3, offset: 0 })
            .then(res => {
                setLoading(false);
                setVoterAccounts(res?.data?.result || []);
            })
            .catch(() => {
                setLoading(false);
                setVoterAccounts([]);
            });
    }

    useEffect(() => {
        if(showLeaderboard) {
            getVoterLeaderboard();
        }
    }, [showLeaderboard])

    return (
        <div className="p-6">
            <div className="text-xl text-primary">Select an Address</div>
            <p className="text-lg mt-4">
                If you know the address you wish to delegate to, enter it below. If not, you can view the
                Delegate Leaderboard to find a political party you wish to support.
            </p>
            <div className="flex justify-between mt-8">
                <div className="text-xl text-primary">Delegate Address</div>
                <div
                    className="text-xl text-darkRed cursor-pointer"
                    onClick={() => setShowLeaderboard(true)}
                >
                    Delegate Leaderboard
                </div>
            </div>
            <input
                name="actionText"
                type="text"
                className="gray-placeholder border border-solid border-gray bg-darkGray text-lg
                           rounded-xl w-full focus:outline-none font-medium py-4 px-4 text-primary mt-6 mb-4"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                placeholder="Enter a 0x address"
            />
            {showLeaderboard && (
                <div className="bg-darkGray rounded-2xl border border-solid border-gray">
                    {loading ? (
                        <div className="flex w-full py-4 items-center justify-center">
                            <Loading
                                margin={'0'}
                                size={'36px'}
                                className={'text-primary'}
                            />
                        </div>
                    ) : (
                        voterAccounts?.map((v) => {
                            return (
                                <div
                                    key={v.address}
                                    className="flex justify-between border-b border-solid border-gray py-4 pl-10 pr-6"
                                >
                                    <div
                                        className="flex space-x-4 cursor-pointer"
                                        onClick={() => {
                                            setDelegateAddress(v.address)
                                            setShowLeaderboard(false)
                                        }}
                                    >
                                        <img src={avatar} alt="" />
                                        <div className="text-primary">
                                            <div className="text-xl">{shortenAddress(v.address)}</div>
                                            <div className="text-xl">Voting Weight: {parseFloat(v.voteWeight * 100).toFixed(2)}%</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => {
                                            window.open(getEtherscanLink(chainId, v.address, 'address'), '_blank')
                                        }}
                                        className={'cursor-pointer'}
                                    >
                                        <img
                                            src={expandBoxPrimary}
                                            alt=""
                                        />
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div
                        className="text-xl py-4 text-center cursor-pointer"
                        onClick={() => {
                            history.push(RouteMap.vote.leaderboard)
                        }}
                    >
                        View Delegate Leaderboard
                    </div>
                </div>
            )}
            {!showLeaderboard && (
                <div className="flex justify-center mt-6">
                    <button
                        className={`focus:outline-none  py-2 px-16 mb-2 rounded-md text-xl
                        flex items-center justify-center
                        ${isLoading || delegateAddress === '' ? "bg-darkGray text-gray" : "bg-primaryLight text-black"}`}
                        disabled={isLoading || delegateAddress === ''}
                        onClick={() => onDelegate(delegateAddress)}
                    >
                        {isLoading && (<Loading margin={'8px'} size={'18px'} className={'text-gray'}/>)}
                        Delegate Voting
                    </button>
                </div>
            )}
        </div>
    )
}

DelegationVoting.defaultProps = {
    isLoading: false,
    onDelegate: () => {}
}


const mapDispatchToProps = dispatch => {
    const { getVoterAccounts } = accountActionCreators;

    return bindActionCreators(
        {
            getVoterAccounts
        },
        dispatch
    );
};

export default compose(
    withRouter,
    connectAccount(undefined, mapDispatchToProps)
)(DelegationVoting);

