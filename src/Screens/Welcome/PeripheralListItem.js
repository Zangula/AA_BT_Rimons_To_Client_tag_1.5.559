import React, { Component, useState , useEffect} from "react"
import {
  ImageBackground,
  Image,
  Modal,
  SectionList,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,

} from "react-native"
import { withNavigation } from '@react-navigation/compat'
import { connect as reduxConnect } from 'react-redux';
import styles from './styles';

// **************************** Responsive Screen **********************************
import { dynamicSize, getFontSize } from '../../components/dynamicsize'
const { width, height } = Dimensions.get('window')
import DeviceFamily from '../../BTService/models/family';
// **************************** Import Icons**********************************
import welcomicons from "./icon"
import { DeviceIndicaton, BluetoothIcon } from './StatusIndication';
import Menu from './Menu';
import {
  type ReduxState,
  connect,
  disconnect,
  executeTest,
  heartBeat,
  deviceSetImage,
  ConnectionState,
} from '../../BTService/Reducer';
import ImagePicker from 'react-native-image-picker';
import TimerIcons from '../../components/TimersIcons';
import {
  GLTimerTests
} from '../../BTService/tests';
import { useTranslation } from 'react-i18next';
import {GlobalColor} from 'bt-app/GlobalConstants/'
const PeripheralListItem = ({ deviceService, isPaired, item, navigation, index, ...props }) => {
  const { t } = useTranslation();
  const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
  const [info, setinfo] = useState({timerImageID: "Placeholder", nameMapping: ""})
  const onPressDevice = () => {
    props.onPress(item, deviceService)
  }
  useEffect(() => {
    const family = new DeviceFamily(isPaired ? item : deviceService)
    setinfo({
      timerImageID: family.simplifiedModel || "Placeholder",
      nameMapping: family.nameMapping,
    })
  },[deviceService.id])
  
  const imageOpen = () => {
    ImagePicker.showImagePicker({
      mediaType: 'photo',
      title: 'Select Photo',
      quality: 0.3,
      tintColor: GlobalColor.primaryThemeColor,
      storageOptions: {
        skipBackup: true,
        path: 'images',
        cameraRoll: false, 
        waitUntilSaved: true,
      },
      customButtons: [{ name: 'useDefault', title: 'Use default Photo' }],
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        if (response.customButton) {
          props.deviceSetImage(item, null)
        }
      } else {
        var path = response.uri;
        if (Platform.OS === 'ios') {
            path = '~' + path.substring(path.indexOf('/Documents'));
        }
        if (Platform.OS === 'android') {
          //path = response.uri.replace('file://', '');
        }
        //https://github.com/react-native-community/react-native-image-picker/issues/107
        props.deviceSetImage(item, { uri: path })
      }
    });
  }

  const getImage = () => {
    return (
      item.avatarSource || TimerIcons[info.timerImageID]
    )
  }

  const describeName = () => {
    switch (deviceService.connectionState) {
      case ConnectionState.CONNECTING:
        return t('COMMON.CONNECTING')
      case ConnectionState.DISCOVERING:
        return t('COMMON.DISCOVERING')
      default:
        if(isPaired){
          return item.name ? t("COMMON.DECRIBED_NAME",{modelName: info.nameMapping , name: item.name}) :  info.nameMapping
        }
        return info.nameMapping || item.id
    }
  }




  return (
    <View style={{ position: "relative"}}>
      <View style={styles.card}>
        
        <View style={{
          flex: 1,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center"
        }}>
          <View style={{
            borderColor: "rgb(230,230,230)",
            borderWidth: StyleSheet.hairlineWidth,
            margin: dynamicSize(10),
            paddingHorizontal: dynamicSize(5),
            flex: 0.3,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: 'center',
          }}>
            <Image source={getImage()} style={{ width: dynamicSize(90), height: dynamicSize(90) }} resizeMode="contain" />
            {isPaired &&
              <TouchableOpacity onPress={imageOpen} style={{ opacity: 0.9, backgroundColor: 'lightblue', height: dynamicSize(30), position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={welcomicons.camera} resizeMode="contain" style={{ width: dynamicSize(20), height: dynamicSize(20) }} />
              </TouchableOpacity>
            }

          </View>
          <View style={{
            flexDirection: "column", 
            flex: 0.7,
            alignItems: "center",
          }}>
            <TouchableOpacity style={{
              height: dynamicSize(90),
              paddingLeft: dynamicSize(10),
              paddingRight: dynamicSize(10),
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              
            }} onPress={onPressDevice}>
              <View style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
              
                     }} >
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: getFontSize(15),
                    textAlign: "left",
                    fontFamily: "ProximaNova-Bold",
                  }}>
                  {describeName(item)}
                </Text>
                {(item.note || "").length > 0 && <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: "ProximaNova-Regular",
                    fontSize: getFontSize(13),
                    textAlign: "left",
                    color: "rgb(32,32,32)"
                  }}>
                  {item.note}
                </Text>
                }
              </View>
              {!isPaired && <BluetoothIcon isConnected={true} />}
            </TouchableOpacity>
            { isPaired && 
            <View style={{zIndex: 10, position: "absolute" , top: 0, right: 0}}>
              <Menu
              item={item}
              deviceService={item}/>
              </View>
            }
            { isPaired &&
              <DeviceIndicaton
                executeTest={props.executeTest}
                isPaired={isPaired}
                isConnected={isConnected}
                deviceService={deviceService}
                item={item}
              />
            }
          </View>
        </View>
        
      </View>

    </View>
  )
}



export default reduxConnect(
  (state, props) => ({
    deviceService: state.BTService.peripherals[props.item.id] || {}
  }),
  {
    heartBeat,
    executeTest,
    deviceSetImage,
  },
)(withNavigation(PeripheralListItem));
