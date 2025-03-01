import { combineReducers } from 'redux';
import { LOGOUT_SUCCESS } from '../modules/auth/actions';
import {
  auth,
  account,
  swap,
  multicall,
  transactions,
  lists,
  application,
  user,
  mint,
  burn,
  farms,
  pools,
} from '../modules';
import { resetReducer } from '../modules/reset';

const appReducer = combineReducers({
  auth,
  account,
  swap,
  multicall,
  transactions,
  lists,
  application,
  user,
  mint,
  burn,
  farms,
  pools,
});

export default function rootReducer(state, action) {
  let finalState = appReducer(state, action);
  if (action.type === LOGOUT_SUCCESS) {
    finalState = resetReducer(finalState, action);
  }
  return finalState;
}
