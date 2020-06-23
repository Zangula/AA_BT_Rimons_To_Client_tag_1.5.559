import {
    store
} from '../store';
import {
    SET_APP_STATE,
    USING_24HOUR_FORMAT,
} from './ActionTypes';
export const setAppState =(appState)=>{
    store.dispatch({type: SET_APP_STATE, appState})
}
export const setUsing24HourFormat =(isUsing24HouFormat)=>{
    store.dispatch({type: USING_24HOUR_FORMAT, isUsing24HouFormat})
}
