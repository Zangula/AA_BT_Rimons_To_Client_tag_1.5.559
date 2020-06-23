import React, { useState, memo, useEffect } from "react"
import { Image, View, StyleSheet, Text, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native"

import { dynamicSize, getFontSize } from '../dynamicsize'

import TabIcon from "../TabIcon";

import Picker from "react-native-picker"
import  NavigationsIcons from '../NavigationIcons';

import { connect as reduxConnect } from 'react-redux';
import ControlModel from "bt-app/BTService/models/control";
import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from 'bt-app/BTService/Reducer';
import {
    GLTimerTests
} from 'bt-app/BTService/tests';
import { useTranslation } from 'react-i18next';
import TumblerSwitch from 'bt-app/components/TumblerSwitch'
import {FACTOR_OPTIONS} from './constants';
const { width, height } = Dimensions.get('window')

const SeasonalAdjust = ({size= "", peripheral, deviceService, ...props}) => {
    if(!peripheral){ return null }
    const [isLoading, setIsLoading] = useState(false)
    const { t } = useTranslation();
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
  
    const { status: {
        isOpen,
        valvesNumber,
        waterBudget,
        rainOff,
        sensorType,
      }
    } = peripheral;
    const [factor, setfactor] = useState(waterBudget)
    
    useEffect(() => {
        setfactor(waterBudget)
    }, [waterBudget])
    const setApplicable = () =>{
        if(factor == 100){
            setIsLoading(true)
            let newControl = new ControlModel({sensorType})
            setfactor(110)
            newControl.setWaterbudget(110)
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl,()=>{
                props.executeTest(GLTimerTests.READ_DEVICE.id)
                setIsLoading(false)
            })
        }else{
            setIsLoading(true)
            let newControl = new ControlModel({sensorType})
            setfactor(100)
            newControl.setWaterbudget(100)
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl, ()=>{
                props.executeTest(GLTimerTests.READ_DEVICE.id)
                setIsLoading(false)
            })
        }
        
    }
    const pickerShowforDrawer = () => {
        let data = {
                pickerData: FACTOR_OPTIONS.availableOptions,
                selectedValue: [factor],
                wheelFlex: [1]
            }
        Picker.init({
            ...data,
            pickerTitleText: t('COMMON.SELECT'),
            pickerCancelBtnText: t('COMMON.CANCEL'),
            pickerConfirmBtnText: t('COMMON.CONFIRM'),
            pickerToolBarFontSize: 19,
            pickerFontSize: 24,
            pickerRowHeight: 26,
            pickerFontFamily: "ProximaNova-Regular",
            onPickerConfirm: pickedValue => {
                setIsLoading(true)
                const value = parseInt(pickedValue[0])
                let newControl = new ControlModel({sensorType})
                setfactor(value)
                newControl.setWaterbudget(value)
                props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl,()=>{
                    props.executeTest(GLTimerTests.READ_DEVICE.id)
                    setIsLoading(false)
                })
            },
            onPickerCancel: pickedValue => {
                
            },
            onPickerSelect: pickedValue => {
            }
        })
        Picker.show()
    }
    if(!peripheral.id){
        return null
    }

    if(size == "sm"){
        return(

            <View style={{}}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottomWidth: 0.5,
                    borderBottomColor: "lightgrey"
                }}>
                <TouchableOpacity
                    style={{
                        alignItems: "center",
                        
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={pickerShowforDrawer}>
                    <Image
                        source={TabIcon.weatherAppRain}
                        style={{
                            marginHorizontal: dynamicSize(8),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{ flexDirection: "column" }}>
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('COMMON.SEASONAL_ADJUSTMENT_HEADING')}
                        </Text>
                        { factor != 100 &&
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{fontFamily: "ProximaNova-Regular",}}>{`${factor}%`}</Text>
                                    <Image
                                        resizeMode='contain'
                                        source={NavigationsIcons.arrowDropDown}
                                    />
                            </View>
                        }
                        
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={setApplicable }   >
                    { isLoading ?
                        <ActivityIndicator style={{paddingHorizontal: 20}} color="rgba(34, 167, 240, 1)" /> 
                        :
                        <TumblerSwitch 
                            style={{ marginHorizontal: dynamicSize(18) }}
                            isActive={factor != 100}
                        />
                    }
                </TouchableOpacity>
            </View>

        </View>

        )
    }
    if(factor == 100){
        return null
    }
    return (
        <View style={{ marginHorizontal: dynamicSize(15), }}>
            <View style={{
                borderBottomWidth: 1,
                borderBottomColor: "lightgrey",
                width: width - dynamicSize(35),

            }} />
            <TouchableOpacity onPress={pickerShowforDrawer} style={{ alignItems: "center", justifyContent: "center", flexDirection: 'row', height: dynamicSize(60), marginTop: dynamicSize(10), }}>
                <Image source={TabIcon.weatherAppRain}
                    style={{ width: dynamicSize(30), height: dynamicSize(30), marginHorizontal: dynamicSize(20), }}></Image>
                <Text style={{
                    marginVertical: dynamicSize(10),
                    fontSize: getFontSize(20),
                    textAlign: "left",
                    fontFamily: "ProximaNova-Regular",
                    color: "grey"
                }}> {t('COMMON.SEASONAL_ADJUSTMENT_HEADING')} </Text>
                <Text style={{
                    marginVertical: dynamicSize(10),
                    marginHorizontal: dynamicSize(10),
                    fontSize: getFontSize(20),
                    textAlign: "left",
                    fontFamily: "ProximaNova-Regular",
                }}>{`${factor}%`} </Text>
            </TouchableOpacity>

            <View style={{
                borderBottomWidth: 1,
                borderBottomColor: "lightgrey",
                width: width - dynamicSize(35)
            }} />

        </View>
    )

}


export default reduxConnect(
    ({BTService, peripherals}): $Shape<Props> => ({
      connectionState: BTService.connectionState,
      deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
      peripheral: peripherals.list.find( d => d.id == peripherals.currentDeviceID),
    }),
    {
      executeTest,
    },
)( memo(SeasonalAdjust) );