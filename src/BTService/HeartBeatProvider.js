import React, { useEffect, useState, useRef , memo } from 'react';
import { atob, btoa } from '../Utils/base64'
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
import moment from 'moment'

import {useInterval} from 'bt-app/Utils/common';
import {
  convertBase64ToBinary
} from 'bt-app/Utils/base64';

import {
  type ReduxState,
  heartBeat,
  executeTest,
} from './Reducer';
import {
  GLTimerTests
} from './tests';


import { log } from 'bt-app/Utils/logger';



const PLUSE_RATE = 10 * 1000
const DELTA_T = PLUSE_RATE/1000 + 2 // +- error rate
const HeartBeatProvider = ({ status_updated_at,  device, isConnected, ...props }) => {
  const [pulse, setPulse] = useState(PLUSE_RATE)

  const providePulse = () => {
    props.heartBeat()
    if(status_updated_at){
      const duration = moment.duration(moment(new Date()).diff(moment(status_updated_at)));
      console.groupCollapsed("status_updated_at", status_updated_at, duration.asSeconds() )
      if(duration.asSeconds() >= DELTA_T ){
        props.executeTest(GLTimerTests.READ_STATUS.id)
      }else{
        __DEV__ && console.log("status_updated_cancelled", new Date())
      }
      console.groupEnd()
    }
  }

  useInterval(() => {
    setPulse(prevPulse => {
      if (prevPulse <= 0) {
        providePulse()
        return PLUSE_RATE
      }
      return prevPulse - 1000
    })
  }, !isConnected ? null : 1000);
  if(!__DEV__){
    return null
  }
  return (
    <View>
      <Text style={{ color: 'red', fontFamily: "ProximaNova-Regular", }}> {pulse / 1000} </Text>
    </View>
  )
}

export default reduxConnect(
  (state: ReduxState, props): $Shape<Props> => {
    const status_updated_at = (state.peripherals.list.find(d => props.device && d.id == props.device.id) || {} )['status_updated_at']
    return {  bleState: state.BTService.bleState,
      connectionState: state.BTService.connectionState,
      status_updated_at  ,
    }
  },
  { heartBeat, executeTest },
)( memo(HeartBeatProvider) );