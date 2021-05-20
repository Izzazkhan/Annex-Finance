import { combineReducers } from 'redux';
import { LOGOUT_SUCCESS } from '../modules/auth/actions';
import { auth, account } from '../modules';
import { resetReducer } from '../modules/reset';

const appReducer = combineReducers({
  auth,
  account
});

export default function rootReducer(state, action) {
  let finalState = appReducer(state, action);
  if (action.type === LOGOUT_SUCCESS) {
    finalState = resetReducer(finalState, action);
  }
  return finalState;
}
