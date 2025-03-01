import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { throttle } from 'lodash';
import sagas from './sagas';
import { loadState, saveState } from '../../utilities/localStorage';
import rootReducer from './reducers';

const persistedState = loadState();
const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware];

if (process.env.NODE_ENV === 'development') {
  // middlewares.push(createLogger());
}

const enhancers = [
  applyMiddleware(...middlewares) // empty for now;
];

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;
/* eslint-enable */

const store = createStore(
  rootReducer,
  persistedState,
  composeEnhancers(...enhancers)
);

console.log(store)

sagaMiddleware.run(sagas);
// =================================== critical changes
store.subscribe(throttle(() => saveState(store.getState()), 1000));
export default store;
