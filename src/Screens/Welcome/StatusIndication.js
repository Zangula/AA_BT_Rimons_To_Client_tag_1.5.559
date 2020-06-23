import React, { Component, useEffect } from "react"
import {
    ImageBackground,
    Image,
    Modal,
    SectionList,
    View,
    Text,
    Dimensions,
    TouchableOpacity,


} from "react-native"
import styles from './styles';
import {
    ConnectionState,
} from '../../BTService/Reducer';
import {
    GLTimerTests
} from '../../BTService/tests';
import HeartBeatProvider from '../../BTService/HeartBeatProvider'
import { dynamicSize, getFontSize } from '../../components/dynamicsize'
const { width, height } = Dimensions.get('window')

import welcomicons from "./icon"

export const DeviceIndicaton = ({ deviceService, item, index, ...props }) => {
    
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    const {status = {} } = item 
    
    return (
        <View style={{ height: dynamicSize(40), alignItems: "center", justifyContent: "flex-end", flexDirection: "row", alignSelf: "flex-end", width: width - dynamicSize(180), borderTopWidth: 1, borderTopColor: "grey", marginRight: dynamicSize(10) }}>
            <HeartBeatProvider device={deviceService} isConnected={isConnected} />
            { status.seasonalAdjustmentSupported && status.waterBudget != 100 &&
                <TouchableOpacity style={{marginHorizontal: dynamicSize(4)}}>
                    <Text> {status.waterBudget}% </Text>
                </TouchableOpacity>
            }
            { isConnected &&
                <TouchableOpacity style={{ marginHorizontal: dynamicSize(4), }}>
                    <Image style={{width: 25, height: 25}} resizeMode= 'cover' source={status.isBatteryLow == true ? welcomicons.batteryEmptyDark :  welcomicons.batteryOkDark } resizeMode="contain" />
                </TouchableOpacity>
            }
            
        
            <BluetoothIcon isConnected={!!deviceService.updated_at} />
            
            
            { status.rainOff > 0 &&
                <TouchableOpacity style={{marginHorizontal: dynamicSize(4)}}>
                    <Image source={welcomicons.rainOff } resizeMode="contain" />
                </TouchableOpacity>
            }
            
                
        </View>

    )
}

export const BluetoothIcon =({isConnected}) =>{
    return(
        <TouchableOpacity style={[{ marginHorizontal: dynamicSize(4), backgroundColor:  isConnected ? "rgba(34, 167, 240, 1)" : null, borderRadius: 30, padding: 2, height: 30, }]}>
            <Image style={{tintColor: isConnected ? "rgba(255, 255, 255, 1)" : null}} source={isConnected ? welcomicons.bluetoothOn : welcomicons.bluetoothOff } resizeMode="contain" />
        </TouchableOpacity>
    )
}

