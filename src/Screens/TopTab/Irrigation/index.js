//import liraries
import React, { Component , memo } from 'react';
import { I18nManager, Image, TouchableOpacity, View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';

import { dynamicSize, getFontSize } from '../../../components/dynamicsize'
import NextIrrigation from '../../../components/NextIrrigation';


import IrrigationCard from './IrrigationCard';
import {
    type ReduxState,
    executeTest,
} from 'bt-app/BTService/Reducer';
import { connect as reduxConnect } from 'react-redux';
import { withNavigationFocus } from '@react-navigation/compat';
const { width, height } = Dimensions.get('window')

const IrrigatinData = ({peripheral,navigation, ...props}) => {
    if(!peripheral){return null}
    const valveData = Object.values(peripheral.localSettings.programs || peripheral.programs)
    const valvesInfo = peripheral.localSettings.valvesInfo
        return (
            <View style={styles.container}>
                <View style={{marginVertical: dynamicSize(10), marginHorizontal: dynamicSize(10), borderRadius: 8, backgroundColor: "rgba(34, 167, 240, 1)"}}>
                    <NextIrrigation
                        navigation={navigation}
                        onPress={() => navigation.navigate("Program") }
                        style={{
                            marginVertical: dynamicSize(8),
                        }}
                        status={"Next Irrigation: "}
                    />
                </View>
                <FlatList
                    data={valveData}
                    renderItem={({ item , index }) => <IrrigationCard navigation={navigation} valveInfo={valvesInfo[index]} program={item} />}
                    keyExtractor={item => item.id}
                />
            </View>
        );
    
}
// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)(memo(withNavigationFocus(IrrigatinData)));

