import React, { Component, useState, useEffect, memo } from "react"
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Modal,
    Alert,
    I18nManager
} from "react-native"

import NavigationsIcons from "bt-app/components/NavigationIcons";
import IndicationIcons from 'bt-app/components/IndicationIcons';
import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize"
import NextIrrigation from "bt-app/components/NextIrrigation"

import ProgramModel from 'bt-app/BTService/models/program';
import DateTimeModel from 'bt-app/BTService/models/date_time';
import ControlModel from 'bt-app/BTService/models/control';
import DeviceFamily from 'bt-app/BTService/models/family';
import ConfirmationModal from 'bt-app/components/Modals/Confirmation'
import SeasonalAdjust from 'bt-app/components/SeasonalAdjustment'
import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from 'bt-app/BTService/Reducer';
import {
    saveLocalProgram,
    changeValveStatusLocally,
} from 'bt-app/Redux/actions/BTActions'
import {
    GLTimerTests
} from 'bt-app/BTService/tests';

import { connect as reduxConnect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GlobalColor } from 'bt-app/GlobalConstants'

const { width, height } = Dimensions.get("window")


const TimerDrawer = ({ peripheral, navigation, deviceService, ...props }) => {
    const { t } = useTranslation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    const isTransitionState = deviceService.connectionState === ConnectionState.CONNECTING ||
                                deviceService.connectionState === ConnectionState.DISCOVERING ||
                                deviceService.connectionState === ConnectionState.DISCONNECTING
    let { status: { sensorType, valvesNumber, seasonalAdjustmentSupported }, program } = peripheral;
    const [confirmModal, setconfirmModal] = useState({ visible: false, type: '' })
    const [info, setinfo] = useState({ nameMapping: "" })
    const onPressBackDrawer = () => {
        navigation.reset()
    }

    useEffect(() => {
        const family = new DeviceFamily(peripheral)
        setinfo({
            nameMapping: family.nameMapping,
        })
    }, [peripheral.id])


    const describeName = () => {
        switch (deviceService.connectionState) {
            case ConnectionState.CONNECTING:
                return t('COMMON.CONNECTING')
            case ConnectionState.DISCOVERING:
                return t('COMMON.DISCOVERING')
            default:
                return peripheral.name ? t("COMMON.DECRIBED_NAME", { modelName: info.nameMapping, name: peripheral.name }) : info.nameMapping

        }
    }
    
    const handleOk = (type) => {
        console.log("actionType", type)
        if (type == 'BT:A-->T:update_settings') {
            setconfirmModal(prevConfirmModal => ({ ...prevConfirmModal, isProcessing: true }))
            const localSettings = peripheral.localSettings
            const date_time = new DateTimeModel({ sensorType })
            let newPrograms = []
            let newControl = new ControlModel({ sensorType })

            let updates = {
                control: newControl,
                date_time: date_time,
            }

            for (const valveNum in localSettings.programs) {
                if (localSettings.programs.hasOwnProperty(valveNum)) {
                    let newProgram = new ProgramModel({ sensorType, valveNumber: valveNum })
                    let _program = localSettings.programs[valveNum]
                    let err = newProgram.validateWith(_program)
                    newPrograms.push(newProgram)
                }
            }

            if (newPrograms.length) {
                updates.programs = newPrograms
            }

            if (localSettings.rainSettings) {
                if (localSettings.rainSettings.rainOff == 0) {
                    newControl.clearRainOff()
                } else {
                    newControl.setRainOff(localSettings.rainSettings.rainOff)
                }
                updates.control = newControl
            }

            props.executeTest(GLTimerTests.WRITE_DEVICE.id, updates, () => {
                handleBulkUpdates('BT:A-->T:update_settings_success')
            })
            saveLocalProgram(peripheral, { config: "clear_all" })
            return
        }

        if (type == 'BT:A<--T:update_settings') {
            setconfirmModal(prevConfirmModal => ({ ...prevConfirmModal, isProcessing: true }))
            saveLocalProgram(peripheral, { config: "clear_all" })
            props.executeTest(GLTimerTests.READ_DEVICE.id, null, () => {
                handleBulkUpdates('BT:A<--T:update_settings_success')
            })
            return
        }

        if (type == 'BT:clear_settings') {
            setconfirmModal(prevConfirmModal => ({ ...prevConfirmModal, isProcessing: false }))
            let newControl = new ControlModel({ sensorType })
            let newPrograms = []
            saveLocalProgram(peripheral, { config: "clear_all" })
            for (const valveNum in peripheral.programs) {
                if (peripheral.programs.hasOwnProperty(valveNum)) {
                    let newProgram = new ProgramModel({ sensorType, valveNumber: valveNum })
                    newProgram.clearAllSettings()
                    newPrograms.push(newProgram)
                    saveLocalProgram(peripheral, { program: newProgram, config: "program" })
                }

            }


            handleBulkUpdates('BT:clear_settings_success')
            // DONT Clear the timer prog
            // it is not asked :|
            // const date_time = new DateTimeModel({ sensorType })
            // newControl.setClose();
            // props.executeTest(GLTimerTests.WRITE_DEVICE.id, {
            //     control: newControl,
            //     programs: newPrograms,
            //     date_time: date_time,
            // })
            return
        }

        Alert.alert("", t('ERRORS.NOT_VALID_ACTION'), [
            { text: t('COMMON.OK'), onPress: () => { } },
        ])
    }

    const handleCancel = (type) => {
        setconfirmModal({ visible: false })
    }

    const handleBulkUpdates = (actionType) => {
        if (actionType == 'BT:A-->T:update_settings') {
            setconfirmModal({
                isProcessing: false,
                visible: true,
                type: actionType,
                heading: t('INFO.UPDATE_SETTINGS_CONFIRM'),
                subHeading: t('INFO.CONFIRM_EXPORT_SETTINGS'),
                icon: IndicationIcons.sync,
                close: {
                    text: t('COMMON.NO'),
                    callback: handleCancel,
                },
                confirm: {
                    text: t('INFO.BUTTON_YES_AND_UPDATE'),
                    callback: handleOk,
                }
            })
            return
        }

        if (actionType == 'BT:A-->T:update_settings_success') {
            setconfirmModal({
                isProcessing: false,
                visible: true,
                type: actionType,
                subHeading: t("INFO.UPDATE_SUCCESS"),
                icon: IndicationIcons.sync,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: handleCancel,
                },
            })
            return
        }

        if (actionType == 'BT:A<--T:update_settings') {
            setconfirmModal({
                isProcessing: false,
                visible: true,
                type: actionType,
                heading: t('INFO.UPDATE_SETTINGS_CONFIRM'),
                subHeading: t('INFO.CONFIRM_IMPORT_SETTINGS'),
                icon: IndicationIcons.sync,
                close: {
                    text: t('COMMON.NO'),
                    callback: handleCancel,
                },
                confirm: {
                    text: t('INFO.BUTTON_YES_AND_UPDATE'),
                    callback: handleOk,
                }
            })
            return
        }

        if (actionType == 'BT:A<--T:update_settings_success') {
            setconfirmModal({
                visible: true,
                type: actionType,
                subHeading: t("INFO.UPDATE_SUCCESS"),
                icon: IndicationIcons.sync,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: handleCancel,
                },
            })
            return
        }

        if (actionType == 'BT:clear_settings') {
            setconfirmModal({
                visible: true,
                type: actionType,
                heading: t('INFO.DELETE_SETTINGS_CONFIRMATION'),
                subHeading: t('INFO.DELETE_SETTINGS_CONFIRMATION_SUBHEADING'),
                icon: IndicationIcons.destroy,
                close: {
                    text: t('COMMON.NO'),
                    callback: handleCancel,
                },
                confirm: {
                    text: t('INFO.BUTTON_DELETE_CONFIRM'),
                    callback: handleOk,
                }
            })
            return
        }

        if (actionType == 'BT:clear_settings_success') {
            setconfirmModal({
                visible: true,
                type: actionType,
                subHeading: t('INFO.DELETE_SETTINGS_SUCCESS'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: handleCancel,
                },
            })
            return
        }

        Alert.alert(actionType, t('ERRORS.NOT_VALID_ACTION'), [
            { text: t('COMMON.OK'), onPress: () => { } },
        ])
    }

    if (!peripheral.id) {
        return null
    }
    return (
        <View style={{ flex: 1 }} >

            <View style={{ flex: 0.7, backgroundColor: "rgb(250,250,250)", }}>
                <View
                    style={{
                        backgroundColor: GlobalColor.primaryThemeColor,
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50),
                    }}>
                    <TouchableOpacity
                        disabled={isTransitionState}
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center"
                        }} onPress={onPressBackDrawer}>
                        <Image
                            resizeMode='contain'
                            source={NavigationsIcons.back}
                            style={{
                                marginHorizontal: dynamicSize(10),
                                height: dynamicSize(30),
                                transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                                tintColor: isTransitionState ? "#ccc" : "#fff",
                            }}
                        />
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                        }} >
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: getFontSize(15),
                                    fontFamily: "ProximaNova-Bold",
                                    opacity: isTransitionState ? 0.7 : 1
                                }}>
                                {isTransitionState ? t('COMMON.PLEASE_WAIT') : t('MENU.BACK_TO_TIMERS')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("EditTimerInnerNameScreen", { device: peripheral })}
                    style={{
                        marginHorizontal: dynamicSize(18),
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}>
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                    }} >
                        <Text
                            style={{
                                fontSize: getFontSize(15),
                                fontFamily: "ProximaNova-Bold"
                            }}>
                            {describeName()}
                        </Text>
                    </View>
                </TouchableOpacity>
                {valvesNumber > 1 &&
                    <TouchableOpacity
                        style={{
                            borderBottomWidth: 0.5,
                            borderBottomColor: "lightgrey",
                            alignItems: "center",
                            flexDirection: "row",
                            height: dynamicSize(50)
                        }}
                        onPress={() => {
                            navigation.navigate("EditTimerVavlesNameScreen"),
                                navigation.closeDrawer()
                        }}>
                        <Image
                            source={NavigationsIcons.valve}
                            style={{
                                marginHorizontal: dynamicSize(8),
                                width: dynamicSize(30),
                                height: dynamicSize(30)
                            }}
                        />
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                        }} >
                            <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>

                                {t('MENU.EDIT_VALVE_NAMES')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                }
                <TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => {
                        navigation.navigate("TimerSettingsScreen"),
                            navigation.closeDrawer()
                    }}>
                    <Image
                        source={NavigationsIcons.rainOff}
                        style={{
                            marginHorizontal: dynamicSize(8),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('MENU.RAIN_OFF')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => handleBulkUpdates('BT:clear_settings')}>
                    <Image
                        source={NavigationsIcons.clear}
                        style={{
                            marginHorizontal: dynamicSize(8),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row",
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('MENU.CLEAR_ALL_SETTINGS')}
                        </Text>
                    </View>
                </TouchableOpacity>


                <View
                    style={{

                        flexDirection: "column",
                        height: dynamicSize(50)
                    }}>
                    <Text
                        style={{
                            marginHorizontal: dynamicSize(15),
                            marginVertical: dynamicSize(8),
                            fontSize: getFontSize(15),
                            fontFamily: "ProximaNova-Bold",
                            textAlign: "left"
                        }}>
                        {t('MENU.UPDATE_SETTINGS')}

                    </Text>

                    <TouchableOpacity
                        disabled={!isConnected}
                        style={{
                            borderBottomWidth: 0.5,
                            borderBottomColor: "lightgrey",
                            alignItems: "center",
                            flexDirection: "row",
                            height: dynamicSize(50)
                        }}
                        onPress={() => handleBulkUpdates('BT:A-->T:update_settings')}>
                        <Image
                            source={NavigationsIcons.updateToTimer}
                            resizeMode='contain'

                            style={{
                                transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                                tintColor: !isConnected ? "#ccc" : null,
                                marginHorizontal: dynamicSize(8),
                                width: dynamicSize(30),
                                height: dynamicSize(30)
                            }}
                        />
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                        }} >
                            <Text style={[{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }, !isConnected ? { color: "#ccc" } : {}]}>
                                {t('MENU.UPDATE_APP_TO_TIMER')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!isConnected}
                        style={{
                            borderBottomWidth: 0.5,
                            borderBottomColor: "lightgrey",
                            alignItems: "center",
                            flexDirection: "row",
                            height: dynamicSize(50)
                        }}
                        onPress={() => handleBulkUpdates('BT:A<--T:update_settings')}>
                        <Image
                            source={NavigationsIcons.updateToApp}
                            style={{
                                transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                                tintColor: !isConnected ? "#ccc" : null,
                                marginHorizontal: dynamicSize(8),
                                width: dynamicSize(30),
                                height: dynamicSize(30)
                            }}
                        />
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                        }} >
                            <Text style={[{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }, !isConnected ? { color: "#ccc" } : {}]}>
                                {t('MENU.UPDATE_TIMER_ON_APP')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
            <View style={{ flex: 0.3, justifyContent: "flex-end", flexDirection: "column", marginVertical: 5 }}>
                {seasonalAdjustmentSupported &&
                    <SeasonalAdjust size="sm" />
                }

                <NextIrrigation
                    onPress={() => navigation.navigate("Program")}
                    navigation={navigation}
                    style={{
                        backgroundColor: "rgba(34, 167, 240, 1)",
                        borderRadius: dynamicSize(5),
                        marginHorizontal: dynamicSize(5),
                        marginVertical: dynamicSize(5),
                    }}
                />
            </View>
            <ConfirmationModal {...confirmModal} />
        </View>
    )
}

export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        testInfo: {
            currentTest: BTService.currentTest,
            prevTest: BTService.prevTest
        },
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
        executeTest,
    },
)(memo(TimerDrawer));

