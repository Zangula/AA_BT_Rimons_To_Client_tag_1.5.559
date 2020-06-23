// @flow
import React, { useState, useEffect , memo} from "react"
import { ScrollView, View, StyleSheet, Dimensions } from "react-native"

import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize'
import NextIrrigationCard from "bt-app/components/NextIrrigation"

const { width, height } = Dimensions.get('window')
import { withNavigationFocus } from '@react-navigation/compat';

import { connect as reduxConnect } from 'react-redux';

import { bindActionCreators } from 'redux';
import SeasonalAdjustment from "bt-app/components/SeasonalAdjustment";
import {
    type ReduxState,
    executeTest,
} from 'bt-app/BTService/Reducer';
import {
    GLTimerTests
} from 'bt-app/BTService/tests';

import  StatusCard  from "bt-app/components/StatusCard";
import  StatusCardRain  from "bt-app/components/RainOffCard";
import NoActiveStatus from './NoActiveStatus';
import { useTranslation } from 'react-i18next';
import Picker from "react-native-picker";
const Defenstatus = ({ deviceService, peripheral, navigation, ...props }) => {
    if(!peripheral){ return null }
    const { t } = useTranslation();
    let { status: {
            isOpen,
            openFaucets,
            seasonalAdjustmentSupported,
            isSensorWet,
        }
    } = peripheral;

    const rainOff = peripheral.localSettings.rainSettings 
                    ? peripheral.localSettings.rainSettings.rainOff
                    :  peripheral.status.rainOff
                    
    const activeStatus = isOpen || rainOff > 0 || isSensorWet
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', e => {
          Picker.hide()
        });
      
        return unsubscribe;
      }, [navigation]);
    
    
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView>
            <NextIrrigationCard
                navigation={navigation}
                style={{ marginVertical: dynamicSize(20), alignSelf: "center", height: dynamicSize(70), width: width - dynamicSize(35), backgroundColor: "rgba(34, 167, 240, 1)", borderRadius: dynamicSize(5) }}
            />
            { seasonalAdjustmentSupported &&
                 <SeasonalAdjustment />
            } 
            { activeStatus ? 
                <>
                    {openFaucets.map((s, i) =>{
                        return <StatusCard key={`valve-status-${i+1}`} {...s} />
                    })}
                    <StatusCardRain />
                </> : <NoActiveStatus/>
            }     
            </ScrollView>

        </View>
    );



}



export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)( memo( withNavigationFocus(Defenstatus) ));

