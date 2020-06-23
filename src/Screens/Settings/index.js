// @flow
import React, { useState, useEffect, memo } from "react"
import { ScrollView, TouchableOpacity, StyleSheet, Image, View, Text, Dimensions, Modal, FlatList, } from "react-native"
import AsyncStorage from '@react-native-community/async-storage';
import { dynamicSize, getFontSize, } from "bt-app/components/dynamicsize";

import DrawerIcon from "bt-app/components/DrawerIcon"
import { CustomButton } from "bt-app/components/customButtom";
import { withNavigationFocus } from '@react-navigation/compat';
import Picker from 'react-native-picker';
import RainSwitchSetting from './SingleSwitchSetting';

import IndicationIcons from 'bt-app/components/IndicationIcons';
import { connect as reduxConnect } from 'react-redux';


import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from 'bt-app/BTService/Reducer';
import {
    GLTimerTests
} from 'bt-app/BTService/tests';
import {DAYS_LIST} from './constants';
import ControlModel from 'bt-app/BTService/models/control';
import ProgramModel from 'bt-app/BTService/models/program';
import StatusCardRain from 'bt-app/components/RainOffCard';

import {
    saveLocalProgram
} from 'bt-app/Redux/actions/BTActions'
import ConfirmationModal from 'bt-app/components/Modals/Confirmation'
import produce from 'immer';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window')
const Rainoff = ({ deviceService, peripheral, ...props }) => {
    if(!peripheral){ return null}
    const { t } = useTranslation();
    const [actionButton, setActionButton] = useState({})
    const [confirmModal, setconfirmModal] = useState({ visible: false, type: '', isProcessing: false })
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    const [rainSetting, setRainSetting] = useState({ 
        faucets: [] , offDays: 0 , allActive: null, isEditing: false,
    })
    
    let { status: {
            isRainSensorSupported,
            sensorType,
            valvesNumber,
            faucets,
            isSensorWet,
        }
    } = peripheral;
  
    const rainOff = peripheral.localSettings.rainSettings 
                    ?  peripheral.localSettings.rainSettings.rainOff
                    :  peripheral.status.rainOff
    
    const isUnlimited = rainSetting.offDays >= 255

    useEffect(() => {
        if(rainSetting.isEditing == true){
            return 
        }
        if(peripheral.localSettings.rainSettings){
            setRainSetting(produce(rainSetting, draft => {
                draft.offDays = peripheral.localSettings.rainSettings.rainOff
                draft.faucets = peripheral.localSettings.rainSettings.faucets
            }))
        }else{
            let allActive: any = null
            if( sensorType == "TAMAR" && ["Simple", "Simple-11F" ].indexOf(peripheral.status.type) > -1){
                allActive = peripheral.status.faucets.map( f => ( peripheral.programs[f.number] && peripheral.programs[f.number].rainOffSensor == true)).includes(false) == false
            }
            if(['GEFEN','RIMON', 'HOSEND'].includes(sensorType)){
                allActive = isSensorWet
            }
            setRainSetting(produce(rainSetting, draft => {
                draft.offDays = peripheral.status.rainOff
                draft.faucets = peripheral.status.faucets.map( f => ({number: f.number, isActive: peripheral.programs[f.number] &&   peripheral.programs[f.number].rainOffSensor == true}))
                draft.allActive = allActive
            }))
        }
    }, [peripheral, isConnected])
    useEffect(() => {
        if (isConnected) {
            if(rainOff > 0 ){    
                setActionButton({label: t('RAIN_OFF_SCREEN.BUTTON_CANCEL'), color:  "rgba(34, 167, 240, 1)"  , action: 'stop'})
            }else{
                setActionButton({label: t('RAIN_OFF_SCREEN.BUTTON_SEND'), color:   "rgba(34, 167, 240, 1)" , action: 'set'})
            }
        }else{
            if(rainOff > 0 ){    
                setActionButton({label: t('RAIN_OFF_SCREEN.BUTTON_CANCEL'), color:  "rgba(34, 167, 240, 1)"  , action: 'stop_locally'})
            }else{
                setActionButton({label: t("RAIN_OFF_SCREEN.BUTTON_SAVE"), color:   "rgba(34, 167, 240, 1)" , action: 'set_locally'})
            }
        }
    }, [peripheral, isConnected])
    
    useEffect(() => {
        if(props.testInfo.prevTest == "WRITE_CONTROL" && props.testInfo.currentTest == null){
            setconfirmModal({ ...confirmModal, isProcessing: false})
        }
        if(props.testInfo.prevTest == "WRITE_DEVICE" && props.testInfo.currentTest == null){
            setconfirmModal({ ...confirmModal, isProcessing: false})
        }
    }, [confirmModal.isProcessing,props.testInfo])

    const pickerShow = () => {
 
        Picker.init({
            pickerData: DAYS_LIST,
            selectedValue:[rainSetting.offDays],
            pickerTitleText: '',
            pickerCancelBtnText: t('COMMON.CANCEL'),
            pickerConfirmBtnText: t('COMMON.CONFIRM'),
            wheelFlex: [1],
            pickerToolBarFontSize: 19,
            pickerFontSize: 24,
            pickerRowHeight: 26,
            pickerFontFamily: "ProximaNova-Regular",
            onPickerConfirm: pickedValue => {
                handleSettingChange('offDays', {offDays: parseInt(pickedValue[0])})
            },
            onPickerCancel: pickedValue => {

            },
            onPickerSelect: pickedValue => {
               
            }
        });
        Picker.show();
    }

    const handleAction = (actionName) => {
        let programs = peripheral.localSettings.programs || peripheral.programs
        let newControl =  new ControlModel({sensorType})
        let newPrograms = []
        for (const valveNum in programs) {
            let _program = programs[valveNum]
            if (programs.hasOwnProperty(valveNum)) {
                let newProgram = new ProgramModel({valveNumber: valveNum, sensorType})
                const index = rainSetting.faucets.findIndex( i => i.number == valveNum )
                let err = newProgram.validateWith({
                    ..._program , 
                    rainOffSensor: rainSetting.faucets[index].isActive 
                })
                newPrograms.push(newProgram)
            }
        }

        if(actionName == 'set'){
            newControl.setRainOff(rainSetting.offDays)
            saveLocalProgram(peripheral, { config: "clear_rain" })
            props.executeTest(GLTimerTests.WRITE_DEVICE.id, {control: newControl, programs: newPrograms} )
            setconfirmModal({ ...confirmModal, isProcessing: true})
        }

        if(actionName == 'stop'){
            newControl.clearRainOff()
            saveLocalProgram(peripheral, { config: "clear_rain" })
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl )
            setconfirmModal({ ...confirmModal, isProcessing: true})
        }

        if(actionName == 'set_locally'){
            saveLocalProgram(peripheral, { rainOff: rainSetting.offDays, faucets: rainSetting.faucets , config: "rain" })
            setconfirmModal({
                isProcessing: false,
                visible: true,
                type: "settings_saved_locally",
                subHeading: t('INFO.SETTINGS_SAVED_LOCALLY'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: () => {
                        setconfirmModal({  isProcessing: false, visible: false })
                    },
                },
            })
        }

        if(actionName == 'stop_locally'){
            saveLocalProgram(peripheral, { rainOff: 0 ,faucets: rainSetting.faucets, config: "rain" })
            setconfirmModal({
                isProcessing: false,
                visible: true,
                type: "settings_saved_locally",
                subHeading: t('INFO.SETTINGS_SAVED_LOCALLY'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        }
        setRainSetting(oldRainSetting =>{
            return({...oldRainSetting, isEditing: false})
        })
    }

    const handleSettingChange = (type, changes) => {
        if(type == 'offDays'){
            setRainSetting(produce(rainSetting, draft => {
                draft.offDays = changes.offDays
                draft.isEditing= true
            }))
        }
        if(type == 'faucets'){
            const index = rainSetting.faucets.findIndex( i => i.number == changes.number )
            setRainSetting(produce(rainSetting, draft => {
                draft.faucets[index].isActive = !draft.faucets[index].isActive
                draft.isEditing= true
            }))
        }
        if(type == 'all_active'){
            const nextAllActive: any = !rainSetting.allActive
            setRainSetting(produce(rainSetting, draft => {
                draft.faucets = draft.faucets.map(i => ({...i, isActive: nextAllActive}))
                draft.allActive = nextAllActive
                draft.isEditing= true
            }))
        }
        
        console.log("rainSettingReq",rainSetting, changes)
    }
   
    return (
        <View style={{
            flex: 1,
            backgroundColor: "white",
            // justifyContent: 'center',
            alignItems: 'center'
        }}>
            <ScrollView>
                <View style={{
                    flex: 1,
                    backgroundColor: "white",
                    alignItems: 'center'
                }}>
                        <RainSwitchSetting
                           
                            valvesInfo={peripheral.localSettings.valvesInfo} 
                            isRainSensorSupported={isRainSensorSupported} 
                            rainSetting={rainSetting} 
                            handleSettingChange={handleSettingChange} 
                            disabled={['GEFEN','RIMON', 'HOSEND'].includes(sensorType)} 
                        />
                        <View style={{marginVertical: dynamicSize(20)}}>
                        {   rainOff > 0 ?
                            <StatusCardRain size="lg" /> 
                            :
                            <View style={styles.card}>

                                <TouchableOpacity disabled={isUnlimited} style={{ alignItems: "center", justifyContent: "center", opacity: 1 }} onPress={pickerShow}>
                                    <Image style={[isUnlimited ? {tintColor: "#ccc"} : {}]} source={DrawerIcon.programStatus} />
                                    <Text style={[{  fontFamily: "ProximaNova-Regular", marginVertical: dynamicSize(10), fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold" }, isUnlimited ? {color: "#ccc"} : {}]}>{t('RAIN_OFF_SCREEN.RAIN_DROP_SUB_HEADING')}</Text>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text
                                            style={[{  fontFamily: "ProximaNova-Regular", marginTop: dynamicSize(5), fontSize: getFontSize(15), }, isUnlimited ? {color: "#ccc"} : {} ]}>
                                            {rainSetting.offDays}</Text>
                                        <Image style={[isUnlimited ? {tintColor: "#ccc"} : {}]} source={DrawerIcon.arrowDropDown} />
                                        <Text style={[{  fontFamily: "ProximaNova-Regular",marginTop: dynamicSize(5), fontSize: getFontSize(15), }, isUnlimited ? {color: "#ccc"} : {} ]}>{t('COMMON.DAYS')}</Text>
                                    </View>
                                </TouchableOpacity>


                                <TouchableOpacity style={{
                                    paddingVertical: dynamicSize(4), 
                                    alignItems: "center", 
                                    bottom: 0, flexDirection: "row", 
                                        left: 0, right: 0, position: "absolute",
                                        borderTopWidth: 1, borderTopColor: "lightgrey"
                                    }} onPress={()=>handleSettingChange('offDays', {offDays: isUnlimited ? 1 : 255 }) } > 
                                    <View >
                                        <Image resizeMode="contain"
                                            source={isUnlimited == true ? DrawerIcon.checkboxOn : DrawerIcon.checkboxOff}
                                            style={{ marginLeft: dynamicSize(20), width: dynamicSize(25), height: dynamicSize(25) }} />
                                    </View>
                                    <Text style={{  fontFamily: "ProximaNova-Regular",fontSize: getFontSize(15), marginHorizontal: dynamicSize(10) }}>
                                        { t('RAIN_OFF_SCREEN.NO_TIME_LIMIT') }
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        </View>
                </View>
            </ScrollView>
            <ConfirmationModal {...confirmModal} />
            <CustomButton style={{ backgroundColor: actionButton.color }}
                status={ confirmModal.isProcessing ? t('COMMON.ACTION_INPROCESS') : actionButton.label}
                onPress={()=> handleAction(actionButton.action) }
            />

        </View>
    );



}
const styles = StyleSheet.create({
    card: {
        justifyContent: "center", alignItems: "center",
        width: width - dynamicSize(35),
        elevation: dynamicSize(0.4),
        borderWidth: dynamicSize(0.5),
        backgroundColor: "white",
        borderColor: "#ddd",
        shadowColor: "#000",
        alignSelf: "center",
        marginHorizontal: dynamicSize(10),
        paddingVertical: dynamicSize(50),
        shadowOpacity: dynamicSize(0.3)
    },

})



export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        testInfo: {
            currentTest: BTService.currentTest,
            prevTest: BTService.prevTest
        },
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)( memo(withNavigationFocus(Rainoff)) );