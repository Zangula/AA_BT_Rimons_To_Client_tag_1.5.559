import React, { useState, useEffect } from "react"
import { SafeAreaView, TouchableOpacity, StyleSheet, Image, View, Text, Dimensions, Modal, FlatList, } from "react-native"
import { dynamicSize, getFontSize, } from "bt-app/components/dynamicsize";
const { width, height } = Dimensions.get('window')
import DrawerIcon from "bt-app/components/DrawerIcon"
import { CustomButton } from "bt-app/components/customButtom";
import { withNavigationFocus } from '@react-navigation/compat';
import Picker from 'react-native-picker';

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
import { DAYS_LIST } from './constants';
import ControlModal from 'bt-app/BTService/models/control';
import StatusCardRain from 'bt-app/components/RainOffCard';

import {
    saveLocalProgram
} from 'bt-app/Redux/actions/BTActions'
import ConfirmationModal from 'bt-app/components/Modals/Confirmation'
import TimerHeader from "bt-app/components/Headers/Timerheader"
import NavigationsIcons from "bt-app/components/NavigationIcons"
import { useTranslation } from 'react-i18next';
import TumblerSwitch from 'bt-app/components/TumblerSwitch'
import {GlobalColor} from "bt-app/GlobalConstants/index";
const MultipleSwitchSettings = ({ visible, valvesInfo, ...props }) => {
    const { t } = useTranslation();
    const [actionButton, setActionButton] = useState({})


    const handleAction = (item) => {
        if(!props.handleSettingChange){
            throw Error("Param handleSettingChange is required" )
        }
        props.handleSettingChange('faucets', item)
    }

    return (
            <Modal 
                animated={true}
                animationType="slide"
                    visible={visible}
                style={{
                    flex: 1,
                    backgroundColor: "white",

                }}
                onRequestClose={props.onClose}
                >
                <SafeAreaView style={{ flexDirection: "column", flex: 1, backgroundColor:GlobalColor.primaryThemeColor }} >
                <View  style={{  backgroundColor: "#fff",flexDirection: "column", flex: 1}}>
                    <TimerHeader
                        heading_key="RAIN_SWITCH_SETTINGS"
                        leftIcon={NavigationsIcons.back}
                        showIndications={true}
                        Navigation={props.onClose}
                    />
                        <Text style={{ fontFamily: "ProximaNova-Regular", marginVertical: dynamicSize(20), color: "rgb(82,81,81)", fontSize: getFontSize(15), marginHorizontal: dynamicSize(20) }}>
                            {t('RAIN_OFF_SCREEN.MULTIPLE_VALCE_SWITCH_HELP_TEXT')}
                        </Text>
                    <FlatList
                        style={{
                           
                            marginBottom: 60,
                        }}
                        data={props.faucets}
                        renderItem={({ item, index }) => {
                            const name = valvesInfo[index] && valvesInfo[index].name || t('VALVE_STATUS.VALVE_NUMBER', {number:item.number })
                            return (
                                <View style={{ justifyContent: "space-between", flex: 1, paddingHorizontal: 19, marginTop: dynamicSize(10), alignItems: "center", flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "lightgrey", height: dynamicSize(60), }}>
                                    <View style={{ alignItems: "center", flexDirection: "row",  }}>

                                        <Text style={{  fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17), }}>
                                            {name}
                                        </Text>

                                    </View>
                                    <TouchableOpacity onPress={() => handleAction(item)}>
                                        <TumblerSwitch 
                                            style={{ marginRight: dynamicSize(10), width: dynamicSize(35), height: dynamicSize(35) }}
                                                isActive={item.isActive}
                                        />
                                        
                                        
                                    </TouchableOpacity>
                                </View>
                            )
                        }}
                    />
                </View>
                </SafeAreaView>
            </Modal>
    );



}
const styles = StyleSheet.create({

})
export default MultipleSwitchSettings

