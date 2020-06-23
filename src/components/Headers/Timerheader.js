import React, { useEffect, useRef, useState, memo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  width,
  height,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { dynamicSize, getFontSize } from "../dynamicsize";
import {
  type ReduxState,
  executeTest,
  connect,
  disconnect,
  disconnectAll,
  ConnectionState,
} from '../../BTService/Reducer';
import NavigationsIcons from "../NavigationIcons";
import {
  GLTimerTests
} from '../../BTService/tests';
import DateTimeModel from '../../BTService/models/date_time';
import DeviceFamily from 'bt-app/BTService/models/family';
import { connect as reduxConnect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GlobalColor, TOTAL_ATTEMPT_NUMBER, REFRESH_RATE } from 'bt-app/GlobalConstants'
import { useInterval } from 'bt-app/Utils/common';
import { useIsFocused } from '@react-navigation/native';
import {restartPeripheralScan} from 'bt-app/Redux/actions/BTActions';
import { log, logPopup } from 'bt-app/Utils/logger';

const usePreviousValue = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};


const Header = ({showIndications, heading_key,leftIcon, peripheral, deviceService,testperipheral,appState,prevAppState, ...props}) => {
  if(!peripheral){ return null }
  const { t } = useTranslation();
  const [connectingMessage, setConnectingMessage] = useState({scan: !!testperipheral ? REFRESH_RATE.SCAN_TIME : 0, attempt: 0,})
  const [clockUpdate, setclockUpdate] = useState({attempt: 0 , isLoading: false })
  const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
  let { status: { isBatteryLow, sensorType} } = peripheral;
  const prevdeviceServiceID = usePreviousValue(deviceService.id)
  const isFocused = useIsFocused();
  const [info, setinfo] = useState({ nameMapping: ""})
  const isScanning = connectingMessage.scan > 0
  const isTransitionState = deviceService.connectionState === ConnectionState.CONNECTING ||
  deviceService.connectionState === ConnectionState.DISCOVERING ||
  deviceService.connectionState === ConnectionState.DISCONNECTING
  useInterval(()=>{
    setConnectingMessage(prevCount => {
     return({
       ...prevCount,
       scan:  prevCount.scan > 0 ? prevCount.scan - 1 : 0,
      })
    })
  }, REFRESH_RATE.LIST)

  useEffect(() => {
    var cancelled = null
    if(isScanning && deviceService.id && deviceService.updated_at && appState == 'active' && isFocused && testperipheral == true  && !isConnected ){
      __DEV__ && console.log(
        `Device: ${deviceService.id}, 
        Attempting Connecting: ${isFocused}`, 
        {appState, isFocused, connectionState: deviceService.connectionState, failedAttempt:  deviceService.failedAttempt}
      )
      if( deviceService.failedAttempt <= TOTAL_ATTEMPT_NUMBER ){
        props.connect(deviceService, null,()=>{

        },2000)
      }else{
        setConnectingMessage(prevCount => {
         return({
           ...prevCount,
           scan: 0,
          })
        })
      }
    }
    return ()=>{
      cancelled = true
    }
  }, [deviceService.failedAttempt, deviceService.id,deviceService.updated_at, appState]) 
  
  const cancelAndRetry = () =>{
    setConnectingMessage(prevCount => {
      props.disconnectAll(props.peripherals,()=>{
        restartPeripheralScan()
      })
     return({
       ...prevCount,
       scan: REFRESH_RATE.SCAN_TIME,
      })
    })
    
  }

  useEffect(() => {
    if(isConnected && clockUpdate.attempt < 5){
      handlleDeviceSetTime()
      setclockUpdate({attempt: clockUpdate.attempt + 1, isLoading:false})
    }
    if(peripheral.date.isTimeInsync){
      setclockUpdate({...clockUpdate, isLoading:false})
    }
  }, [ isConnected, peripheral.date.isTimeInsync ])
  


  useEffect(() => {
    if(isConnected){
      __DEV__ && console.log("Reading status", appState)
      props.executeTest(GLTimerTests.READ_STATUS.id, null,()=>{

      }, 1*1000)
    }
    if(!info.nameMapping){
      const family = new DeviceFamily(peripheral)
      setinfo({
        nameMapping: family.nameMapping,
      })
    }
  }, [deviceService.id,appState,isConnected]);

  const handlleDeviceSetTime =()=>{
    try {
      const date_time = new DateTimeModel({sensorType})
      props.executeTest(GLTimerTests.WRITE_DATE.id, date_time, ()=>{

      }, 2 *1000)
    } catch (error) {
      console.log("Cannot update date")
    }
    
  }
  
  const describeName = () =>{
    switch (deviceService.connectionState) {
      case  ConnectionState.CONNECTING :
        return t('COMMON.CONNECTING')
      case  ConnectionState.DISCOVERING :
        return  t('COMMON.DISCOVERING')
      default:
        return peripheral.name ? t("COMMON.DECRIBED_NAME",{modelName: info.nameMapping , name: peripheral.name}) :  info.nameMapping
    }
  }

    return (
      <View
        style={styles.header}
      >
        <View style={{ flex: 1, alignItems: "center",
          justifyContent: "space-between", flexDirection: "row"}}>
          <TouchableOpacity
            onPress={props.Navigation}
            style={{
              zIndex: 1,
              position: "absolute",
              left: dynamicSize(10),
              width: dynamicSize(45),
              height: dynamicSize(45),
              justifyContent: "center", 
              transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]
            }}
          >
            <Image
              style={{
                height: dynamicSize(25),
                width: dynamicSize(25),
                alignSelf: "center"
              }}
              source={leftIcon || NavigationsIcons.menu}
              resizeMode="contain"
            />
          </TouchableOpacity>


          <View style={{
              flex: 1 , 
              paddingRight: dynamicSize(80), 
              paddingLeft: dynamicSize(80) }}>
            <Text
              style={{
                fontFamily: "ProximaNova-Bold",
                fontSize: getFontSize(18),
                color: "white",
                textAlign: "center",
              }}
            >
              { heading_key ? t(`SCREEN_HEADINGS.${heading_key}`) : describeName() }
            </Text>
          </View>

          {showIndications  && (
            <View
              style={{
                justifyContent: "space-between",
                width: dynamicSize(50),
                position: "absolute",
                zIndex: 1,
                right: dynamicSize(10),
                alignSelf: "center",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{ height: dynamicSize(23), width: dynamicSize(23) }}
                onPress={props.notify_press}
              >
                <Image
                  style={{ height: dynamicSize(23), width: dynamicSize(23) }}
                  source={isConnected ? NavigationsIcons.bluetoothOn : NavigationsIcons.bluetoothOff }
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={{}} onPress={props.notify_press}>
                <Image
                  style={[{ height: dynamicSize(23), width: dynamicSize(23) }]}
                  source={isBatteryLow ? NavigationsIcons.batteryLow : NavigationsIcons.batteryOk  }
                  resizeMode="contain"
                />
              </TouchableOpacity>

            </View>
          )}
        </View>
        <View style={{flexDirection: "row" }}>
          { testperipheral == true && isConnected == false && (isScanning || isTransitionState) &&
            <View style={{
                flex: 1, 
                backgroundColor: "red" , 
                flexDirection: "row", 
                paddingHorizontal: dynamicSize(20),
                paddingVertical: dynamicSize(1),  
              }} >
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}}> {t('INFO.SEARCHING_FOR_DEVICE') }</Text>
            </View>
          }
          { isConnected == false && !(isScanning || isTransitionState ) &&
            <View style={{
                flex: 1, 
                backgroundColor: "#4e4e4e" , 
                flexDirection: "row", 
                paddingHorizontal: dynamicSize(20),
                paddingVertical: dynamicSize(1),  
                justifyContent: "space-between"
              }} >
                <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}}> {t('COMMON.DEVICE_OFFLINE') }</Text>
                {  testperipheral == true && 
                     <TouchableOpacity onPress={ cancelAndRetry } style={{  backgroundColor: 'rgba(46, 204, 113, 1)', paddingHorizontal: dynamicSize(10) }} >
                        <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}} > {t('COMMON.RETRY') }</Text> 
                      </TouchableOpacity>
                }
               
            </View>
          
          }
          { isConnected == true && isBatteryLow == true &&
            <View style={{
                flex: 1, 
                backgroundColor: "red" , 
                flexDirection: "row", 
                paddingHorizontal: dynamicSize(20),
                paddingVertical: dynamicSize(1),  
                justifyContent: "center",
              }} >
                <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}}> {t('ERRORS.BATTERY_EMPTY') }</Text>
            </View>
          }
          { isConnected == true && peripheral.date.isTimeInsync == false &&
            <View style={{
                flex: 1, 
                backgroundColor: "red" , 
                flexDirection: "row", 
                justifyContent: "space-between",
                paddingLeft: dynamicSize(20),
                paddingRight: dynamicSize(10),
                paddingVertical: dynamicSize(1),  
              }} >
                <Text style={{color: "#fff"}}> {t('INFO.DECIVE_TIME_NOT_IN_SYNC')}  </Text>
                <View style={{  backgroundColor: 'rgba(46, 204, 113, 1)', paddingHorizontal: dynamicSize(10) }} >
                  { clockUpdate.isLoading && <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}} > {t('COMMON.UPDATE') }</Text> }
                  { !clockUpdate.isLoading && <Text style={{fontFamily: "ProximaNova-Regular",color: "#fff"}} >{t('COMMON.UPDATE_INPROCESS')}  </Text> }
                </View>
            </View>
          }
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  header: {
      height: dynamicSize(75),
      backgroundColor: GlobalColor.primaryThemeColor,
      shadowOpacity: 0.1,
      shadowRadius: dynamicSize(2),
      flexDirection: "column",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  dropDownItem: {
    borderBottomColor: "#e4e6e5",
    borderBottomWidth: dynamicSize(2),
    alignSelf: "center",
    justifyContent: "space-between",
    marginVertical: dynamicSize(10)
  }
});

export default reduxConnect(
  ({BTService, peripherals, internal}): $Shape<Props> => ({
    appState: internal.appState,
    prevAppState: internal.prevAppState,
    bleState: BTService.bleState,
    connectionState: BTService.connectionState,
    deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
    peripheral: peripherals.list.find( d => d.id == peripherals.currentDeviceID),
    peripherals: Object.values(BTService.peripherals),
  }),
  {
    executeTest,
    connect,
    disconnect,
    disconnectAll,
  },
)( memo(Header) );

