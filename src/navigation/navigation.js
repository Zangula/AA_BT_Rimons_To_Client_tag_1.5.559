import React, {  useEffect , memo} from 'react'
import {
  Image,
  I18nManager,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator, DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { connect as reduxConnect } from 'react-redux';

import MainHeader from "bt-app/components/Headers/MainHeader"
import TimerHeader from "bt-app/components/Headers/Timerheader"

import MainDrawerContecnt from 'bt-app/navigation/Drawer/MainDrawer';
import TimerDrawerContent from 'bt-app/navigation/Drawer/TimerDawer';
import NavigationsIcons from "bt-app/components/NavigationIcons"

import WelcomScreen from "bt-app/Screens/Welcome/welcomScreen"




import Howtouse from "bt-app/Screens/DrawerScreen/howtouse"



import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize';


import EditTimerNameScreen from "bt-app/Screens/EditName"

import DebugInterface from 'bt-app/Screens/DebugInterface'
import NavigationIcons from '../components/NavigationIcons';

import { GlobalColor } from 'bt-app/GlobalConstants'
import TimerNavigation from './TimerNavigation';
import Picker from "react-native-picker";
const Stack = createStackNavigator();
const MainDrawer = createDrawerNavigator();

function HomeStack({navigation}) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('drawerClose', e => {
      Picker.hide()
    });
  
    return unsubscribe;
  }, [navigation]);
  
    return (
      <Stack.Navigator
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
        }}
        initialRouteName="WelcomScreen" >
        <Stack.Screen
          name="WelcomScreen"
          component={WelcomScreen}
          options={{
            header: (props) => <MainHeader
              heading_key="WELCOME"
              backIcon={NavigationsIcons.menu}
              Navigation={() => props.navigation.openDrawer()}
            />
          }}
        />
        
        <Stack.Screen
          name="EditTimerNameScreen"
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

function DebugStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: GlobalColor.primaryThemeColor,
          },
          headerBackTitleVisible: false,
        }}
        initialRouteName="DebugInterfaceScreen" >
        <Stack.Screen
          name="DebugInterfaceScreen"
          component={DebugInterface}
          options={{
            header: (props) => <MainHeader
              heading_key="DEBUG_INTERFACE"
              backIcon={NavigationsIcons.menu}
              Navigation={() => props.navigation.toggleDrawer()}
            />
          }}
        />
      </Stack.Navigator>
    )
}

function HowToUseStack() {
    return (
      <Stack.Navigator
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
        }}
        initialRouteName="HowToUseScreen" >
        <Stack.Screen
          name="HowToUseScreen"
          component={Howtouse}
          options={{
            header: (props) => <MainHeader
              heading_key="HOW_TO_USE"
              backIcon={NavigationsIcons.back}
              Navigation={() => props.navigation.goBack()}
            />
          }}
        />
        
      </Stack.Navigator>
    )
}

function HomeDrawerNavigator({currentDeviceID}) {
  return (
    <MainDrawer.Navigator
      name="outerNavigator"
      initialRouteName="outerStack"
      drawerContent={props => {
        return currentDeviceID ? <TimerDrawerContent {...props}/> : <MainDrawerContecnt {...props} />
      }}
      drawerPosition={I18nManager.isRTL ? 'right' : 'left'} >
      <MainDrawer.Screen name="homeStack" component={HomeStack} />
      <MainDrawer.Screen name="TimerScreen" component={TimerNavigation} />
      <MainDrawer.Screen name="hotToUseStack" component={HowToUseStack} />
      <MainDrawer.Screen name="debugStack" component={DebugStack} />
    </MainDrawer.Navigator>
  )
}

export default reduxConnect(
  ({BTService, peripherals}): $Shape<Props> => ({
    currentDeviceID: peripherals.currentDeviceID
  }),
  {
   
  },
)( memo(HomeDrawerNavigator) );