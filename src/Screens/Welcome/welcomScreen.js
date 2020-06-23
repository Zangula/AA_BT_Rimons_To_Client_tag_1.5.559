import React, { useState,useEffect } from "react"
import {
  ImageBackground,
  Image,
  Modal,
  SectionList,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  AppState
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import styles from './styles';
import {getLocales,uses24HourClock} from "react-native-localize";
import { dynamicSize, getFontSize } from '../../components/dynamicsize'
const { width, height } = Dimensions.get('window')
import {osLocale, setLocalePopup} from '../../I18n'
import welcomicons from "./icon"
import { log, logPopup } from '../../Utils/logger';
import { connect as reduxConnect } from 'react-redux';
import {useTimeout} from 'bt-app/Utils/common';
import {
  type ReduxState,
  connect,
  promptPermisison,
  disconnect,
  disconnectAll,
  executeTest,
  heartBeat,
  ConnectionState,
} from '../../BTService/Reducer';
const window = Dimensions.get('window');
import PeripheralListItem from './PeripheralListItem';
import { useFocusEffect } from '@react-navigation/native';
import {setPeripheral, restartPeripheralScan} from '../../Redux/actions/BTActions';
import AuthorisationModel from '../../BTService/models/authorisation'
import ParingModal from '../../components/Modals/PairingCode'
import {bugsnag} from "../../Utils/bugsnag";
import { useTranslation } from 'react-i18next';
import {
  GLTimerTests
} from '../../BTService/tests';
import {
  setUsing24HourFormat,
  setAppState
} from '../../Redux/actions/InternalAppActions'
import {SUPPORTED_MODELS} from '../../BTService/models/family';
import moment from 'moment'
import {useInterval} from 'bt-app/Utils/common';
import { GlobalColor, TOTAL_ATTEMPT_NUMBER, REFRESH_RATE } from 'bt-app/GlobalConstants'

const isSensorTagReadyToDisconnect = (props): boolean => {
  return props.connectionState === ConnectionState.CONNECTED;
}



const WelcomScreen = ({deviceService, connectionState, navigation, ...props}) =>  {
  const [refreshCount, setRefreshCount] = useState({list: 0, scan: 0})
  const [pairingModelStatus, setpairingModelStatus] = useState({visible: false, auth: new AuthorisationModel() })
  const { t } = useTranslation();
  useFocusEffect(
    React.useCallback(() => {
      setPeripheral(null) 
      setRefreshCount(prevCount => {
        disconnectIfAny( ()=>{
          restartPeripheralScan()
        })
        __DEV__ && console.log("Scan Started , After disconnection")
        return({...prevCount, scan:  REFRESH_RATE.SCAN_TIME})
      })
    }, [])
  );

  const _handleAppStateChange = async (appState) => {
    __DEV__ && console.log("_handleAppStateChange", appState)
    setUsing24HourFormat(uses24HourClock())
    setAppState(appState)
    if(appState.match(/inactive|background/) ) {
      __DEV__ && console.log('App goes to background!');
      disconnectIfAny()
    }
   
  }

  const checkLang = async () =>{
    let systemLocale = osLocale()
    if(systemLocale != await AsyncStorage.getItem('@i18next-async-storage/user-language') )  {
      setLocalePopup(systemLocale)
    }
  }

  useEffect(() => {
    _handleAppStateChange(AppState.currentState)
    AppState.addEventListener('change',_handleAppStateChange);
    checkLang()
    return ()=>{
      AppState.removeEventListener('change',_handleAppStateChange);
      disconnectIfAny()
    }
  }, [])
  //
  // Expected: Every time we navigate to the Scan for timers screen , the app scan for timers
  // 
  // NGB-91


  
  useEffect(() => {
    if(props.bleState != 'PoweredOn'){
      setRefreshCount( prevCount => ({...prevCount, scan: 0}))
    }
    if(props.bleState == 'PoweredOff'){
      props.promptPermisison( ()=>{
         setRefreshCount(prevCount => ({...prevCount, scan:  REFRESH_RATE.SCAN_TIME}))
      });
      return
    } 
    if(props.bleState == 'PoweredOn'){
      setRefreshCount(prevCount => ({...prevCount, scan:  REFRESH_RATE.SCAN_TIME}))
    }    
  }, [props.bleState])

  useInterval(()=>{
    setRefreshCount(prevCount => {
     return({
       list: prevCount.list > 5  ? 0 : prevCount.list + 1,
       scan:  prevCount.scan > 0 ? prevCount.scan - 1 : 0,
      })
      __DEV__ &&  console.log(refreshCount)
    })
  }, REFRESH_RATE.LIST)

  const sensorTagStatus = (): string => {
    return props.bleState == 'PoweredOn' && refreshCount.scan > 0 ? t('COMMON.SEARCHING') : t('WELCOME_SCREEN.START_SCAN')
  }

  const disconnectIfAny = (callback)=>{
    if(props.internal.isHavingScanningPermmision){
      props.disconnectAll(props.unpairedPeripherals, callback)
    }else{
      callback && callback()
    }
  }

  const startScan = ()=>{
    if(props.bleState == 'PoweredOff'){
      props.promptPermisison( ()=>{
         setRefreshCount(prevCount => ({...prevCount, scan:  REFRESH_RATE.SCAN_TIME}))
      });
      return
    }
    if(props.bleState == 'PoweredOn'){
      setRefreshCount(prevCount => {
        disconnectIfAny( ()=>{
          restartPeripheralScan()
        })
        __DEV__ && console.log("Scan Started , After disconnection")
        return({...prevCount, scan:  REFRESH_RATE.SCAN_TIME})
      })
    }
   
  }

  const navigateToTimer = (id)=>{
     // // if not unpaired its paired and naviagte to screen
     setPeripheral(id) 
     navigation.navigate('TimerScreen') // can be done in redux but not needed.
  }

  const onPressItem = (item, device) =>{
    const isConnectedItem = device.connectionState === ConnectionState.CONNECTED
    
    if (!item.paired_at) { // Unpaired Timer
      const auth = new AuthorisationModel()
      setpairingModelStatus({visible: true, auth, deviceID: device.id})
      return
    }

    setRefreshCount( prevCount => {
      navigateToTimer(item.id)
      return({...prevCount, scan: 0})
    })
  }




  const onPairingCallback =(status)=>{
    if(status ==  'CANCELLED' ){
      setpairingModelStatus({...pairingModelStatus, visible: false, deviceID: null})
    }

    if(status ==  'SUCCESS' ){
     
      props.executeTest(GLTimerTests.READ_DEVICE.id,null,()=>{
        setpairingModelStatus( prev => {
          navigateToTimer(prev.deviceID)
          return({...prev,  visible: false, device: null})
        })
       
      })
      setpairingModelStatus({...pairingModelStatus,})
    }

    if(status ==  'FAILED' ){

    }

    
  }

   const isPairable = (item) =>{
     try {
      const pairedIndex = props.pairedPeripherals.findIndex(p => p.id == item.id )
      if(!item.updated_at){ return false}
      if(pairedIndex > -1 ){
        return false // dont show paired device
      }

      const modelName = String((item.localName || "").split("-")[0]).replace(/\D+/g, "")
      if(item.localName == "GL"){ return true }
      return ( SUPPORTED_MODELS.indexOf(modelName) > -1 ) 
     } catch (error) {
       bugsnag.notify(error)
       console.log("error", error)
       return false
     }
    
   }

    const unpairedPeripherals =  props.unpairedPeripherals.filter(isPairable)
    const searchingDisabled = sensorTagStatus() == t('COMMON.SEARCHING')
    return (
      <ImageBackground style={{ flex: 1, }}
        source={welcomicons.backgroundimage}>
        

        <SectionList
            ListHeaderComponent={
              <View style={{ marginTop: dynamicSize(30), alignItems: 'center', width: width, justifyContent: "flex-start", alignSelf: "baseline" }}>
              <TouchableOpacity disabled={searchingDisabled} onPress={startScan} style={{
                backgroundColor: searchingDisabled ? '#ccc' : 'rgba(46, 204, 113, 3)',
                height: dynamicSize(145), width: dynamicSize(145), borderRadius: dynamicSize(80), alignItems: "center", justifyContent: "center",
              }}>
                <Image source={welcomicons.beaconWirelessRemote} resizeMode="contain" />
                <Text numberOfLines={2} 
                  style={{ 
                    width: dynamicSize(85),
                    marginTop: dynamicSize(7), 
                    fontSize: getFontSize(15), 
                    textAlign: "center", 
                    color: "white", 
                    fontFamily: "ProximaNova-Bold",
                    flexWrap: "wrap",
                    }}>
                  { sensorTagStatus() }
                </Text>
              </TouchableOpacity>
            </View>
            }
          sections={[
            { title: 'PAIRED',    data: props.pairedPeripherals    },
            { title: 'UN_PAIRED', data: unpairedPeripherals },
          ]}
          extraData={{
            connectionState,
            refreshCount: refreshCount.list,
          }}
          renderSectionHeader={({ section: { title, data } }) => {
            if(data.length == 0){
              return null
            }
            return(
              <View style={{ width: width - dynamicSize(35), alignSelf: "center" }}>
                <Text style={{ fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold" }}>
                  {t(`WELCOME_SCREEN.${title}_DEVICES`)} 
                </Text>
              </View>
            )
          }}
          renderItem={
            ({ item, index,section:{ title } }) => {
              if( title == 'UN_PAIRED' && !isPairable(item) ){ return null }
            return(
              <PeripheralListItem 
                onPress={onPressItem} 
                isPaired={title == 'PAIRED'} 
                item={item} 
                index={index} />
              )
            }}
        />
         <ParingModal 
            auth={pairingModelStatus.auth}
            deviceID={pairingModelStatus.deviceID}
            visible={ pairingModelStatus.visible}
            onPairingCallback={onPairingCallback} />
      </ImageBackground>
    );
  
}


export default reduxConnect(
  (state) => ({
    testInfo: {
        currentTest: state.BTService.currentTest,
        prevTest: state.BTService.prevTest
    },
    internal: state.internal,
    totalReducers: state.PairedReducer,
    bleState: state.BTService.bleState,
    unpairedPeripherals: Object.values(state.BTService.peripherals),
    pairedPeripherals: state.peripherals.list,
    connectionState: state.BTService.connectionState,
    deviceService: state.BTService.peripherals[state.peripherals.currentDeviceID] || {},
  }),
  {
    promptPermisison,
    connect,
    disconnect,
    disconnectAll,
    executeTest
  },
)(WelcomScreen);

