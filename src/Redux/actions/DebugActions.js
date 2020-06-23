
import {TOGGLE_DEBUG_MODE,TOGGLE_POPUP_MODE, SET_CONNECTION_TIMEOUT, TOGGLE_DEBUG_INTERFACE} from './ActionTypes';
export const toggleDebugMode = (status) => dispatch =>  {
    dispatch({ type: TOGGLE_DEBUG_MODE, status });
};
export const isDebugInterfaceEnabled =() =>{
    if(process.env.reduxStore){
      return  process.env.reduxStore.getState().internal.isDebugInterface
    }
    return false
}

export const toggleDebugInterface = (status) => dispatch =>  {
    dispatch({ type: TOGGLE_DEBUG_INTERFACE, status });
};

export const togglePopupMode = (status) => dispatch =>  {
    dispatch({ type: TOGGLE_POPUP_MODE, status });
};

export const setConnectionTimeout = (timeout) => dispatch =>  {
    dispatch({ type: SET_CONNECTION_TIMEOUT, timeout });
};

