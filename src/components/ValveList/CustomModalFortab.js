//import liraries
import React, { Component, memo , useRef} from 'react';
import { I18nManager, TouchableOpacity, Image, ImageBackground, Modal, View, Text, StyleSheet, Dimensions } from 'react-native';
import { dynamicSize, getFontSize } from '../dynamicsize'
import TabIcon from '../TabIcon';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
  MenuProvider,
} from 'react-native-popup-menu';
const { width, height } = Dimensions.get('window')
const { Popover , SlideInMenu} = renderers
const CustomModalFortab = ({ visible, isReadyToPaste,menuName, ...props  }) => {
  const menuRef = useRef();
  const { t } = useTranslation();

  return(
    <Menu name={menuName} ref={menuRef} renderer={Popover} rendererProps={{ 
      placement: 'bottom',
      anchorStyle: {
        opacity: 0,
      },
    }}
    >
      <MenuTrigger >
        <Image
            resizeMode="contain"
            style={{ width: wp("8%"), height: hp("5%") }}
            source={TabIcon.menuBlue}
        />
      </MenuTrigger>
      <MenuOptions optionsContainerStyle={{ 
        width: 170, 
        borderRadius: 6,
        borderColor: "#ccc",
        borderWidth: 2, }}>
      <Image  resizeMethod="scale" 
      style={{ 
        position: "absolute", top: -10, height: 10, 
        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]
      }} 
      source={TabIcon.combinedShape} /> 
      <View style={{
        paddingVertical: dynamicSize(5),
        margin: dynamicSize(10),
      }}>
        
        <TouchableOpacity
          onPress={() => {
            menuRef.current && menuRef.current.close()
            props.onClickCopyProgram()
          }}
          style={{ flexDirection: "row", paddingVertical: dynamicSize(4) }}
        >
          <Image source={TabIcon.copy} style={{
            marginHorizontal: dynamicSize(8),
            width: dynamicSize(20), height: dynamicSize(20)
          }} />
          <Text style={{ fontFamily: "ProximaNova-Regular", marginBottom: dynamicSize(10), }}
          > {t('MENU.COPY_PROGRAM')} </Text>
        </TouchableOpacity >
        <TouchableOpacity
          onPress={ ()=>{
            menuRef.current && menuRef.current.close()
            props.onClearProgram()
          }}
          style={{ flexDirection: "row", paddingVertical: dynamicSize(4) }}>
          <Image source={TabIcon.clear} style={{
            marginHorizontal: dynamicSize(8),
            width: dynamicSize(20), height: dynamicSize(20)
          }} />
          <Text style={{ fontFamily: "ProximaNova-Regular", marginBottom: dynamicSize(12), }}
          >
            {t('MENU.CLEAR_PROGRAM')} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!isReadyToPaste}
          onPress={ () =>{ 
            menuRef.current && menuRef.current.close()
            props.onPasteProgram()
          }}
          style={{ flexDirection: "row", paddingVertical: dynamicSize(4) }}>
          <Image source={TabIcon.paste} style={{
            tintColor: !isReadyToPaste ? "#ccc" : null,
            marginHorizontal: dynamicSize(8),
            width: dynamicSize(20), height: dynamicSize(20)
          }} />
          <Text style={{ fontFamily: "ProximaNova-Regular", marginBottom: dynamicSize(12), color: !isReadyToPaste ? '#ccc' : '#000' }}
          >
            {t('MENU.PASTE_PROGRAM')}</Text>
        </TouchableOpacity>
      </View>
    
      </MenuOptions>
    </Menu>
  )
  return (
    <View style={{
      position: "absolute",
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: "#ccc",
      top: 40,
      right: 10,
      width: 200,
      elevation: 4, 
      backgroundColor: "#fff",
      zIndex: 100,
    }}>
      <View style={styles.TriangleShapeCSS} />
    </View>



  )

}

const styles = StyleSheet.create({
  TriangleShapeCSS: {
    right: 0,
    top: -15,
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: "#fff"
  }
})
export default memo(CustomModalFortab)