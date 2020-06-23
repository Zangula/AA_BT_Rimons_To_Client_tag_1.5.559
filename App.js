/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useEffect, useRef, Suspense} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Provider } from 'react-redux'
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Navigator  from "./src/navigation/navigation"
import DebugBox from './src/BTService/DebugBox'
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import {GlobalColor} from "./src/GlobalConstants/index";
import RNBootSplash from "react-native-bootsplash";
import { MenuProvider } from 'react-native-popup-menu';
Text.defaultProps = { ...(Text.defaultProps || {}), allowFontScaling: false };
import FlashMessage from 'react-native-flash-message';
//enableScreens();
// https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
const App = () => {
  useEffect(()=>{
    RNBootSplash.hide({ duration: 250 });
  },[])

  return (
    <NavigationContainer>
      <Suspense fallback={
         <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}> 
          <ActivityIndicator size={42} color="#fff" /> 
        </View>
      }>
      <SafeAreaView style={{ flex: 1, backgroundColor:GlobalColor.primaryThemeColor }}>
        <MenuProvider>
          <StatusBar backgroundColor={GlobalColor.primaryDark} barStyle="light-content" />
          <Navigator />
          <DebugBox/>
        </MenuProvider>
        <FlashMessage position="top" />
      </SafeAreaView>
      </Suspense>
    </NavigationContainer>

  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
