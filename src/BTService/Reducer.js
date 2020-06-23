// @flow
import {atob, btoa } from '../Utils/base64'
import {State, Device, BleError, Characteristic} from 'react-native-ble-plx';

import produce from "immer"

export type Action =
  | ConnectAction
  | DisconnectAction
  | PromptAction
  | UpdateConnectionStateAction
  | BleStateUpdatedAction
  | SensorTagFoundAction
  | ForgetSensorTagAction
  | ExecuteTestAction
  | TestProgressAction
  | TestFinishedAction
  | DeviceServices
  | DeviceHeartBeat
  | DeviceStatusFound
  | DeviceProgramFound
  | DeviceDateFound
  | DeviceSetImage
  | DeviceSetAttributes
  | DeviceSerialFound
  | RestartPeripheralScanAction
  | UpdateAttemptAction

export type ConnectAction = {|
  type: 'CONNECT',
  device: Device,
  auth: ?any,
  callback: ?Function,
  connectDelay: ?Number
|};

export type DeviceServices = {|
  type: 'UPDATE_DEVICE_CHARACTERISTICS',
  device: Device,
  services: Array<Services>,  
|}
export type DisconnectAction = {|
  type: 'DISCONNECT',
  device: Device,
  callback: ?Function,
|};

export type DisconnectAllAction = {|
  type: 'DISCONECT_ALL',
  devices: Array<Device>,
  callback: ?Function,
|};
export type RestartPeripheralScanAction = {|
  type: 'RESTART_PERIPHERAL_SCAN',
|};

export type PromptAction = {|
  type: 'PROMPT_PERMISSION',
  callback: Function,
|};

export type DeviceHeartBeat = {|
  type: 'HEART_BEAT',
|};

export type DeviceHeartBeatFound = {|
  type: 'HEART_BEAT_FOUND',
  device: Device,
|};

export type DeviceStatusFound = {|
  type: 'DEVICE_STATUS_FOUND',
  device: Device,data: Object
|};

export type DeviceProgramFound = {|
  type: 'DEVICE_PROGRAM_FOUND',
  device: Device,
  data: Object
|};

export type DeviceDateFound = {|
  type: 'DEVICE_DATE_FOUND',
  device: Device,
  data: Object,
|};

export type ScanningPermmsionAction= {|
  type: 'SCANNING_PERMISSION',
  permission: boolean
|};


export type UpdateConnectionStateAction = {|
  type: 'UPDATE_CONNECTION_STATE',
   device: Device,
  state: $Keys<typeof ConnectionState>,
|};

export type BleStateUpdatedAction = {|
  type: 'BLE_STATE_UPDATED',
  state: $Keys<typeof State>,
|};

export type SensorTagFoundAction = {|
  type: 'SENSOR_TAG_FOUND',
  device: Device,
|};

export type ForgetSensorTagAction = {|
  type: 'FORGET_SENSOR_TAG',
|};

export type ExecuteTestAction = {|
  type: 'EXECUTE_TEST',
  id: string,
  value: ?string,
  callback: ?Function,
  delay: ?Number
|};

export type TestProgressAction = {|
  type: 'TEST_PROGRESS',
  test: ?string,
|};

export type TestFinishedAction = {|
  type: 'TEST_FINISHED',
  test: ?string,
|};



export type DeviceSetImage = {|
  type: 'DEVICE_SET_IMAGE',
  device: Device,
  data: ?any
|};

export type DeviceSetAttributes= {|
  type: 'DEVICE_SET_ATTRIBUTES',
|};

export type DeviceSerialFound = {|
  type: 'DEVICE_SERIAL_FOUND',
  device: Device,
  data: Object,
|};
export type UpdateAttemptAction = {|
  type: 'UPDATE_CONNECTION_ATTEMPT',
  device: Device,
|};




export type ReduxState = {
  activeError: ?BleError,
  activeSensorTag: ?Device,
  connectionState: $Keys<typeof ConnectionState>,
  currentTest: ?string,
  bleState: $Keys<typeof State>,
  peripherals: Object,
};

export const ConnectionState = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  DISCOVERING: 'DISCOVERING',
  CONNECTED: 'CONNECTED',
  DISCONNECTING: 'DISCONNECTING',
};

export const initialState: ReduxState = {
  bleState: State.Unknown,
  activeError: null,
  connectionState: ConnectionState.DISCONNECTED,
  currentTest: null,
  peripherals: {},
};


export function connect(device: Device, auth: any, callback: ?Function, connectDelay: ?Number): ConnectAction {
  return {
    type: 'CONNECT',
    device,
    auth,
    callback,
    connectDelay,
  };
}

export function updateConnectionState(
  state: $Keys<typeof ConnectionState>,
  device: Device,
): UpdateConnectionStateAction {
  return {
    type: 'UPDATE_CONNECTION_STATE',
    state,
    device,
  };
}

export function updateDeviceCharacteristics(
  device: Device,
  characteristics: Array<Characteristic>
): UpdateConnectionStateAction {
  return {
    type: 'UPDATE_DEVICE_CHARACTERISTICS',
    characteristics,
    device,
  };
}

export function heartBeat(): DeviceHeartBeat {
  return {
    type: 'HEART_BEAT',
  };
}

export function heartBeatFound(device: Device): DeviceHeartBeatFound {
  return {
    type: 'HEART_BEAT_FOUND',
    device,
  };
}

export function deviceStatusFound(device: Device,data: Object): DeviceStatusFound {
  return {
    type: 'DEVICE_STATUS_FOUND',
    device,data,
  };
}

export function deviceSerialFound(device: Device,data: Object): DeviceSerialFound {
  return {
    type: 'DEVICE_SERIAL_FOUND',
    device,data,
  };
}



export function deviceProgramFound(device: Device,data: Object): DeviceProgramFound {
  return {
    type: 'DEVICE_PROGRAM_FOUND',
    device,data,
  };
}

export function deviceDateFound(device: Device,data: Object): DeviceDateFound {
  return {
    type: 'DEVICE_DATE_FOUND',
    device,data,
  };
}

export function deviceSetImage(device: Device,data: ?any): DeviceSetImage{
  return {
    type: 'DEVICE_SET_IMAGE',
    device,data,
  };
}


export function disconnect(device: Device, callback: ?Function): DisconnectAction {
  return {
    type: 'DISCONNECT',
    device,callback
  };
}

export function disconnectAll(devices: Array<Device>, callback: ?Function): DisconnectAllAction {
  return {
    type: 'DISCONECT_ALL',
    devices,callback
  };
}


export function promptPermisison(callback: Function): PromptAction {
  return {
    type: 'PROMPT_PERMISSION',
    callback,
  };
}


export function saveDeviceAttributes(device: Device, data): DisconnectAction {
  return {
    type: 'DEVICE_SET_ATTRIBUTES',
    device,data
  };
}



export function bleStateUpdated(
  state: $Keys<typeof State>,
): BleStateUpdatedAction {
  return {
    type: 'BLE_STATE_UPDATED',
    state,
  };
}

export function sensorTagFound(device: Device): SensorTagFoundAction {
  return {
    type: 'SENSOR_TAG_FOUND',
    device,
  };
}

export function forgetSensorTag(): ForgetSensorTagAction {
  return {
    type: 'FORGET_SENSOR_TAG',
  };
}

export function executeTest(id: string, value: ?string, callback: ?Function, delay: ?Number): ExecuteTestAction {
  console.groupCollapsed(`TEST-${id}`)
  return {
    type: 'EXECUTE_TEST',
    id,
    value,
    callback,
    delay
  };
}

export function testFinished(test: ?string): TestFinishedAction {
  console.groupEnd()
  return {
    type: 'TEST_FINISHED',
    test,
  };
}


export function scanningPermissionStatus(permission: boolean): ScanningPermmsionAction {
  return {
    type: 'SCANNING_PERMISSION',
    permission,
  };
}

export function testProgress(test: ?string): TestProgressAction {
  return {
    type: 'TEST_PROGRESS',
    test,
  };
}

export function updateAttempt(device: Device): UpdateAttemptAction {
  return {
    type: 'UPDATE_CONNECTION_ATTEMPT',
    device,
  };
}


export const BTService = (state: ReduxState = initialState, action: Action) => 
  produce(state, draft => {
    switch (action.type) {
      case 'UPDATE_CONNECTION_STATE':
        draft.connectionState = action.state
        if(draft.peripherals[action.device.id]){
          draft.peripherals[action.device.id].connectionState = action.state
          draft.peripherals[action.device.id].meta = {}  
        }
        break;
      case 'UPDATE_DEVICE_CHARACTERISTICS':
        if(draft.peripherals[action.device.id]){
          draft.peripherals[action.device.id].characteristics = action.characteristics
          draft.peripherals[action.device.id].total_characteristics = action.characteristics.length
        }
          break;
      case 'DEVICE_STATUS_FOUND':
        if( draft.peripherals[action.device.id].meta && action.data ){
          draft.peripherals[action.device.id].meta.status = action.data.value
        }
          break;
      case 'DEVICE_PROGRAM_FOUND':
        if( draft.peripherals[action.device.id].meta && action.data ){
          draft.peripherals[action.device.id].meta.program = action.data.program
        }
          break;
      case 'DEVICE_DATE_FOUND':
        if( draft.peripherals[action.device.id].meta && action.data ){
          draft.peripherals[action.device.id].meta.date = action.data.date
        }
          break;
      case 'UPDATE_CONNECTION_ATTEMPT':
        if(draft.peripherals[action.device.id]){
          draft.peripherals[action.device.id].failedAttempt++;
        }
          break;
        
      case 'RESTART_PERIPHERAL_SCAN':
        Object.keys(draft.peripherals).forEach((key,index)=>{
          draft.peripherals[key].updated_at = null
        })
        break
      case 'BLE_STATE_UPDATED':
        return {
          ...state,
          bleState: action.state,
        };
      case 'SENSOR_TAG_FOUND':
        draft.peripherals[action.device.id] = action.device
        draft.peripherals[action.device.id].failedAttempt = draft.peripherals[action.device.id].failedAttempt || 0
        draft.peripherals[action.device.id].updated_at = (new Date()).toISOString()
        break;     
      case 'EXECUTE_TEST':
        if (state.connectionState !== ConnectionState.CONNECTED) {
          return state;
        }
        return {...state, currentTest: action.id};
      case 'TEST_FINISHED':
        return {...state, prevTest: state.currentTest, currentTest: null};
      default:
        return state;
    }
  })

