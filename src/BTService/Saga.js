// @flow

import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { buffers, eventChannel } from 'redux-saga';
import {
  fork,
  cancel,
  take,
  call,
  put,
  race,
  cancelled,
  actionChannel,
  delay,
} from 'redux-saga/effects';
import { log, logError, logPopup, showErrorMessage } from '../Utils/logger';
import {
  updateConnectionState,
  bleStateUpdated,
  testProgress,
  testFinished,
  type BleStateUpdatedAction,
  type UpdateConnectionStateAction,
  type ConnectAction,
  type ExecuteTestAction,
  type PromptAction,
  type DisconnectAllAction,
  sensorTagFound,
  ConnectionState,
  heartBeat,
  heartBeatFound,
  scanningPermissionStatus,
  updateAttempt
} from './Reducer';
import BleErrorCode from './BleErrorCode'
import i18n from 'i18next';
import {
  BleManager,
  BleError,
  Device,
  State,
  LogLevel,
  ScanMode,
} from 'react-native-ble-plx';
import {
  UUID_GRH_Mapping,
  UUID_TAMAR_Mapping
} from "./models/family"
import { GLTimerTests, hearBeatTest , writePasswordTest, getConnectionOptions, cancelConnectionIfAny, disconnectAll } from './tests';
import {bugsnag} from '../Utils/bugsnag'
import { SCAN_THROTTLE } from 'bt-app/GlobalConstants'
var testTask = null;
export function* bleSaga(): Generator<*, *, *> {
  yield log({ message: 'BLE saga started...' })

  // First step is to create BleManager which should be used as an entry point
  // to all BLE related functionalities
  const manager = new BleManager();
  manager.setLogLevel(LogLevel.Verbose);
  // if(__DEV__ ){
  //   manager.setLogLevel(LogLevel.Verbose);
  // }else{
  //   manager.setLogLevel(LogLevel.None);
  // }
  

  // All below generators are described below...
  yield fork(handleScanning, manager);
  yield fork(handleBleState, manager);
  yield fork(handleConnection, manager);
}

function* promptPermission(manager: BleManager, callback: Function ): Generator<*, *, *> {
    if(Platform.OS == 'android'){
      Alert.alert("", i18n.t("INFO.BLUETOOTH_PERMISSION"),[
        {
          text: i18n.t("INFO.BLUETOOTH_PERMISSION_DENY"),
          onPress: () => {
            console.log('Cancel Pressed')
            callback && callback(false)
          },
          style: 'cancel',
        },
        {text: i18n.t("INFO.BLUETOOTH_PERMISSION_OK"), onPress: () => {
          console.log("Enabling Bluetooth")
          manager.enable().then(res=>{
            console.log("Enabled Bluetooth")
            callback && callback(true)
          })
        }},
      ],
      {cancelable: false},
    );
    }
    if(Platform.OS == 'ios'){
      manager.enable().then(res=>{
        console.log("Enabled Bluetooth")
        callback && callback(true)
      })
    }
    
}
// This generator tracks our BLE state. Based on that we can enable scanning, get rid of devices etc.
// eventChannel allows us to wrap callback based API which can be then conveniently used in sagas.
function* handleBleState(manager: BleManager): Generator<*, *, *> {
  const stateChannel = yield eventChannel(emit => {
    const subscription = manager.onStateChange(state => {
      emit(state);
    }, true);
    return () => {
      subscription.remove();
    };
  }, buffers.expanding(1));

  try {
    for (; ;) {
      const newState = yield take(stateChannel);
      yield put(bleStateUpdated(newState));     
    }
  } finally {
    if (yield cancelled()) {
      stateChannel.close();
    }
  }
}


// This generator decides if we want to start or stop scanning depending on specific
// events:
// * BLE state is in PoweredOn state
// * Android's permissions for scanning are granted
// * We already scanned device which we wanted
function* handleScanning(manager: BleManager): Generator<*, *, *> {
  var scanTask = null;
  var bleState: $Keys<typeof State> = State.Unknown;
  var connectionState: $Keys<typeof ConnectionState> =
    ConnectionState.DISCONNECTED;

  const channel = yield actionChannel([
    'PROMPT_PERMISSION',
    'BLE_STATE_UPDATED',
    'UPDATE_CONNECTION_STATE',
    'DISCONECT_ALL'
  ]);

  for (; ;) {
    const action:
      | BleStateUpdatedAction
      | UpdateConnectionStateAction 
      | DisconnectAllAction 
      | PromptAction = yield take(channel);
    switch (action.type) {
      case 'BLE_STATE_UPDATED':
        bleState = action.state;
        break;
      case 'UPDATE_CONNECTION_STATE':
        connectionState = action.state;
        break;
      case 'PROMPT_PERMISSION':
        yield promptPermission(manager, action.callback)
        break;
      case 'DISCONECT_ALL':
        if (testTask != null) {
          yield cancel(testTask);
        }
        yield disconnectAll(manager, action.devices, action.callback)
        break;
    }

    const enableScanning =
      bleState === State.PoweredOn &&
      (connectionState === ConnectionState.DISCONNECTING ||
        connectionState === ConnectionState.DISCONNECTED);
    if (enableScanning) {
      if (!scanTask) {
        scanTask = yield fork(scan, manager);
      }
     
    } else {
      if (scanTask != null) {
        yield cancel(scanTask);
        scanTask = null;
      }
    }
  }
}

// As long as this generator is working we have enabled scanning functionality.
// When we detect SensorTag device we make it as an active device.
function* scan(manager: BleManager): Generator<*, *, *> {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
   
    yield log({ message: 'Scanning: Checking permissions...' })

    const enabled = yield call(
      PermissionsAndroid.check,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );
    if (!enabled) {
      yield log({ message: 'Scanning: Permissions disabled, showing...' })
      try {
        const granted = yield call(
          PermissionsAndroid.request,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          yield put(scanningPermissionStatus(false));
          yield log({ message: 'Scanning: Permissions not granted, aborting...' })
          return;
        }
        yield put(scanningPermissionStatus(true));
      } catch (error) {
        yield bugsnag.notify(error)
        yield put(scanningPermissionStatus(false));
        yield console.log("PermissionsAndroid error", error)
        yield logPopup("Permissions errr")
        yield log({ message: 'Permission error' })
      }
      
    }else{
      yield put(scanningPermissionStatus(true));
      yield log({ message: 'Scanning: permissions is OK ' })
    }
  }
  
  if(Platform.OS == 'ios'){
    yield put(scanningPermissionStatus(true));
  }

  const start = Date.now();
  yield log({ message: 'Scanning started...' })
  yield logPopup('Scanning started...')
  const scanningChannel = yield eventChannel(emit => {
    manager.startDeviceScan(
      null,
      { allowDuplicates: true, scanMode: ScanMode.LowLatency},
      (error, scannedDevice) => {
        if (error) {  
          emit([error, scannedDevice]);
          return;
        }
        if (scannedDevice != null) {
          if(String(scannedDevice.localName).startsWith("GL")){
            emit([error, scannedDevice]);
          }
        }
      },
    );
    return () => {
      manager.stopDeviceScan();
    };
  }, buffers.expanding(1));

  try {
    for (; ;) {
      const [error, scannedDevice]: [?BleError,?Device] = yield take(
        scanningChannel,
      );
      if (error != null) {
          const bleErrror = Object.keys(BleErrorCode).find(key => BleErrorCode[key] === error.errorCode) || "Error";
        __DEV__ && console.log("Scan error",error, bleErrror,)  
        yield log({ message: `${bleErrror}: Scanning stopped...` })
        yield showErrorMessage(`:${bleErrror}:${error.reason}`)
        yield delay(SCAN_THROTTLE)
      }
      if (scannedDevice != null) {
        yield put(sensorTagFound(scannedDevice));
      }
    }
  } catch (error) {
    yield logPopup(`Error:${error.message}`)
    yield bugsnag.notify(error)
  } finally {
    yield log({ message: 'Scanning stopped...' })
    if (yield cancelled()) {
      scanningChannel.close();
    }
  }
}

function* handleConnection(manager: BleManager): Generator<*, *, *> {
  

  for (; ;) {
    // Take action
    const { device, auth, callback, connectDelay}: ConnectAction = yield take('CONNECT');

    
    const disconnectedChannel = yield eventChannel(emit => {
      const subscription = device.onDisconnected(error => {
        emit({ type: 'DISCONNECTED', error: error });
        if(error){
          logPopup(`BLE:${error.reason}`)
        }
        
      });
      return () => {
        subscription.remove();
      };
    }, buffers.expanding(1));

    const deviceActionChannel = yield actionChannel([
      'DISCONNECT',
      'EXECUTE_TEST',
      'HEART_BEAT',
      'DISCONECT_ALL'
    ]);
    
    try {
      
      yield put(updateConnectionState(ConnectionState.CONNECTING, device));
      if(connectDelay){
        yield delay(connectDelay) // low end devices not able to immidiately connect 
      }
      yield log({ message: 'Connection Options', data: {options: getConnectionOptions(), connectDelay: connectDelay || 0 } })
      yield call([device, device.connect], getConnectionOptions());
      yield put(updateConnectionState(ConnectionState.DISCOVERING, device));
      yield call([device, device.discoverAllServicesAndCharacteristics]);
      yield put(updateConnectionState(ConnectionState.CONNECTED, device));
      if(auth){ // If Auth provided show auth on device
        testTask = yield fork(writePasswordTest, device, auth.base64() );
        testTask = null
      }
     
      if(callback){
        callback(ConnectionState.CONNECTED)
      }
      for (; ;) {
        const { deviceAction, disconnected } = yield race({
          deviceAction: take(deviceActionChannel),
          disconnected: take(disconnectedChannel),
        });
        if (deviceAction) {
          if (deviceAction.type === 'DISCONECT_ALL') {
            break;
          }

          if (deviceAction.type === 'DISCONNECT') {
            yield log({ message: 'Disconnecting command by user...' })
            if (testTask != null) {
              yield cancel(testTask);
            }
            yield put(updateConnectionState(ConnectionState.DISCONNECTING, device));
            yield cancelConnectionIfAny(device)
            yield log({ message: 'Disconnected command success' })
            if(deviceAction.callback){
              deviceAction.callback()
              __DEV__ && console.log("Disconnect callback called")
            }
            break;
          }

          if (deviceAction.type === 'HEART_BEAT') {
            yield fork(hearBeatTest, device);
          }

          if (deviceAction.type === 'EXECUTE_TEST') {
            if(deviceAction.delay){
              yield delay(deviceAction.delay)
            }
            if (testTask != null) {
              yield cancel(testTask);
            }
            testTask = yield fork(executeTest, device, deviceAction);
            testTask = null
            
          }
          
        } else if (disconnected) {
          yield log({ message: 'Disconnected by device...' })
          yield logPopup('Disconnected by device...')
          if (disconnected.error != null) {
            yield logError({ message: disconnected.error })
          }
          break;
        }
      }
    } catch (error) {
      yield put(updateAttempt(device));
      const bleErrror = Object.keys(BleErrorCode).find(key => BleErrorCode[key] === error.errorCode);
      
      yield logError({ message: error })
      __DEV__ && console.log("Error:", error)
      yield logPopup(`Error:${bleErrror}:${error.reason || error.message}. \n`)
      yield bugsnag.notify(error)
    } finally {
      yield cancelConnectionIfAny(device)
      if(callback){
        callback(ConnectionState.DISCONNECTED)
      }
      
      
      disconnectedChannel.close();
      yield put(testFinished(''));
      yield put(updateConnectionState(ConnectionState.DISCONNECTED, device));
    }
  }
}

function* executeTest(
  device: Device,
  test: ExecuteTestAction,
): Generator<*, *, *> {
  const start = Date.now();
  const result = yield call(GLTimerTests[test.id].execute, device, test.value);
  if (result) {
    yield log({ message: 'Test finished successfully! (' + (Date.now() - start) + ' ms)' })
    if(test.callback){
      test.callback("SUCCESS")
    }
  } else {
    yield log({ message: 'Test failed! (' + (Date.now() - start) + ' ms)' })
    if(test.callback){
      test.callback("FAILED")
    }
  }
  yield put(testFinished(test.id));
}
