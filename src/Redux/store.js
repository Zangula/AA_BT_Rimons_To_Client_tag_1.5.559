import thunk from 'redux-thunk';
import {
  createStore,
  applyMiddleware,
} from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import getRootReducer from './reducers';
import {sagaMiddleware, register} from './sagas'

let middleware = [thunk,sagaMiddleware];
const persistConfig = {
  key: 'galcon',
  storage,
  whitelist: ['internal' , 'logs', 'peripherals'],
  stateReconciler: autoMergeLevel2,
};
const pReducer = persistReducer(persistConfig, getRootReducer());

// LOG ONLY IN DEVELOPMENT PRODUCTION OPTIMIZATIONS
if (process.env.NODE_ENV === 'development') {
  const reduxLogger = require('redux-logger');
  const logger = reduxLogger.createLogger({ collapsed: true });
  middleware = [...middleware, logger];
}


export const store = createStore(
  pReducer,
  applyMiddleware(...middleware),
);
register(sagaMiddleware);
process.env.reduxStore = store;
export const persistor = persistStore(store);