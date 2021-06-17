/* eslint-disable no-unused-vars */
import { put, call, fork, all, take } from 'redux-saga/effects';

import {
  GET_MARKET_HISTORY_REQUEST,
  GET_PROPOSALS_REQUEST,
  GET_FAUCET_REQUEST,
  GET_GOVERNANCE_ANNEX_REQUEST,
  GET_PROPOSAL_BY_ID_REQUEST,
  GET_VOTERS_REQUEST,
  GET_VOTER_DETAIL_REQUEST,
  GET_VOTER_HISTORY_REQUEST,
  GET_VOTER_ACCOUNTS_REQUEST,
  accountActionCreators
} from './actions';

import { restService } from '../../../utilities';

export function* asyncGetMarketHistoryRequest({ payload, resolve, reject }) {
  const { asset, type, limit } = payload;

  try {
    const response = yield call(restService, {
      api: `/v1/market_history/graph?asset=${asset}&type=${type}&limit=${limit}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetGovernanceAnnexRequest({ payload, resolve, reject }) {
  try {
    const response = yield call(restService, {
      api: `/v1/governance/annex`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetProposalsRequest({ payload, resolve, reject }) {
  const { limit, offset } = payload;
  try {
    const response = yield call(restService, {
      api: `/v1/proposals?limit=${limit || 5}&offset=${offset || 0}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetFaucetRequest({ payload, resolve, reject }) {
  const { address, asset, amountType } = payload;

  try {
    const response = yield call(restService, {
      api: `/v1/faucet`,
      method: 'POST',
      params: {
        address,
        asset,
        amountType
      }
    });
    if (response.status === 200) {
      yield put(accountActionCreators.getFromFaucetSuccess());
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}

export function* asyncGetProposalByIdRequest({ payload, resolve, reject }) {
  const { id } = payload;
  try {
    const response = yield call(restService, {
      api: `/v1/proposals/${id}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}
export function* asyncGetVotersRequest({ payload, resolve, reject }) {
  const { limit, filter, id } = payload;
  try {
    const response = yield call(restService, {
      api: `/v1/voters/${id}?limit=${limit || 3}&filter=${filter}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}
export function* asyncGetVoterDetailRequest({ payload, resolve, reject }) {
  const { address } = payload;
  try {
    const response = yield call(restService, {
      api: `/v1/voters/accounts/${address}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}
export function* asyncGetVoterHistoryRequest({ payload, resolve, reject }) {
  const { offset, limit, address } = payload;
  try {
    const response = yield call(restService, {
      api: `/v1/voters/history/${address}?offset=${offset || 0}&limit=${limit ||
        5}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(response);
    }
  } catch (e) {
    reject(e);
  }
}
export function* asyncGetVoterAccountsRequest({ payload, resolve, reject }) {
  const { limit, offset } = payload;

  try {
    const response = yield call(restService, {
      api: `/v1/voters/accounts?limit=${limit || 100}&offset=${offset || 0}`,
      method: 'GET',
      params: {}
    });
    if (response.status === 200) {
      resolve(response.data);
    }
  } catch (e) {
    reject(e);
  }
}

export function* watchGetMarketHistoryRequest() {
  while (true) {
    const action = yield take(GET_MARKET_HISTORY_REQUEST);
    yield* asyncGetMarketHistoryRequest(action);
  }
}

export function* watchGetGovernanceAnnexRequest() {
  while (true) {
    const action = yield take(GET_GOVERNANCE_ANNEX_REQUEST);
    yield* asyncGetGovernanceAnnexRequest(action);
  }
}

export function* watchGetProposalsRequest() {
  while (true) {
    const action = yield take(GET_PROPOSALS_REQUEST);
    yield* asyncGetProposalsRequest(action);
  }
}
export function* watchGetFaucetRequest() {
  while (true) {
    const action = yield take(GET_FAUCET_REQUEST);
    yield* asyncGetFaucetRequest(action);
  }
}
export function* watchGetProposalByIdRequest() {
  while (true) {
    const action = yield take(GET_PROPOSAL_BY_ID_REQUEST);
    yield* asyncGetProposalByIdRequest(action);
  }
}
export function* watchGetVotersRequest() {
  while (true) {
    const action = yield take(GET_VOTERS_REQUEST);
    yield* asyncGetVotersRequest(action);
  }
}
export function* watchGetVoterDetailRequest() {
  while (true) {
    const action = yield take(GET_VOTER_DETAIL_REQUEST);
    yield* asyncGetVoterDetailRequest(action);
  }
}
export function* watchGetVoterHistoryRequest() {
  while (true) {
    const action = yield take(GET_VOTER_HISTORY_REQUEST);
    yield* asyncGetVoterHistoryRequest(action);
  }
}
export function* watchGetVoterAccountsRequest() {
  while (true) {
    const action = yield take(GET_VOTER_ACCOUNTS_REQUEST);
    yield* asyncGetVoterAccountsRequest(action);
  }
}

export default function*() {
  yield all([
    fork(watchGetMarketHistoryRequest),
    fork(watchGetGovernanceAnnexRequest),
    fork(watchGetFaucetRequest),
    fork(watchGetProposalsRequest),
    fork(watchGetProposalByIdRequest),
    fork(watchGetVotersRequest),
    fork(watchGetVoterDetailRequest),
    fork(watchGetVoterHistoryRequest),
    fork(watchGetVoterAccountsRequest)
  ]);
}
