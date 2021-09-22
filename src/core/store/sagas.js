// @flow

import { fork, all } from 'redux-saga/effects';
import { authSaga, accountSaga, farmsSaga } from '../modules';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(accountSaga), fork(farmsSaga)]);
}
