import React, { useEffect, useState , memo} from "react"
import { I18nManager, Alert, ImageBackground, Image, View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native"

import { dynamicSize, getFontSize } from '../dynamicsize'
import TabIcon from "../TabIcon";
import {withNavigation} from '@react-navigation/compat';
import componentIcons from "../componentIcons"


import { connect as reduxConnect } from 'react-redux';
import {
    type ReduxState,
    executeTest,
    ConnectionState
} from '../../BTService/Reducer';
import {
    GLTimerTests
} from '../../BTService/tests';
import IrrigationIndicator from '../../components/indicators/Irrigation';
import ControlModel from '../../BTService/models/control';
import {
    changeValveStatusLocally
} from '../../Redux/actions/BTActions'
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window')


const StatusCard = ({peripheral, deviceService, openedFrom, valve, hh_left, mm_left, ss_left, navigation, ...props}) => {
    if(!peripheral){ return null }
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    if(valve == 15  || !openedFrom){
        return null
    }
    const { t } = useTranslation();
    let { status: {
            isOpen,
            rainOff,
            sensorType,
            valvesNumber,
        },
    } = peripheral; 
    const programs =  peripheral.localSettings.programs || peripheral.programs
    const program = (programs || {})[valve]
    const isMultipleValvesSupported = valvesNumber > 1
    const onIrrigationEnd = ()=>{
        changeValveStatusLocally(peripheral, false)
    }

    const handleStop = ()=>{
        let newControl = new ControlModel({sensorType})
        newControl.setClose(valve)
        props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl)
        if(openedFrom == "MANUAL"){
            navigation.navigate("Manual")
        }else{
            navigation.navigate("Program")
        }
        if(__DEV__){
            console.log("newControl:", newControl.pretty() )
        }
       
    }
    const handleOnPress = () =>{
        if(openedFrom == "MANUAL"){
            navigation.navigate("Manual")
        }else{
            navigation.navigate("Program")
        }
    }
    

    const valvesInfo = peripheral.localSettings.valvesInfo[valve-1]
    if(!isConnected){
        return null
    }
    return (
        <View style={styles.card}>
            <View style={{ flexDirection: "row", flex: 1}}>     
                <View style={{
                    flex: 0.6,
                    flexDirection: "column",
                    alignCenter: "center", height: height / dynamicSize(5), alignItems: "flex-start",
                    justifyContent: "center",
                    paddingHorizontal: dynamicSize(8),
                }}>
                    <Text style={{
                        marginTop: dynamicSize(8),
                        marginBottom: dynamicSize(8),
                        paddingHorizontal: dynamicSize(8),
                        fontSize: getFontSize(18),
                        textAlign: "left", fontFamily: "ProximaNova-Bold"
                    }}>
                        {
                            openedFrom == "MANUAL" ? (
                                t(`VALVE_STATUS.${openedFrom}`)
                            ):(
                                program && program.programType == 'weekly' ?
                                t(`PROGRAM_SCREEN.PROGRAM_TYPE_WEEKLY`) :
                                t(`PROGRAM_SCREEN.PROGRAM_TYPE_CYCLIC`) 
                            )
                        }

                    </Text>
                    { isMultipleValvesSupported &&
                        <Text style={{
                            fontFamily: "ProximaNova-Regular",
                            paddingHorizontal: 2,
                            marginVertical: 8,
                            textAlign: "left", color: "#ccc",
                        }}>
                            {valvesInfo && valvesInfo.name || t('VALVE_STATUS.VALVE_NUMBER', {number: valve })}
                        </Text>
                    }
                    <TouchableOpacity
                        disabled={!isConnected}
                        onPress={handleStop}
                        style={{
                            alignSelf: "flex-start",
                            width: dynamicSize(90), height: dynamicSize(30), borderRadius: dynamicSize(20),
                            backgroundColor: isConnected ? "rgba(34, 167, 240, 1)" : "#ccc", alignItems: "center", justifyContent: "center"
                        }} >
                        <Text style={{ color: "rgba(255, 255, 255, 1.0)", fontFamily: "ProximaNova-Bold", fontSize: getFontSize(15) }}>{t('COMMON.STOP')}</Text>
                    </TouchableOpacity>

                </View>
                <View style={{flex: 0.4, justifyContent: "center", alignItems: "center"}}>
                    <IrrigationIndicator onEnd={onIrrigationEnd} isOpen={isOpen} hh={hh_left} mm={mm_left} ss={ss_left} />
                </View>
                <TouchableOpacity style={{ width: 50, height: "100%",justifyContent: "center", alignItems: "center"}} onPress={handleOnPress}>
                    <Image  style={{height: 40, width: 40, tintColor: "#4a4a4a", transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} source={componentIcons.chevronRightWhite} />
                </TouchableOpacity>
            </View>
        </View>
    )
}




const styles = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: "row",
        height: height / dynamicSize(4),
        elevation: dynamicSize(0.4),
        borderWidth: dynamicSize(0.5),
        backgroundColor: "white",
        borderColor: "#ddd",
        shadowColor: "#000",
        marginHorizontal: dynamicSize(10),
        marginVertical: dynamicSize(20),
        shadowOpacity: dynamicSize(0.3),
        paddingHorizontal: dynamicSize(4),
    },
    textStyleRain: {
        marginHorizontal: dynamicSize(40),
        fontSize: getFontSize(15),
        textAlign: "left",
        fontFamily: "ProximaNova-Regular",
        color: "grey"

    },

})


export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        connectionState: BTService.connectionState,
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)( memo( withNavigation(StatusCard) ) );