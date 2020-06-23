import React, { memo } from "react"
import { I18nManager, ImageBackground, Image, View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native"

import { dynamicSize, getFontSize } from '../dynamicsize'
import TabIcon from "../TabIcon";
import moment from 'moment';

import { connect as reduxConnect } from 'react-redux';
import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from '../../BTService/Reducer';
import {
    GLTimerTests
} from '../../BTService/tests';
const { width, height } = Dimensions.get('window')
import { withNavigation } from '@react-navigation/compat';
import ControlModel from '../../BTService/models/control';
import {
    saveLocalProgram
} from '../../Redux/actions/BTActions'
import { useTranslation } from 'react-i18next';
const WetSensor = ({isSensorWet, t, navigation}) => {
    if(!isSensorWet){
        return null
    }
  
    return (

        <View style={styles.card}>


            <View style={{ flexDirection: "row", width: width - dynamicSize(40), height: height / dynamicSize(5) }}>

                <View style={{

                    flexDirection: "column",
                    width: width - dynamicSize(185),
                    alignSelf: "center",
                    alignItems: "flex-start",
                    justifyContent: "center"
                }}>

                    <Text style={{
                        marginTop: dynamicSize(10),
                        marginLeft: dynamicSize(30),
                        fontSize: getFontSize(18),
                        textAlign: "left",
                        fontFamily: "ProximaNova-Bold"
                    }}>
                        {t("RAIN_OFF_SCREEN.SWITCH_STATE_ON")}

                    </Text>


                </View>
                <View style={{
                    alignItems: "center", justifyContent: "center",
                    width: dynamicSize(100), borderRadius: dynamicSize(50), flexDirection: "column", alignItems: "center"
                }}>

                    <ImageBackground source={TabIcon.timer} resizeMode="contain" style={{

                        justifyContent: "center", alignItems: "center",
                        alignSelf: "center", width: dynamicSize(100),
                        height: dynamicSize(100)
                    }}>
                        <Image resizeMode="contain" source={TabIcon.rain}
                            style={{ width: dynamicSize(20), height: dynamicSize(20) }} />
                    </ImageBackground>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("TimerSettingsScreen")}

                    style={{ alignItems: "center", justifyContent: "center" }}>

                    <Image source={TabIcon.chevronRight}
                        style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }], marginLeft: dynamicSize(10), alignSelf: "center", width: dynamicSize(20), height: dynamicSize(20), }} />

                </TouchableOpacity>

            </View>

        </View>
    )
    
   
}
const StatusCardRain = ({ deviceService, peripheral, navigation, size, ...props }) => {
    const { t } = useTranslation();
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    let type = "OFF"
    const { status: { sensorType, isSensorWet } } = peripheral
    const rainOff = peripheral.localSettings.rainSettings
        ? peripheral.localSettings.rainSettings.rainOff
        : peripheral.status.rainOff

    if (rainOff == 0 && isSensorWet != true) {
        return null
    }

    const handleStopRainOff = () => {
        if (isConnected) {
            let newControl = new ControlModel({ sensorType })
            newControl.clearRainOff()
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl)
            saveLocalProgram(peripheral, { config: "clear_rain" })
        } else {
            saveLocalProgram(peripheral, { rainOff: 0, config: "rain" })
        }


    }


    if (rainOff > 0 && size == "lg") {
        return (

            <View style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: dynamicSize(50), alignItems: "center",
                paddingVertical: dynamicSize(50),
            }}>
                <Text style={{
                    fontSize: getFontSize(18),
                    textAlign: "left",
                    fontFamily: "ProximaNova-Bold"
                }}>
                    {t("RAIN_OFF_SCREEN.RAIN_DROP_HEADING")}
                </Text>

                <ImageBackground
                    source={TabIcon.timer} resizeMode="contain" style={{
                        marginVertical: dynamicSize(10),
                        justifyContent: "center", alignItems: "center",
                        alignSelf: "center", width: dynamicSize(150),
                        height: dynamicSize(150)
                    }}>
                    <Image resizeMode="contain" source={TabIcon.programStatus}
                        style={{ marginHorizontal: dynamicSize(20), width: dynamicSize(20), height: dynamicSize(20) }} />
                </ImageBackground>
                <Text style={{
                    marginVertical: dynamicSize(10),
                    fontSize: getFontSize(15),
                    textAlign: "left",
                    fontFamily: "ProximaNova-Regular",
                    color: "grey"
                }}>
                    {t('RAIN_OFF_SCREEN.UNTIL_DATE', { date: moment().add(rainOff, 'days').format("DD/MM/YYYY"), interpolation: { escapeValue: false } })}
                </Text>
            </View>
        )
    }
    return (
        <>
            <WetSensor t={t} isSensorWet={isSensorWet} navigation={navigation}/>
           {rainOff > 0 &&
              <View style={styles.card}  >
                <View style={{ justifyContent: "space-between", flexDirection: "row", width: width - dynamicSize(40), height: height / dynamicSize(5) }}>
                    <View style={{
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingHorizontal: dynamicSize(20),
                    }}>

                        <Text style={{
                            fontSize: getFontSize(18),
                            textAlign: "left",
                            fontFamily: "ProximaNova-Bold"
                        }}>
                            {t('RAIN_OFF_SCREEN.RAIN_DROP_HEADING')}
                        </Text>
                        <Text style={{
                            marginVertical: dynamicSize(10),
                            fontSize: getFontSize(15),
                            textAlign: "left",
                            fontFamily: "ProximaNova-Regular",
                            color: "grey"
                        }}>
                            {t('RAIN_OFF_SCREEN.UNTIL_DATE', { date: moment().add(rainOff, 'days').format("DD/MM/YYYY"), interpolation: { escapeValue: false } })}
                        </Text>
                        <TouchableOpacity
                            disabled={!isConnected}
                            onPress={handleStopRainOff}
                            style={{
                                alignSelf: "flex-start",
                                width: dynamicSize(90), height: dynamicSize(30), borderRadius: dynamicSize(20),
                                backgroundColor: !isConnected ? "#ccc" : "rgba(34, 167, 240, 1)", alignItems: "center", justifyContent: "center"
                            }}>

                            <Text style={{
                                color: "rgba(255, 255, 255, 1.0)", fontFamily: "ProximaNova-Bold", fontSize: getFontSize(15)
                            }}>{t('COMMON.STOP')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: dynamicSize(50), alignItems: "center"
                    }}>

                        <ImageBackground
                            source={TabIcon.timer} resizeMode="contain" style={{

                                justifyContent: "center", alignItems: "center",
                                alignSelf: "center", width: dynamicSize(100),
                                height: dynamicSize(100)
                            }}>
                            <Image resizeMode="contain" source={TabIcon.programStatus}
                                style={{ marginHorizontal: dynamicSize(20), width: dynamicSize(20), height: dynamicSize(20) }} />
                        </ImageBackground>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("TimerSettingsScreen")}
                            style={{ alignItems: "center", justifyContent: "center" }}>

                            <Image source={TabIcon.chevronRight}
                                style={{
                                    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                                    marginLeft: dynamicSize(10),
                                    alignSelf: "center", width: dynamicSize(20), height: dynamicSize(20),
                                }} />

                        </TouchableOpacity>
                    </View>
                </View>


              </View>
            }
        </>
    )

}



const styles = StyleSheet.create({
    card: {

        width: width - dynamicSize(35),
        height: height / dynamicSize(4),
        elevation: dynamicSize(0.4),
        borderWidth: dynamicSize(0.5),
        backgroundColor: "white",
        borderColor: "#ddd",
        shadowColor: "#000",
        alignSelf: "center",
        marginHorizontal: dynamicSize(10),
        marginVertical: dynamicSize(20),
        shadowOpacity: dynamicSize(0.3)
    },
    textStyleRain: {
        marginHorizontal: dynamicSize(40),
        fontSize: getFontSize(15),
        textAlign: "left",
        fontFamily: "ProximaNova-Regular",
        color: "grey"

    },

})

export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)(memo(withNavigation(StatusCardRain)))

