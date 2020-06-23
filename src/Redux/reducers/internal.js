import produce from "immer"
import { initialState } from './initial';

import {
    CONNECTION_STATUS_CHANGED,
    TOGGLE_DEBUG_MODE,
    TOGGLE_POPUP_MODE,
    USING_24HOUR_FORMAT,
    SET_APP_STATE,
    SET_CONNECTION_TIMEOUT,
    TOGGLE_DEBUG_INTERFACE,
} from '../actions/ActionTypes'

export default (state = initialState.internal, action) => 
    produce(state, draft => {
        switch (action.type) {
            case CONNECTION_STATUS_CHANGED:
                draft.connnection = action.data || {}
                break
            case SET_APP_STATE:
                draft.prevAppState = String(draft.appState || "")
                draft.appState = action.appState || ""
                break
                      
            case SET_CONNECTION_TIMEOUT:
                draft.connectionTimeout = action.timeout
                break
            case TOGGLE_DEBUG_MODE:
                draft.isDebugMode = action.status
                break
            case TOGGLE_DEBUG_INTERFACE:
                draft.isDebugInterface = action.status
                break
            case 'SCANNING_PERMISSION':
                draft.isHavingScanningPermmision = action.permission
                break
                
            case TOGGLE_POPUP_MODE:
                draft.isPopupMode = action.status
                break
            case USING_24HOUR_FORMAT:
                draft.isUsing24HouFormat = action.isUsing24HouFormat
                break
            default:
            return state;
        }
    })