// @flow

import { put, call, delay } from 'redux-saga/effects';
import {atob, btoa } from 'bt-app/Utils/base64'
import {
  Device,
  Service,
  Characteristic,
  Descriptor,
  BleError,
  BleErrorCode,
  BleManager,
} from 'react-native-ble-plx';
import { log, logError, logPopup } from 'bt-app/Utils/logger';
import {
  updateDeviceCharacteristics,
  deviceProgramFound,
  deviceStatusFound,
  deviceDateFound,
  heartBeatFound,
  deviceSerialFound,
} from '../Reducer';

import ProgramModel from '../models/program';
import ControlModel from '../models/control';
import StatusModel from '../models/status';
import DateTimeModel from '../models/date_time';
import DeviceFamily from '../models/family';
const PULSE = "//8="

export type SensorTagTestMetadata = {
  id: string,
  title: string,
  execute: (device: Device) => Generator<any, boolean, any>,
};

export const GLTimerTests: { [string]: SensorTagTestMetadata } = {
  READ_ALL_CHARACTERISTICS: {
    id: 'READ_ALL_CHARACTERISTICS',
    title: 'Read all characteristics',
    execute: readAllCharacteristics,
  },
  READ_STATUS: {
    id: 'READ_STATUS',
    title: 'Read Status',
    execute: readStatus,
  },
  READ_PROGRAM: {
    id: 'READ_PROGRAM',
    title: 'Read Program',
    execute: readProgram,
  },
  READ_DATE: {
    id: 'READ_DATE',
    title: 'Read Date',
    execute: readDate,
  },
  WRITE_DATE: {
    id: 'WRITE_DATE',
    title: 'Write Date',
    execute: writeDate,
  },
  WRITE_CONTROL: {
    id: 'WRITE_CONTROL',
    title: 'Write Control',
    execute: writeControl,
  },
  WRITE_PROGRAM: {
    id: 'WRITE_PROGRAM',
    title: 'Write Program',
    execute: writeProgram,
  },
  READ_DEVICE:{
    id: 'READ_DEVICE',
    title: 'Read Device',
    execute: readDevice,
  },
  WRITE_DEVICE:{
    id: 'WRITE_DEVICE',
    title: 'Write Device',
    execute: writeDevice,
  },
  WRITE_PASSWORD:{
    id: 'WRITE_PASSWORD',
    title: 'Write Password',
    execute: writePasswordTest,
  }
};
export const getConnectionOptions =() =>{
  if(process.env.reduxStore){
    return({timeout: process.env.reduxStore.getState().internal.connectionTimeout, refreshGatt: 'OnConnected'})
  }
}


export function* disconnectAll(manager: BleManager, devices: Array<Device>, callback: ?Function ): Generator<*, boolean, *> {
  if(callback && devices.length ==0){
    callback()
  }
  for (let index = 0; index < devices.length; index++) {
    const peripheral = devices[index];
    try {
      if(yield call([peripheral, peripheral.isConnected]) ){
        yield call([manager, manager.cancelDeviceConnection], peripheral.id);
      }
    }catch (error) {
      __DEV__ && console.log(` Device not connected ${peripheral.id}`)
    }
    if(callback && index == devices.length -1){ // last item of loop
      yield delay(25)
      callback()
    }
  } 
  return true
}

export function* cancelConnectionIfAny(device: Device ): Generator<*, boolean, *> {
  try {
    if(yield call([device, device.isConnected]) ){
      yield call([device, device.cancelConnection]);
      return true
    }else{
      return false
    }
  } catch (error) {
    __DEV__ && console.log(` Device not connected ${device.id}`)
    return false
  }
}

export function* hearBeatTest(device: Device, pulse = PULSE ): Generator<*, boolean, *> {
  try {
        const deviceInfo = new DeviceFamily(device)
        if(!deviceInfo.isGalconTimer){
          throw new Error("Device is not a galcon timer")
        }
        const services: Array<Service> = yield call([device, device.services]);
        const res = yield call(
          [device, device.writeCharacteristicWithResponseForService],
          deviceInfo.family.UUIDMapping.time_date.service,
          deviceInfo.family.UUIDMapping.time_date.characteristic.HEART, 
          pulse, 'HEART_BEAT'
        )
        yield put(heartBeatFound(device))       
  } catch (error) {
    console.log('Heart Beat Error', error)
    yield logError({ message: 'Heart Beat error' , data:{error: error.message} })
  }
}

function* readAllCharacteristics(device: Device): Generator<*, boolean, *> {
  try {
    let structuredCharacteristics: Array<Characteristic> = []
    const services: Array<Service> = yield call([device, device.services]);
    yield hearBeatTest(device)
    for (const service of services) {
      yield log({ message: 'Found service: ' + service.uuid })
      const characteristics: Array<Characteristic> = yield call([
        service,
        service.characteristics,
      ]);

      for (const characteristic of characteristics) {
        yield log({ message: 'Found characteristic: ' + characteristic.uuid })
        let structuredCharacteristic = {
          ...characteristic,
          descriptors: [],
        }
        console.log("characteristic", characteristic)
        if (characteristic.uuid === '00002a02-0000-1000-8000-00805f9b34fb')
          continue;

        const descriptors: Array<Descriptor> = yield call([
          characteristic,
          characteristic.descriptors,
        ]);

        for (const descriptor of descriptors) {
          let structuredDescriptor = {...descriptor}
          yield log({ message: '* Found descriptor: ' + descriptor.uuid })
          const d: Descriptor = yield call([descriptor, descriptor.read]);
          yield log({ message: 'Descriptor value: ' + (d.value || 'null') })
          structuredDescriptor = { ...structuredDescriptor, value: d.value }
          if (d.uuid === '00002902-0000-1000-8000-00805f9b34fb') {
            yield log({ message: 'Skipping CCC' })
            continue;
          }
          try {
            yield call([descriptor, descriptor.write], 'AAA=');
          } catch (error) {
            const bleError: BleError = error;
            if (bleError.errorCode === BleErrorCode.DescriptorWriteFailed) {
              yield log({ message: 'Cannot write to: ' + d.uuid })
            } else {
              throw error;
            }
          }
          structuredCharacteristic.descriptors.push(structuredDescriptor)
        }

        if (characteristic.isReadable) {
          yield log({ message: 'Reading value...' })
          var c = yield call([characteristic, characteristic.read]);
          const valueDecoded = atob(c.value)
          yield log({ message: 'Got base64 value: ' + c.value, data: { value: c.value, valueDecoded } })

          structuredCharacteristic = {
            ...structuredCharacteristic,
            valueDecoded,
            value: c.value
          }
        }
        structuredCharacteristics.push(structuredCharacteristic)
      }
    }

    yield put(updateDeviceCharacteristics(device, structuredCharacteristics))
  } catch (error) {
    yield logError({ message: error })
    return false;
  }

  return true;
}

function* readStatus(device: Device): Generator<*, boolean, *> {
  try {
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    yield hearBeatTest(device, deviceInfo.statusPulse())
    const res = yield call(
      [device, device.readCharacteristicForService],
      deviceInfo.family.UUIDMapping.irregation.service,
      deviceInfo.family.UUIDMapping.irregation.characteristic.status, 
      'DEVICE_STATUS'
    )
    if(res.value){
      const status = yield new StatusModel(res.value)
      yield put(deviceStatusFound(device,{ status, valve: res.value}))
      yield log({ message: `Read Status Analysis: ${res.value}`, data:{status: status.pretty() } })
      return status
    }
    return false
    
  } catch (error) {
    console.log('Read Status Error', error)
    yield logError({ message: 'Read Status error' , data:{error: error.message} })
    return false
  }
}

function* readDate(device: Device ): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Read Date: Testing Read Date' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    yield hearBeatTest(device)
    const res = yield call(
      [device, device.readCharacteristicForService],
      deviceInfo.family.UUIDMapping.time_date.service,
      deviceInfo.family.UUIDMapping.time_date.characteristic.gal_TD, 
      'DEVICE_READ_DATE'
    )
    if(res.value){
      const date = yield new DateTimeModel({ sensorType: deviceInfo.familyName, base64: res.value})
      yield put(deviceDateFound(device,{date}))
      yield log({ message: `Read Date: ${res.value}`,data:{date: date.pretty() }})
      return true
    }
    return false
   
  } catch (error) {
    console.log('Read Date Error', error)
    yield logError({ message: 'Read Date error' , data:{error: error.message} })
    return false
  }
}

function* writeDate(device: Device,  model: DateTimeModel): Generator<*, boolean, *> {
  try {
    yield log({ message: `Write Date: Setting Device Date`,data: {date_time: model.pretty() } })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    yield hearBeatTest(device, model.datePulse() )
    const base64 = model.base64()
    const res = yield call(
      [device, device.writeCharacteristicWithResponseForService],
      deviceInfo.family.UUIDMapping.time_date.service,
      deviceInfo.family.UUIDMapping.time_date.characteristic.set_TD, 
      base64,
      'DEVICE_DATE'
    )
    yield log({ message: `Write Date: ${res.value}:: ${base64}`})
    yield hearBeatTest(device)
    yield delay(300)
    yield readDate(device)

  } catch (error) {
    console.log('Write Date Error', error)
    yield logError({ message: 'Write Date error' , data:{error: error.message} })
  }
}

function* writeControl(device: Device, model: ControlModel): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Write Control: Testing Write Control' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);

    const base64 = model.base64()
    yield hearBeatTest(device, model.controlPulse() )
    const res = yield call(
      [device, device.writeCharacteristicWithResponseForService],
      deviceInfo.family.UUIDMapping.irregation.service,
      deviceInfo.family.UUIDMapping.irregation.characteristic.control,
      base64, 
      'DEVICE_CONTROL'
    )
    yield hearBeatTest(device)
    yield readStatus(device) // Open/close operation takes time on timer its bit resolved to open in first read
    yield delay(2000)
    yield log({ message: `Write Control:: Valve ${model.valveNumber}: ${res.value}::${base64}` })
    yield readStatus(device) 


    return true
  } catch (error) {
    console.log('Write Control Error', error)
    yield logError({ message: 'Write Control error' , data:{error: error.message} })
    return false
  }
}

function* readProgram(device: Device, models: Array<ProgramModel>): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Read Program: Testing Read Program' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    let program = null, res = null
    const services: Array<Service> = yield call([device, device.services]);
    for (const model of models) {
      yield delay(20)
      yield hearBeatTest( device, model.programPulse() )
      yield delay(200)
      res = yield call(
        [device, device.readCharacteristicForService],
        deviceInfo.family.UUIDMapping.irregation.service,
        deviceInfo.family.UUIDMapping.irregation.characteristic.program, 
        'DEVICE_READ_PROGRAM'
      )
      yield log({ message: `Read Program: valve-${model.valveNumber}::${res.value}`})
      program = new ProgramModel({ sensorType: deviceInfo.familyName, valveNumber: model.valveNumber, base64: res.value})
      yield put(deviceProgramFound(device,{program}))
      yield log({ message: `Read Program Analysis: valve-${program.valveNumber}::${res.value}`, data:{ program: program.pretty() }})
    }
    return true
  } catch (error) {
    console.log('Read Program Error', error)
    yield logError({ message: 'Read Program error' , data:{error: error.message} })
    return false
  }
}

function* writeProgram(device: Device, models: Array<ProgramModel> ): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Write Program: Testing Write Program' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    for (const model of models) {
        const base64 = model.base64()
        yield delay(20)
        yield hearBeatTest(device, model.programPulse() )
        yield delay(200)
        const res = yield call(
          [device, device.writeCharacteristicWithResponseForService],
          deviceInfo.family.UUIDMapping.irregation.service,
          deviceInfo.family.UUIDMapping.irregation.characteristic.program, 
          base64,
          'DEVICE_WRITE_PROGRAM'
        )
        yield log({ message: `Write Program: valve${ model.valveNumber}::${res.value}::${base64}`, data:{ program: model.pretty() } })
    }
    
    yield hearBeatTest(device)
    yield delay(100)
    yield readProgram(device, models)
    return true
  } catch (error) {
    console.log('Write Program Error', error)
    yield logError({ message: 'Write Program error' , data:{error: error.message} })
    return false
  }
}

function* readDevice(device: Device): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Read Device: A series of read' })
    yield readDate(device)
    const status = yield readStatus(device)
    if(status){
      let programs = []
      for (let valveNum = 1; valveNum <= status.valvesNumber; valveNum++) {
        programs= [...programs, new ProgramModel({sensorType: status.sensorType, valveNumber: valveNum })]
      }
      yield readProgram(device, programs)
    }
    return true
  } catch (error) {
    console.log('Read Device Error', error)
    yield logError({ message: 'Read Device error' , data:{error: error.message} })
    return false
  }
}

function* writeDevice(device: Device, value: {date_time?: DateTimeModel, programs?: Array<ProgramModel>, control?: ControlModel} ): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Write Device: Testing Write Device' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    
    if(value.date_time){
      yield hearBeatTest(device, value.date_time.datePulse() )
      const base64 = value.date_time.base64()
      const resDate = yield call(
        [device, device.writeCharacteristicWithResponseForService],
        deviceInfo.family.UUIDMapping.time_date.service,
        deviceInfo.family.UUIDMapping.time_date.characteristic.set_TD, 
        base64,
        'DEVICE_DATE'
      )
      yield log({ message: `Write Date: ${resDate.value}`})
    }

   
    if(value.control){
      yield hearBeatTest(device, value.control.controlPulse() )
      const base64 = value.control.base64()
      const resControl = yield call(
        [device, device.writeCharacteristicWithResponseForService],
        deviceInfo.family.UUIDMapping.irregation.service,
        deviceInfo.family.UUIDMapping.irregation.characteristic.control, 
        base64,
        'DEVICE_WRITE_CONTROL'
      )
    }

    if(value.programs){
      for (const model of value.programs) {
        yield hearBeatTest(device, model.programPulse())
        const base64 = model.base64()
        const resProg = yield call(
          [device, device.writeCharacteristicWithResponseForService],
          deviceInfo.family.UUIDMapping.irregation.service,
          deviceInfo.family.UUIDMapping.irregation.characteristic.program, 
          base64,
          'DEVICE_WRITE_PROGRAM'
        )
        yield log({ message: `Write Device:${resProg.value}` })
      }
      yield readProgram(device, value.programs)
    }
    yield readStatus(device)
    return true
  } catch (error) {
    console.log('Write Device Error', error)
    yield logError({ message: 'Write Device error' , data:{error: error.message} })
    return false
  }
}

export function* writePasswordTest(device: Device, value: String): Generator<*, boolean, *> {
  try {
    yield log({ message: 'Write Password: Testing Write Password' })
    const deviceInfo = new DeviceFamily(device)
    if(!deviceInfo.isGalconTimer){
      throw new Error("Device is not a galcon timer")
    }
    const services: Array<Service> = yield call([device, device.services]);
    yield hearBeatTest(device)
    const res = yield call(
      [device, device.writeCharacteristicWithResponseForService],
      deviceInfo.family.UUIDMapping.authorization.service,
      deviceInfo.family.UUIDMapping.authorization.characteristic.password, 
      value,
      'DEVICE_WRITE_PASSWORD'
    )
    yield log({ message: `Write Password:${res.value}`})
    return true
  } catch (error) {
    console.log('Write Password Error', error)
    yield logError({ message: 'Write Password error' , data:{error: error.message} })
    return false
  }
}



