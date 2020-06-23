import React, { Component, memo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  width,
  height,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  I18nManager,
  Platform
} from "react-native";
import { dynamicSize, getFontSize } from "../dynamicsize";
import {
  type ReduxState,
  ConnectionState,
} from '../../BTService/Reducer';
import { useTranslation } from 'react-i18next';
import { connect as reduxConnect } from 'react-redux';
import { GlobalColor } from 'bt-app/GlobalConstants'
const  Header = ({ headerShown, bleState,  boldTitle, title, heading_key,...props}) => {
  if(headerShown == false){
    return(
      <View>
        <Text> test </Text>
      </View>
    )
  }
  
  const { t } = useTranslation();
    return (
      <View
        style={styles.header} >
        <TouchableOpacity
          onPress={props.Navigation}
          style={{
            position: "absolute",
            left: dynamicSize(10),
            width: dynamicSize(40),
            height: dynamicSize(40),
            justifyContent: "center",
            borderTopRightRadius: dynamicSize(20),
            borderBottomRightRadius: dynamicSize(20)
          }}
        >
          <Image
            style={{
              height: dynamicSize(25),
              width: dynamicSize(25),
              alignSelf: "center",
              transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
            }}
            source={props.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={{flexDirection: "column"}}>
          <View style={[props.header_title]}>
            <Text
              style={{
                fontFamily: "ProximaNova-Bold",
                fontSize: getFontSize(18),
                color: "white",
                textAlign: "center"
              }}
            >
              {t(`SCREEN_HEADINGS.${heading_key}`)}
            </Text>
          </View>
         
        </View>
        { (bleState != 'PoweredOn') &&
          <View style={{ flexDirection: "row", position: "absolute", bottom: 0,  backgroundColor: "red", height: dynamicSize(20), width: "100%", paddingHorizontal: dynamicSize(20) }}>
            { bleState == 'PoweredOff' ? 
               <Text style={{fontFamily: "ProximaNova-Regular", color: "#fff", }}  > {t('ERRORS.BLUETOOTH_OFF')}</Text>:
               <Text style={{fontFamily: "ProximaNova-Regular", color: "#fff"}}> Bluetooth is: {bleState}</Text>
              }
          </View>
        }
      </View>
    );
  
}
const styles = StyleSheet.create({
  header: {
    width: width,
   
    backgroundColor: GlobalColor.primaryThemeColor,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: dynamicSize(2),
    flexDirection: "row",
    ...Platform.select({
      ios: {
        height: dynamicSize(60),
      },
      android: {
        height: dynamicSize(75),
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  dropDownItem: {
    borderBottomColor: "#e4e6e5",
    borderBottomWidth: dynamicSize(2),
    alignSelf: "center",
    justifyContent: "space-between",
    marginVertical: dynamicSize(10)
  }
});

export default reduxConnect(
  ({BTService, peripherals}): $Shape<Props> => ({
    connectionState: BTService.connectionState,
    bleState: BTService.bleState,
}),
  {

  },
)( memo(Header) );

