// @flow

import React, { Component, useEffect } from 'react';
import { connect as reduxConnect } from 'react-redux';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert
} from 'react-native';
import {
  type ReduxState,
  connect,
  disconnect,
  executeTest,
  forgetSensorTag,
  ConnectionState,
} from './Reducer';

import { Device, State as BleState } from 'react-native-ble-plx';
import { GLTimerTests, type SensorTagTestMetadata } from './tests';
import PerpheralListItem from './PerpheralListItem';

type Props = {
  sensorTag: ?Device,
  connectionState: $Keys<typeof ConnectionState>,
};

type State = {
  showModal: boolean,
};

const Registrar =(props) => {
    const {peripherals=[]} = props
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5a070f" />
        <View style={{ padding: 10 }}>
        <Text style={styles.textStyle} numberOfLines={1}>
          Connection: {props.connectionState}/ BLE:{props.bleState}
        </Text>
        <View style={styles.scroll}>
          {(peripherals.length == 0) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>No peripherals</Text>
            </View>
          }
          <FlatList
            removeClippedSubviews={false}
            style={{marginBottom: 50 }}
            data={peripherals}
            renderItem={({ item }) => <PerpheralListItem 
              total_characteristics={item.total_characteristics} 
              item={item} 
            />}
            keyExtractor={item => item.id}
          />

        </View>
      </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  textStyle: {
    fontSize: 12,
  },

  buttonStyle: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  disabledButtonStyle: {
    backgroundColor: '#ccc',
    color: '#919191',
  },
});

export default reduxConnect(
  (state: ReduxState): $Shape<Props> => ({
    bleState: state.BTService.bleState,
    peripherals: Object.values(state.BTService.peripherals),
    connectionState: state.BTService.connectionState,
  }),
  {},
)(Registrar);
