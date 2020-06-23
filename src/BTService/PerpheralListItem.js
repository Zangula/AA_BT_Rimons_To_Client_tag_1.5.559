import React, { useEffect, useState, memo } from 'react';
import { atob, btoa } from 'bt-app/Utils/base64'
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Picker,
  TextInput,
  Alert,
} from 'react-native';
import { connect as reduxConnect } from 'react-redux';
import ProgramModel from './models/program';
import ControlModel from './models/control';
import DateTimeModel from './models/date_time';
import DeviceFamily from './models/family';

import {
  convertBase64ToBinary
} from 'bt-app/Utils/base64';

import {
  type ReduxState,
  connect,
  disconnect,
  executeTest,
  heartBeat,
  ConnectionState,
} from './Reducer';
import {
  GLTimerTests
} from './tests';

import { log } from 'bt-app/Utils/logger';
import HearBeatProvider from './HeartBeatProvider'
const isSensorTagReadyToConnect = (props): boolean => {
  return (
    props.connectionState === ConnectionState.DISCONNECTED
  );
}

const isSensorTagReadyToDisconnect = (props): boolean => {
  return props.connectionState === ConnectionState.CONNECTED;
}

const isSensorTagReadyToExecuteTests = (props): boolean => {
  return (
    props.connectionState === ConnectionState.CONNECTED
  );
}

const PerpheralListItem = ({ item, ...props }) => {
  const [viewType, setViewType] = useState('data')
  const [commandbase64, setCommand] = useState("")
  const [selectedCharacteristicIndex, setSelectedCharacteristicIndex] = useState(null)
  const {
    overflowServiceUUIDs,
    isConnectable,
    solicitedServiceUUIDs,
    txPowerLevel,
    localName,
    serviceUUIDs,
    serviceData,
    manufacturerData,
    mtu,
    rssi,
    name,
    connectionState,
    characteristics = [],
    id, } = item
  const selectedCharacteristic = characteristics[selectedCharacteristicIndex] || null;

  const color = isSensorTagReadyToDisconnect(item) ? 'green' : '#fff';

  const handleChangeView = () => {
    setViewType(viewType == 'data' ? 'commandbase64' : 'data')
  }

  const handleSendCharacteristicCommand = async () => {
    let message = null
    let WriteResponse = {}
    if (!message && !item.id) { message = "Conection ID not available" }
    if (!message && !selectedCharacteristic) { message = "Charactristic not selected" }
    if (!message && !commandbase64) { message = "Please Enter command base64" }
    if (message) {
      Alert.alert("Alert", message)
      return false
    }
    if (selectedCharacteristic.isWritableWithResponse) {
      try {

        log({
          message: `Writing to ${selectedCharacteristic.uuid}`, data: {
            commandbase64,
          }
        })

        WriteResponse = await item.writeCharacteristicWithResponseForService(
          selectedCharacteristic.serviceUUID,
          selectedCharacteristic.uuid,
          commandbase64
        )

        log({
          message: `Writing Success ${selectedCharacteristic.uuid}`, data: {
            valuebase64: WriteResponse.value,
          }
        })

      } catch (error) {
        log({
          message: `Writing Error ${selectedCharacteristic.uuid}`, data: {
            error: error.message
          }
        })
      }
    } else {
      log({
        message: `Not Writable Characteristic: ${selectedCharacteristic.uuid}`, data: {
          commandbase64,
        }
      })
    }

  }

  const handlleDeviceTest = (test) => {
    test && props.executeTest(test)
  }
  
  const handlleDeviceSetTime =()=>{
    const deviceInfo = new DeviceFamily(item)
    const date_time = new DateTimeModel({sensorType: deviceInfo.familyName})
    log({message: `Set Time Initiated ${ date_time.base64() }`, data: { date_time: date_time.pretty() }})
    props.executeTest(GLTimerTests.WRITE_DATE.id, date_time )
  }

  const handlleDeviceSetControl =()=>{
    const deviceInfo = new DeviceFamily(item)
    const control = new ControlModel({sensorType: deviceInfo.familyName, base64: commandbase64} )
    log({message: `Set Control Initiated ${ control.base64() }`, data: { control: control.pretty() }})
    props.executeTest(GLTimerTests.WRITE_CONTROL.id, control)
  }

  const handlleDeviceSetProgram =()=>{
    const deviceInfo = new DeviceFamily(item)
    const program = new ProgramModel({sensorType: deviceInfo.familyName, base64: commandbase64} )
    log({message: `Set Program Initiated ${ program.base64() }`, data: { program: program.pretty() }})
    props.executeTest(GLTimerTests.WRITE_PROGRAM.id, program.base64() )
  }

  
  


  const handleConnection = () => {
    if (isSensorTagReadyToDisconnect(item)) {
      props.disconnect(item)
      return
    }
    props.connect(item)

  }

  return (
    <View style={[styles.row, { backgroundColor: color }]}>
      <View style={styles.rowButtons}>
        {isSensorTagReadyToDisconnect(item) &&
          <>
            <HearBeatProvider device={item} isConnected={isSensorTagReadyToDisconnect(item)} />
            {viewType == 'commandbase64' &&
              <>
                <TouchableHighlight style={[styles.button, commandbase64 ? {} : { backgroundColor: "#ccc" }]} onPress={handleSendCharacteristicCommand}>
                  <Text style={styles.buttonText}> {"Send "} </Text>
                </TouchableHighlight>
              </>
            }
            <TouchableHighlight style={styles.button} onPress={handleChangeView}>
              <Text style={styles.buttonText}> {`${viewType == 'data' ? 'command' : 'data'} View`} </Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.button} onPress={() => handlleDeviceTest(GLTimerTests.READ_ALL_CHARACTERISTICS.id)} >
              <Text style={styles.buttonText}> Read All Services </Text>
            </TouchableHighlight>
          </>
        }

        <TouchableHighlight style={styles.button} onPress={handleConnection}>
          <Text style={styles.buttonText}> {isSensorTagReadyToDisconnect(item) ? "Disconnect" : "Connect"} </Text>
        </TouchableHighlight>
      </View>
      <View style={styles.rowButtons}>
        {isSensorTagReadyToDisconnect(item) && viewType == 'commandbase64' &&
          <>
            <TouchableHighlight style={styles.button} onPress={() => handlleDeviceTest(GLTimerTests.READ_DEVICE.id)} >
              <Text style={styles.buttonText}> R/Device </Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.button} onPress={() => handlleDeviceTest(GLTimerTests.READ_STATUS.id)} >
              <Text style={styles.buttonText}> R/Status </Text>
            </TouchableHighlight>
            
            <TouchableHighlight style={styles.button} onPress={ handlleDeviceSetControl} >
              <Text style={styles.buttonText}> S/Control </Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.button} onPress={() => handlleDeviceTest(GLTimerTests.READ_PROGRAM.id)} >
              <Text style={styles.buttonText}> R/Program </Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.button} onPress={ handlleDeviceSetProgram } >
              <Text style={styles.buttonText}> S/Program </Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.button} onPress={() => handlleDeviceTest(GLTimerTests.READ_DATE.id)} >
              <Text style={styles.buttonText}> R/Time </Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.button} onPress={ handlleDeviceSetTime } >
              <Text style={styles.buttonText}> S/Time </Text>
            </TouchableHighlight>
          </>
        }
      </View>
      <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 4 }}>RSSI: {item.rssi} / {item.name || item.manufacturerDataDecoded} / {item.id} </Text>
      {viewType == 'data' &&
        <View>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 2 }}>{JSON.stringify({
            connectionState,
            overflowServiceUUIDs,
            isConnectable,
            solicitedServiceUUIDs,
            txPowerLevel,
            localName,
            serviceUUIDs,
            serviceData,
            manufacturerData,
            mtu,
            rssi,
            name,
            characteristics: characteristics.map(characteristic => {
              return ({
                uuid: characteristic.uuid,
                value: characteristic.value,
                valueDecoded: characteristic.valueDecoded
              })
            })
          })}</Text>
        </View>
      }
      {isSensorTagReadyToDisconnect(item) && viewType == 'commandbase64' &&
        <View style={styles.commandbase64}>

          <Picker
            selectedValue={selectedCharacteristic ? selectedCharacteristic.uuid : null}
            style={{}}
            textStyle={{ fontSize: 10 }}
            onValueChange={(itemValue, itemIndex) => {
              const c = characteristics[itemIndex - 1] || {}
              setSelectedCharacteristicIndex(itemIndex - 1)
              log({
                message: `Changed to ${itemValue}`, data: {
                  uuid: c.uuid,
                  value: c.value,
                  valueDecoded: c.valueDecoded
                }
              })
            }
            }>
            <Picker.Item key={'select'} label="Select Characterstic " value={null} />
            {Array.isArray(characteristics) ? characteristics.map((characteristic, index) => <Picker.Item key={`${characteristic.uuid}-${index}`} label={characteristic.uuid || 'Unknown'} value={characteristic.uuid} />) : null}
          </Picker>
          {selectedCharacteristic &&
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ marginHorizontal: 8, fontSize: 10 }} >Service: {selectedCharacteristic.serviceUUID}</Text>
              <Text style={{ marginHorizontal: 8, fontSize: 10 }} >
                Value: {selectedCharacteristic.value || 'N/A'}
                {"   "}
                Decoded: {selectedCharacteristic.valueDecoded || 'N/A'}
              </Text>
              <Text style={{ marginHorizontal: 8, fontSize: 10 }} >
                {selectedCharacteristic.isReadable ? 'Readable' : 'NotReadable'}/
                {selectedCharacteristic.isWritableWithResponse ? 'Writable' : 'NotWritable'}
              </Text>
            </View>
          }

          <TextInput placeholder={"Command"} style={styles.text} value={commandbase64} onChangeText={t => setCommand(t)} />

        </View>
      }

    </View>
  );
}

const styles = StyleSheet.create({
  commandbase64: {
    paddingVertical: 15,
  },
  text: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#000",
    padding: 2,
    marginHorizontal: 8,
  },

  row: {
    margin: 4
  },
  rowButtons: {
    marginTop: 4,
    maxWidth: "100%",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexDirection: "row"
  },

  button: {
    backgroundColor: "blue",
    marginHorizontal: 4,
    paddingVertical: 1,
    marginVertical: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 10
  }
});

export default reduxConnect(
  (state: ReduxState): $Shape<Props> => ({
    bleState: state.BTService.bleState,
    connectionState: state.BTService.connectionState,
  }),
  {
    connect,
    disconnect,
    heartBeat,
    executeTest,
  },
)( memo(PerpheralListItem) );
