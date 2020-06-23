import produce from "immer"
import { initialState } from './initial';
import {ConnectionState} from '../../BTService/Reducer'
import {
    SET_PERIPHERAL,
    PAIR_PERIPHERAL,
    UNPAIR_PERIPHERAL,
    UPDATE_PROGRAM_LOCALLY,
    CHANGE_VALVE_STATUS_LOCALLY,
    DEVICE_VALVES_UPDATE,
} from '../actions/ActionTypes'
import DeviceModel from '../../BTService/models/family'


export default (state = initialState.peripherals, action) => 
    produce(state, draft => {
        let peripheralIndex, deviceInfo = {}
        switch (action.type) {
            case SET_PERIPHERAL:
                draft.currentDeviceID = action.id;
                break;
            case 'UPDATE_CONNECTION_STATE':
                break;
            case 'SENSOR_TAG_FOUND':
                break;
            case DEVICE_VALVES_UPDATE:
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list[peripheralIndex].localSettings.valvesInfo = action.valvesInfo
                }
                break;
            case 'DEVICE_STATUS_FOUND':
            peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
            if(peripheralIndex > -1 ){
                draft.list[peripheralIndex].status = {
                    ...action.data.status.savableStatus()
                }
                draft.list[peripheralIndex].status_updated_at = (new Date()).toISOString()
                if(!draft.list[peripheralIndex].localSettings.valvesInfo){
                    draft.list[peripheralIndex].localSettings.valvesInfo = action.data.status.savableStatus().faucets.map( ({name, number}) => ({name, number}))
                }
            }
            break;
            case CHANGE_VALVE_STATUS_LOCALLY:
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list[peripheralIndex].status = {
                        ...draft.list[peripheralIndex].status,
                        isOpen: action.open,
                        isValveManuallyOpen: action.open,
                    }
                }
                break;
            case UPDATE_PROGRAM_LOCALLY:
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                
                if(peripheralIndex > -1 ){
                    if(action.data.config == "program"){
                        if(!draft.list[peripheralIndex].localSettings.programs){
                            draft.list[peripheralIndex].localSettings.programs = {}
                        }
                        draft.list[peripheralIndex].localSettings.programs[action.data.program.valveNumber] = action.data.program.savableProgram()
                    }
                    
                    if(action.data.config == "rain"){
                        draft.list[peripheralIndex].localSettings.rainSettings = {
                            rainOff:  action.data.rainOff,
                            faucets:  action.data.faucets,
                        }
                    }
                    
                    if(action.data.config == "clear_program"){
                        delete draft.list[peripheralIndex].localSettings.programs
                    }

                    if(action.data.config == "clear_rain"){
                        delete draft.list[peripheralIndex].localSettings.rainSettings
                    }
                    
                    if(action.data.config == "clear_all"){
                        delete draft.list[peripheralIndex].localSettings.rainSettings
                        delete draft.list[peripheralIndex].localSettings.programs
                        draft.list[peripheralIndex].status = {
                            ...draft.list[peripheralIndex].status,
                            isOpen: false,
                        }
                    }

                }
                break;
            case 'DEVICE_PROGRAM_FOUND':
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1){
                    draft.list[peripheralIndex].programs[action.data.program.valveNumber] = action.data.program.savableProgram()
                }
                break;
            case 'DEVICE_DATE_FOUND':
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list[peripheralIndex].date = {
                        year: action.data.date.year,
                        month: action.data.date.month,
                        dayOfMonth: action.data.date.dayOfMonth,
                        hrs: action.data.date.hrs,
                        min: action.data.date.min,
                        sec: action.data.date.sec,
                        dayOfWeek: action.data.date.dayOfWeek,
                        isTimeInsync: action.data.date.isTimeInsync
                    }
                }
                break;
            case 'DEVICE_SET_IMAGE':
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list[peripheralIndex].avatarSource = action.data
                }
                break;
            case 'DEVICE_SET_ATTRIBUTES':
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list[peripheralIndex].name = action.data.name
                    draft.list[peripheralIndex].note = action.data.note
                }
                break; 
            case PAIR_PERIPHERAL:
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                deviceInfo = new DeviceModel(action.device)
                if(peripheralIndex > -1 ){
                }else{
                    draft.list.push({
                        id: action.device.id,
                        localName: action.device.localName,
                        name: '',
                        avatarSource: null,
                        note: '',
                        status: {},
                        programs: {},
                        date: {},
                        localSettings: {},
                        modelName: deviceInfo.modelName ,
                        modelNumber: deviceInfo.modelNumber,
                        familyName: deviceInfo.family.name,
                        serialNumber: deviceInfo.serialNumber,
                        paired_at: (new Date()).toISOString()
                    })
                }
                
                break;
            case UNPAIR_PERIPHERAL:
                peripheralIndex = draft.list.findIndex(p => p.id == action.device.id )
                if(peripheralIndex > -1 ){
                    draft.list.splice(peripheralIndex, 1)
                }
                break;
            case 'DISCONNECT':
                break;
            default:
            return state;
        }
    })