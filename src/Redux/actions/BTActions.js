// Refactor neeeded
import {
    store
} from '../store';
import {
 SET_PERIPHERAL,
 PAIR_PERIPHERAL,
 UNPAIR_PERIPHERAL,
 UPDATE_PROGRAM_LOCALLY,
 CHANGE_VALVE_STATUS_LOCALLY,
 DEVICE_VALVES_UPDATE,
 RESTART_PERIPHERAL_SCAN,
} from './ActionTypes';

export const setPeripheral =(id)=>{
    store.dispatch({type: SET_PERIPHERAL, id})
}

export const pairPeripheral =(device)=>{
    store.dispatch({type: PAIR_PERIPHERAL, device})
}

export const saveLocalProgram =(device, data)=>{
    store.dispatch({type: UPDATE_PROGRAM_LOCALLY, device, data})
}

export const restartPeripheralScan =()=>{
    store.dispatch({type: RESTART_PERIPHERAL_SCAN })
}


export const unpairPeripheral =(device)=>{
    store.dispatch({type: UNPAIR_PERIPHERAL, device})
}


export const changeValveStatusLocally =(device,open)=>{
    store.dispatch({type: CHANGE_VALVE_STATUS_LOCALLY, device, open})
}

export const changeValveNameLocally =(device,valvesInfo)=>{
    store.dispatch({type: DEVICE_VALVES_UPDATE, device, valvesInfo})
}


