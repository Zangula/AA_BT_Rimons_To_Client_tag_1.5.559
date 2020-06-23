import React, { useState } from "react"
import { I18nManager, TouchableOpacity, StyleSheet, Image, View, Text, Dimensions, Modal, FlatList, Alert } from "react-native"
import { dynamicSize, getFontSize, } from "bt-app/components/dynamicsize";
const { width, height } = Dimensions.get('window')
import DrawerIcon from "bt-app/components/TabIcon"
import { withNavigation } from '@react-navigation/compat';
import MultipleSwitchSettings from './MultipleSwitchSettings';
import { useTranslation } from 'react-i18next';
import TumblerSwitch from 'bt-app/components/TumblerSwitch'
const SingleSwitchSetting = ({disabled , valvesInfo, isRainSensorSupported,  handleSettingChange,navigation, ...props}) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false)
    const {faucets = []} = props.rainSetting
    
    if(!isRainSensorSupported){
        return null
    }

    return (
        <View style={{ marginTop: dynamicSize(10), borderTopWidth: 1, borderTopColor: "lightgrey", alignItems: "center", flexDirection: "row", width: width, borderBottomWidth: 1, borderBottomColor: "lightgrey", height: dynamicSize(60), }}>
            <View style={{ alignItems: "center", flexDirection: "row", width: width - dynamicSize(40) }}>
                <Image resizeMode="contain"
                    source={DrawerIcon.rain}
                    style={{ marginLeft: dynamicSize(20), width: dynamicSize(35), height: dynamicSize(35) }} />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{  fontFamily: "ProximaNova-Regular", fontSize: getFontSize(17), marginHorizontal: dynamicSize(20) }}>                    
                            {t('RAIN_OFF_SCREEN.RAIN_SWITCH_SETTINGS')}
                        </Text>
                    </View>
            </View>
            { props.rainSetting.allActive != null ? (
                <TouchableOpacity disabled={disabled}  onPress={() => handleSettingChange('all_active')}>
                    <TumblerSwitch 
                        style={{ marginRight: dynamicSize(10), width: dynamicSize(35), height: dynamicSize(35) }}
                        isActive={props.rainSetting.allActive}
                    />
                </TouchableOpacity>
            ):(
                <TouchableOpacity onPress={() => setVisible(true) }>
                    <Image
                        resizeMode="contain"
                        source={DrawerIcon.chevronRight}
                        style={{ marginRight: dynamicSize(10), width: dynamicSize(35), height: dynamicSize(35), transform: [{scaleX: I18nManager.isRTL ? -1 : 1}] }} />
                </TouchableOpacity>
            )}
           
            <MultipleSwitchSettings 
                visible={visible} 
                valvesInfo={valvesInfo}
                onClose={() => setVisible(false) } 
                faucets={faucets} 
                handleSettingChange={handleSettingChange}/>
        </View>
    )
}
export default withNavigation(SingleSwitchSetting)

