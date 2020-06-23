import React, { useState, memo } from "react"
import { ScrollView, Image, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native"

import { dynamicSize, getFontSize } from '../../../components/dynamicsize'
import NextIrrigationCard from "../../../components/NextIrrigation"

const { width, height } = Dimensions.get('window')
import { withNavigation } from '@react-navigation/compat';

import { connect as reduxConnect } from 'react-redux';

import { bindActionCreators } from 'redux';
import SeasonalAdjustment from "../../../components/SeasonalAdjustment";
import {
    type ReduxState,
    executeTest,
} from '../../../BTService/Reducer';

import NavigationIcons from '../../../components/NavigationIcons'
import { useTranslation } from 'react-i18next';
const NoActiveStatus = ({ navigation, ...props }) => {
    const { t } = useTranslation();
    return (
        <View style={{ flex: 1, marginVertical: dynamicSize(25) }}>
            <View style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",

            }}>
                <Image source={NavigationIcons.program} style={{ height: dynamicSize(50), width: dynamicSize(50) }} />
                <Text style={{
                    fontFamily: "ProximaNova-Regular",
                    marginVertical: dynamicSize(18),
                    marginHorizontal: dynamicSize(60), fontSize: getFontSize(16),
                    textAlign: "center",
                }}>
                    {t('STATUS_SCREEN.NO_ACTVE_PROGRAM_MESSAGE')}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Program')}
                    style={{
                        paddingHorizontal: dynamicSize(20),
                        height: dynamicSize(30), borderRadius: dynamicSize(20),
                        backgroundColor: "rgba(34, 167, 240, 1)", alignItems: "center", justifyContent: "center"
                    }} >
                    <Text style={{ fontFamily: "ProximaNova-Regular", color: "rgba(255, 255, 255, 1.0)", fontFamily: "ProximaNova-Bold", fontSize: getFontSize(15) }}> {t('STATUS_SCREEN.BUTTON_GO_TO_PROGRAMS')}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );



}



export default memo(withNavigation(NoActiveStatus))

