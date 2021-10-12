import { withRouter } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';
import styled from 'styled-components';
import { accountActionCreators, connectAccount } from '../../core';
import React, { useCallback, useEffect, useState } from 'react';
import { getTokenContract, getVoteContract, methods } from '../../utilities/ContractService';
import Web3 from 'web3';
import { promisify } from '../../utilities';
import moment from 'moment';
import toast from '../../components/UI/Toast';
import Layout from '../../layouts/MainLayout/MainLayout';
import ProposalInfo from '../../components/vote/VoteOverview/ProposalInfo';
import Loading from '../../components/UI/Loading';
import BigNumber from 'bignumber.js';
import VoteCard from '../../components/vote/VoteOverview/VoteCard';
import ProposalDetails from '../../components/vote/VoteOverview/ProposalDetails';
import ProposalHistory from '../../components/vote/VoteOverview/ProposalHistory';
import { useActiveWeb3React } from '../../hooks';

const Styles = styled.div`
  .tooltip {
    margin-bottom: 5px;
    .label {
      display: none;
      position: absolute;
      bottom: 115%;
      left: 0;
      color: #e2e2e2;
      font-size: 14px;
      font-weight: 400;
      max-width: 270px;
      width: 14rem;
      text-align: center;
      background: #101016;
      padding: 5px 10px;
      min-height: 50px;
      align-items: center;
      justify-content: center;
      top: auto;
      border-radius: 10px;
      line-height: normal;
      border: 2px solid #B068009C;
      height: auto;
    }
    .tooltip-label:hover + .label {
      display: flex;
    }
  }
 `

const VoteOverview = ({ settings, getVoters, getProposalById, match }) => {
  const { account } = useActiveWeb3React();
  const [proposalInfo, setProposalInfo] = useState({});
  const [agreeVotes, setAgreeVotes] = useState({});
  const [againstVotes, setAgainstVotes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [cancelStatus, setCancelStatus] = useState('pending');
  const [proposalThreshold, setProposalThreshold] = useState(0);
  const [proposerVotingWeight, setProposerVotingWeight] = useState(0);
  const [isPossibleExecuted, setIsPossibleExecuted] = useState(false);
  const [executeEta, setExecuteEta] = useState('');

  const updateBalance = useCallback(async () => {
    if (account && proposalInfo.id) {
      const annTokenContract = getTokenContract('ann');
      const voteContract = getVoteContract();
      await methods.call(voteContract.methods.proposalThreshold, []).then((res) => {
        setProposalThreshold(+Web3.utils.fromWei(res, 'ether'));
      });
      await methods
        .call(annTokenContract.methods.getCurrentVotes, [proposalInfo.proposer])
        .then((res) => {
          setProposerVotingWeight(+Web3.utils.fromWei(res, 'ether'));
        });
    }
  }, [account, proposalInfo]);

  useEffect(() => {
    if (account) {
      updateBalance();
    }
  }, [account, updateBalance]);

  useEffect(() => {
    if (match.params && match.params.id) {
      promisify(getProposalById, {
        id: match.params.id,
      }).then((res) => {
        setProposalInfo(res.data);
      });
    }
  }, [match, getProposalById]);

  const loadVotes = useCallback(
    async (limit) => {
      if (proposalInfo.id) {
        await promisify(getVoters, {
          id: proposalInfo.id,
          limit,
          filter: 'for',
        })
          .then((res) => setAgreeVotes(res.data || {}))
          .catch(() => {
            setAgreeVotes({});
          });
        await promisify(getVoters, {
          id: proposalInfo.id,
          limit,
          filter: 'against',
        })
          .then((res) => setAgainstVotes(res.data || {}))
          .catch(() => {
            setAgainstVotes({});
          });
      }
    },
    [getVoters, proposalInfo],
  );

  const getIsPossibleExecuted = () => {
    const voteContract = getVoteContract();
    methods.call(voteContract.methods.proposals, [proposalInfo.id]).then((res) => {
      setIsPossibleExecuted(res && res.eta <= Date.now() / 1000);
      setExecuteEta(moment(res.eta * 1000).format('LLLL'));
    });
  };

  useEffect(() => {
    loadVotes(4);
  }, [loadVotes]);

  useEffect(() => {
    if (proposalInfo.id) {
      getIsPossibleExecuted();
    }
  }, [proposalInfo]);

  const loadMore = (type) => {
    if (type === 'for' && agreeVotes.total) {
      promisify(getVoters, {
        id: proposalInfo.id,
        limit: agreeVotes.total,
        filter: 'for',
      })
        .then((res) => setAgreeVotes(res.data || {}))
        .catch(() => {
          setAgreeVotes({});
        });
    } else if (againstVotes.total) {
      promisify(getVoters, {
        id: proposalInfo.id,
        limit: againstVotes.total,
        filter: 'against',
      })
        .then((res) => setAgainstVotes(res.data || {}))
        .catch(() => {
          setAgainstVotes({});
        });
    }
  };

  const handleUpdateProposal = (statusType) => {
    const appContract = getVoteContract();
    if (statusType === 'Queue') {
      setIsLoading(true);
      methods
        .send(appContract.methods.queue, [proposalInfo.id], account)
        .then(() => {
          setIsLoading(false);
          setStatus('success');
          toast.success({
            title: `Proposal list will be updated within a few seconds`,
          });
        })
        .catch(() => {
          setIsLoading(false);
          setStatus('failure');
        });
    } else if (statusType === 'Execute') {
      setIsLoading(true);
      methods
        .send(appContract.methods.execute, [proposalInfo.id], account)
        .then(() => {
          setIsLoading(false);
          setStatus('success');
          toast.success({
            title: `Proposal list will be updated within a few seconds`,
          });
        })
        .catch(() => {
          setIsLoading(false);
          setStatus('failure');
        });
    } else if (statusType === 'Cancel') {
      setIsCancelLoading(true);
      methods
        .send(appContract.methods.cancel, [proposalInfo.id], account)
        .then(() => {
          setIsCancelLoading(false);
          setCancelStatus('success');
          toast.success({
            title: `Current proposal is cancelled successfully. Proposal list will be updated within a few seconds`,
          });
        })
        .catch(() => {
          setIsCancelLoading(false);
          setCancelStatus('failure');
        });
    }
  };

  return (
    <Layout title={'Vote'}>
      <div className="py-4">
        <div className="flex flex-col mt-4 sm:mt-2">
          <div
            className="flex flex-col md:flex-row space-y-4 md:space-y-0
                        justify-between items-center md:items-end mt-8"
          >
            <ProposalInfo proposalInfo={proposalInfo} />
            {proposalInfo.state !== 'Executed' &&
              proposalInfo.state !== 'Defeated' &&
              proposalInfo.state !== 'Canceled' && (
                <div className="flex justify-center md:justify-end space-x-4 mt-6 sm:mt-10">
                  {proposalInfo.state === 'Succeeded' && (
                    <button
                      className="focus:outline-none bg-primary text-black py-2 px-8 rounded text-xl"
                      disabled={isLoading || status === 'success'}
                      onClick={() => handleUpdateProposal('Queue')}
                    >
                      {isLoading && <Loading size={'18px'} margin={'8px'} />}
                      {status === 'pending' || status === 'failure' ? 'Queue' : 'Queued'}
                    </button>
                  )}
                  {proposalInfo.state === 'Queued' && (
                    <Styles>
                      <div className="tooltip relative">
                        <div className="text-white text-xl flex items-center">
                          <button
                            className="tooltip-label :outline-none bg-primary text-black py-2 px-8 rounded text-xl"
                            disabled={isLoading || status === 'success' || !isPossibleExecuted}
                            onClick={() => handleUpdateProposal('Execute')}
                          >
                            {isLoading && <Loading size={'18px'} margin={'8px'} />}
                            {status === 'pending' || status === 'failure' ? 'Execute' : 'Executed'}
                          </button>
                          {!isPossibleExecuted && <span className="label">Executable Date: {moment(proposalInfo?.eta * 1000).format('LLLL')}</span>}
                        </div>
                      </div>
                    </Styles>
                  )}

                  <button
                    className="focus:outline-none bg-primary text-black py-2 px-8 rounded text-xl"
                    disabled={
                      isCancelLoading ||
                      proposerVotingWeight >= proposalThreshold ||
                      cancelStatus === 'success'
                    }
                    onClick={() => handleUpdateProposal('Cancel')}
                  >
                    {isCancelLoading && <Loading size={'18px'} margin={'8px'} />}
                    {cancelStatus === 'pending' || cancelStatus === 'failure'
                      ? 'Cancel'
                      : 'Cancelled'}
                  </button>
                </div>
              )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 mt-6">
          <VoteCard
            label="For"
            forNumber={new BigNumber(agreeVotes.sumVotes).isNaN() ? '0' : agreeVotes.sumVotes}
            againstNumber={
              new BigNumber(againstVotes.sumVotes).isNaN() ? '0' : againstVotes.sumVotes
            }
            type="agree"
            addressNumber={new BigNumber(agreeVotes.total).isNaN() ? 0 : agreeVotes.total}
            emptyNumber={4 - (new BigNumber(agreeVotes.total).isNaN() ? 0 : agreeVotes.total)}
            list={
              agreeVotes.result &&
              agreeVotes.result.map((v) => ({
                label: v.address,
                value: v.votes,
              }))
            }
            onViewAll={() => loadMore('for')}
          />

          <VoteCard
            label="Against"
            forNumber={new BigNumber(agreeVotes.sumVotes).isNaN() ? '0' : agreeVotes.sumVotes}
            againstNumber={
              new BigNumber(againstVotes.sumVotes).isNaN() ? '0' : againstVotes.sumVotes
            }
            type="against"
            addressNumber={new BigNumber(againstVotes.total).isNaN() ? 0 : againstVotes.total}
            emptyNumber={4 - (new BigNumber(againstVotes.total).isNaN() ? 0 : againstVotes.total)}
            list={
              againstVotes.result &&
              againstVotes.result.map((v) => ({
                label: v.address,
                value: v.votes,
              }))
            }
            onViewAll={() => loadMore('against')}
          />
        </div>

        <div className="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:grid-cols-8 lg:gap-x-4 items-start mt-6">
          <ProposalDetails proposalInfo={proposalInfo} />

          <ProposalHistory proposalInfo={proposalInfo} />
        </div>
      </div>
    </Layout>
  );
};

VoteOverview.defaultProps = {
  match: {},
  settings: {},
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting,
});

const mapDispatchToProps = (dispatch) => {
  const { getProposalById, getVoters } = accountActionCreators;

  return bindActionCreators(
    {
      getProposalById,
      getVoters,
    },
    dispatch,
  );
};

export default compose(
  withRouter,
  connectAccount(mapStateToProps, mapDispatchToProps),
)(VoteOverview);
