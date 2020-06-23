import React, { Component, useState, useRef } from "react"
import {
    ImageBackground,
    Image,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    I18nManager,

} from "react-native"
import { withNavigation } from '@react-navigation/compat'
import { connect as reduxConnect } from 'react-redux';
import styles from './styles';

// **************************** Responsive Screen **********************************
import { dynamicSize, getFontSize } from '../../components/dynamicsize'
const { width, height } = Dimensions.get('window')

// **************************** Import Icons**********************************
import welcomicons from "./icon"
import StatusIndication from './StatusIndication';
import { unpairPeripheral } from '../../Redux/actions/BTActions';
import {
    type ReduxState,
    ConnectionState,
    disconnect
} from '../../BTService/Reducer';

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
const { Popover, SlideInMenu } = renderers
const PopupMenu = ({ item, ...props }) => {
    const menuRef = useRef();
    const { t } = useTranslation();
    return (
        <Menu name={`paired-menu-${item.id}`} ref={menuRef} renderer={Popover} rendererProps={{
            placement: 'bottom',
            anchorStyle: {
                opacity: 0,
            },
        }}
        >
            <MenuTrigger style={{}} >
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
                borderWidth: 2,
                right: 15,
            }}>
                <Image resizeMethod="scale"
                    style={{
                        position: "absolute", top: -10, height: 10,
                        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]
                    }}
                    source={TabIcon.combinedShape} />
                <View style={{
                    paddingVertical: dynamicSize(5),
                    margin: dynamicSize(10),
                }}>

                    <TouchableOpacity onPress={() => {
                        menuRef.current && menuRef.current.close()
                        props.navigation.navigate("EditTimerNameScreen", { device: item })
                    }} style={{ flexDirection: "row",  alignItems: "center" }}>
                        <Image source={welcomicons.edit} style={{
                            marginVertical: dynamicSize(8),
                            marginHorizontal: dynamicSize(8), width: dynamicSize(20), height: dynamicSize(20)
                        }} />
                        <Text style={{ fontFamily: "ProximaNova-Regular", marginVertical: dynamicSize(5), }}
                        >{t('MENU.EDIT_TIMER_NAME')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        menuRef.current && menuRef.current.close()
                        props.disconnect(item)
                        unpairPeripheral(item)
                        
                    }} style={{ flexDirection: "row", alignItems: "center"  }}>
                        <Image source={welcomicons.clear} style={{
                            marginVertical: dynamicSize(8),
                            marginHorizontal: dynamicSize(8), width: dynamicSize(20), height: dynamicSize(20)
                        }} />
                        <Text style={{ fontFamily: "ProximaNova-Regular", marginVertical: dynamicSize(5), }}
                        >
                            {t('MENU.TIMER_UNPAIR')}</Text>
                    </TouchableOpacity>
                </View>
            </MenuOptions>
        </Menu>

    )
}



export default reduxConnect(
    (state) => ({
    }),
    {
        disconnect
    },
)(withNavigation(PopupMenu));
