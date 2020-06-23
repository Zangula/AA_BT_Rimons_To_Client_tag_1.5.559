import { combineReducers } from 'redux';
import internal from './internal'
import logs from './logs';
import {BTService} from '../../BTService/Reducer'
import peripherals from './peripherals';
export default function getRootReducer() {
    return combineReducers({
        internal,
        logs,
        BTService,
        peripherals,
    });
  }