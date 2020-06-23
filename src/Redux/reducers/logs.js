import produce from "immer"
import { initialState } from './initial';

import {
    WRITE_LOG,
    CLEAR_LOG,
} from '../actions/ActionTypes'

export default (state = initialState.logs, action) => 
    produce(state, draft => {
        switch (action.type) {
            case WRITE_LOG:
                date = new Date(); 
                draft.data.push({id: date.getTime(), message: action.message, data: action.data })
                draft.updated_at = date.toISOString()
                break
            
            case CLEAR_LOG:
                draft.data = []
                draft.updated_at = null

                break
            default:
            return state;
        }
    })