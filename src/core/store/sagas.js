// @flow

import { fork, all } from 'redux-saga/effects';
import { authSaga, accountSaga } from '../modules';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(accountSaga)]);
}
