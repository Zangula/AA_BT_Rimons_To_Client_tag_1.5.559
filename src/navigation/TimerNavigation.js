import React, { Component, useState, useEffect } from 'react'
import {
    Image,
    I18nManager,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


import MainHeader from "bt-app/components/Headers/MainHeader"
import TimerHeader from "bt-app/components/Headers/Timerheader"


import NavigationsIcons from "bt-app/components/NavigationIcons"

import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize';
import TimerIrrigationList from 'bt-app/Screens/TopTab/Irrigation'
import TimerSettingsScreen from 'bt-app/Screens/Settings'

import EditTimerNameScreen from "bt-app/Screens/EditName"
import EditTimerVavlesNameScreen from "bt-app/Screens/EditValvesNames"


import NavigationIcons from '../components/NavigationIcons';


import { GlobalColor } from 'bt-app/GlobalConstants';
import TabNavigation from './TabNavigation';
const Stack = createStackNavigator();


export default function TimerStack() {
    return (
        <Stack.Navigator
            initialRouteName="TopTabScreen"
            headerMode="screen"
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColor.primaryThemeColor,
                },

                headerBackTitleVisible: false,

                headerBackImage: () =>
                    <Image
                        style={{
                            height: dynamicSize(25),
                            width: dynamicSize(25),
                            alignSelf: "center",
                            transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
                        }}
                        source={NavigationIcons.back}
                        resizeMode="contain"
                    />
            }}>
            <Stack.Screen
                name="TopTabScreen"
                component={TabNavigation}
                options={{
                    header: (props) => <TimerHeader
                        testperipheral={true}
                        showIndications={true}
                        Navigation={() => props.navigation.toggleDrawer()}
                    />
                }}
            />
            <Stack.Screen
                name="TimerSettingsScreen"
                component={TimerSettingsScreen}
                options={{
                    header: (props) => <TimerHeader
                        heading_key="RAIN_OFF"
                        showIndications={true}
                        Navigation={() => props.navigation.toggleDrawer()}
                    />
                }}
            />
            <Stack.Screen
                name="TimerIrrigationListScreen"
                component={TimerIrrigationList}
                options={{
                    header: (props) => <TimerHeader
                        showIndications={true}
                        Navigation={() => props.navigation.toggleDrawer()}
                    />
                }}
            />
            <Stack.Screen
                name="EditTimerVavlesNameScreen"
                component={EditTimerVavlesNameScreen}
                options={{
                    header: (props) => <MainHeader
                    heading_key="Edit_VALVES_NAME"
                    backIcon={NavigationsIcons.back}
                    Navigation={() => props.navigation.goBack()}
                    />
                }}
                />
            <Stack.Screen
                name="EditTimerInnerNameScreen"
                component={EditTimerNameScreen}
                options={{
                    header: (props) => <MainHeader
                    heading_key="EDIT_TIMER_NAME"
                    backIcon={NavigationsIcons.back}
                    Navigation={() => props.navigation.goBack()}
                    />
                }}
                />

        </Stack.Navigator>
    )
}


