import React, {  useState, useEffect } from 'react'
import {
  Image,
  I18nManager,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


import NavigationsIcons from "bt-app/components/NavigationIcons"



import StatusTabScreen from "bt-app/Screens/TopTab/Status";
import ProgramTabScreen from "bt-app/Screens/TopTab/Program"
import ManualTabSceen from 'bt-app/Screens/TopTab/Manual'




import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize';


import i18next from 'i18next';
const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();


export default function TopTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Status" 
      backBehavior="none"
      tabBarOptions={{
        labelStyle: { fontSize: 12, fontFamily: "ProximaNova-Bold" },
        showIcon: true,
        iconStyle: {
          marginBottom: 4,
        }
      }} >
      <Tab.Screen name="Status" component={StatusTabScreen} options={{
        tabBarLabel: i18next.t("TABS.STATUS"),
        tabBarIcon: ({ tintColor }) => (
          <Image source={NavigationsIcons.status} style={{ width: dynamicSize(30), height: dynamicSize(30), }} resizeMode='contain' />
        )
      }} />
      <Tab.Screen name="Program" component={ProgramTabScreen} options={{
        tabBarLabel: i18next.t("TABS.PROGRAM"),
        tabBarIcon: ({ tintColor }) => (
          <Image source={NavigationsIcons.program} style={{ width: dynamicSize(30), height: dynamicSize(30), }} resizeMode='contain' />
        )
      }} />
      <Tab.Screen name="Manual" component={ManualTabSceen} options={{
        tabBarLabel: i18next.t("TABS.MANUAL"),
        tabBarIcon: ({ tintColor }) => (
          <Image source={NavigationsIcons.manual} style={{ width: dynamicSize(30), height: dynamicSize(30), }} resizeMode='contain' />
        )
      }} />

    </Tab.Navigator>
  )
}
