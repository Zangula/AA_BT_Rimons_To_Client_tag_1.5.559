import React, { useState, memo } from "react";
import {
    ScrollView,
    ImageBackground,
    Image,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    FlatList
} from "react-native";
import moment from 'moment';
import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize";
const { width, height } = Dimensions.get("window");
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import i18next from 'i18next';
import DateTimePicker from "bt-app/components/DateTimePicker";

import Picker from "react-native-picker";

import { withNavigationFocus } from '@react-navigation/compat';


import { connect } from "react-redux";

import {
    TD,
} from './constants';
import TabIcon from "bt-app/components/TabIcon";
import {
    parseTime, parseTimeWithSec
} from 'bt-app/Utils/conversion'
import produce from 'immer';
import TumblerSwitch from 'bt-app/components/TumblerSwitch'
import { useTranslation } from 'react-i18next';
const CyclicView = ({ peripheral, program, handleChange,isUsing24HouFormat, ...props }) => {
    const { t } = useTranslation();
    const [clockModal, setClockModal] = useState({ clockType: false, onConfirm: null, onCancel: null })

    let { status: {
        sensorType,
        isDurationSecondsSupported,
    }
} = peripheral;

    const setTime = time => {
        const selectedTime = moment(time).format('HH:mm').split(":")
        setClockModal(prevClockModel =>{
            if (prevClockModel.clockType === "startAt") {
                handleChange({ cyclicStartHH: parseInt(selectedTime[0]), cyclicStartMM: parseInt(selectedTime[1]) });
            
                if(moment().isAfter(moment(time))){
                    handleChange({ cyclicStartIn: 1 })
                }
                return({ clockModal: false })
            }
            if (prevClockModel.clockType === "irrigationWindow") {
                handleChange({cycleWindow: produce(program.cycleWindow,draft =>{
                    draft[prevClockModel.index].hh = parseInt(selectedTime[0])
                    draft[prevClockModel.index].mm = parseInt(selectedTime[1])
                })})
                return({ clockModal: false })
            }
            return({...prevClockModel, clockModal: false })
        })
    };

    const pickerShowforCyclic = (clockType) => {
        setClockModal({ clockType: clockType })
        let data = {}
        if (clockType == "startIn") {
            const isInPast = moment(`${program.cyclicStartHH}:${program.cyclicStartMM}`, 'HH:mm').isBefore(moment())
            data = {
                pickerData: [...TD[`START_IN_${sensorType}_OPTIONS`]],
                selectedValue: [program.cyclicStartIn],
                pickerTitleText: '',
            }
            const index = data.pickerData.indexOf(0);
            if(isInPast && index > -1){
                data.pickerData.splice(index, 1); // Itself a timer bug when start at is in past then irrigaiton started on next day.
            }
        }
        if (clockType == "startInUnit") {
            data = {
                pickerData: [program.startInUnit],
                selectedValue: [program.startInUnit],
                pickerTitleText: '',
            }
        }

        if (clockType == "every") {
            if (program.everyUnit == 'days') {
                data = {
                    pickerData: TD.cycle_month,
                    selectedValue: [program.every],
                    pickerTitleText: '',
                }
            } else if(program.everyUnit == 'hours') {
                data = {
                    pickerData: TD[`CYCLE_HOURS_${sensorType}_OPTIONS`],
                    selectedValue: [program.every],
                    pickerTitleText: '',
                }
            }else if(program.everyUnit == 'minutes') {
                    data = {
                        pickerData: TD.CYCLE_MINUTES,
                        selectedValue: [program.every],
                        pickerTitleText: '',
                    }
            }else{
                return 
            }
        }

        if (clockType == "everyUnit") {
            data = {
                selectedValue: [program.everyUnit],
                pickerTitleText: '',
            }
            if(['GEFEN', 'RIMON', 'HOSEND'].includes(sensorType)){
                data.pickerData = ['hours', 'days']
            }
            if(['TAMAR'].includes(sensorType)){
                data.pickerData = ['once', 'minutes', 'hours', 'days']
            }


        }

        if (clockType == "duration") {

            data = isDurationSecondsSupported 
            ? {
                pickerData: [TD.hours, TD.minutes, TD.seconds],
                selectedValue: [program.hh, program.mm, program.ss],
                pickerTitleText: ''
              } 
            : {
                pickerData: [TD.hours, TD.minutes],
                selectedValue: [program.hh, program.mm],
                pickerTitleText: ''
              }
        }
        Picker.init({
            ...data,
            pickerCancelBtnText: t('COMMON.CANCEL'),
            pickerConfirmBtnText: t('COMMON.CONFIRM'),
            wheelFlex: [1, 1],
            pickerToolBarFontSize: 19,
            pickerFontSize: 24,
            pickerRowHeight: 26,
            pickerFontFamily: "ProximaNova-Regular",
            onPickerConfirm: (pickedValue, pickedIndex) => {
                setClockModal(prevClockModel => {
                    if (prevClockModel.clockType == "startIn") {
                        handleChange({ cyclicStartIn: parseInt(pickedValue[0]) });
                    }

                    if (prevClockModel.clockType == "startInUnit") {
                        handleChange({})
                    }


                    if (prevClockModel.clockType == "every") {
                        const selectedValue = parseInt(pickedValue[0])
                        if (program.everyUnit == 'days') {
                            handleChange({ every: 
                                TD.cycle_month.indexOf(selectedValue) > -1
                                        ? selectedValue
                                        : TD.cycle_month[0]
                            });

                        } else if(program.everyUnit == 'hours') {
                            handleChange({ every: 
                                TD[`CYCLE_HOURS_${sensorType}_OPTIONS`].indexOf(selectedValue) > -1
                                        ? selectedValue
                                        : TD[`CYCLE_HOURS_${sensorType}_OPTIONS`][0]
                            });
                        }else if(program.everyUnit == 'minutes') {
                                handleChange({ every: 
                                    TD.CYCLE_MINUTES.indexOf(selectedValue) > -1
                                            ? selectedValue
                                            : TD.CYCLE_MINUTES[0]
                                });
                        }
                        if(program.cyclicStartHH == 255 || program.cyclicStartMM == 255){
                            const t = moment().format('HH:mm').split(":")
                            handleChange({ cyclicStartHH: parseInt(t[0]), cyclicStartMM: parseInt(t[1]) })
                        }
                    }

                    if (prevClockModel.clockType == "everyUnit") {
                        const selected = data.pickerData[pickedIndex[0]]
                        if (selected == 'minutes') {
                            handleChange({
                                everyUnit: "minutes",
                                every: TD.minutes.indexOf(program.every) > -1
                                    ? program.every
                                    : TD.minutes[0]

                            })

                        }else if(selected == 'hours') {
                            handleChange({
                                everyUnit: "hours",
                                every: TD[`CYCLE_HOURS_${sensorType}_OPTIONS`].indexOf(program.every) > -1
                                    ? program.every
                                    : TD[`CYCLE_HOURS_${sensorType}_OPTIONS`][0]

                            })

                        }else if (selected == 'days') {
                            handleChange({
                                everyUnit: "days",
                                every: TD.cycle_month.indexOf(program.every) > -1
                                    ? program.every
                                    : TD.cycle_month[0]
                            })
                        } else  if (selected == 'once'){
                            handleChange({
                                everyUnit: "once",
                                every: 1
                            })
                        }
                    }


                    if (prevClockModel.clockType == "duration") {
                        isDurationSecondsSupported
                        ? handleChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]),  ss: parseInt(pickedValue[2]) })
                        : handleChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]) })
                    }

                    return ({ ...prevClockModel })
                })

            },
            onPickerCancel: pickedValue => {
            },
            onPickerSelect: pickedValue => {

            }
        });
        Picker.show();
    };

    const cyclicStartOn = program.cyclicStartHH < 24 && program.cyclicStartMM < 60
    const startAttoggleSupported = false
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "white",
                alignItems: "center"
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    marginTop: dynamicSize(10),
                    paddingBottom: dynamicSize(70)
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        alignItems: "center",
                        flexDirection: "row",

                        borderBottomWidth: 1,
                        borderBottomColor: "lightgrey",
                        height: dynamicSize(60)
                    }}
                >
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        justifyContent: 'space-between',
                        flex: 1,
                    }} onPress={() => pickerShowforCyclic("duration")}>
                        <View
                            style={{
                                justifyContent: "space-between",
                                flexDirection: "row",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "ProximaNova-Regular",
                                    color: "grey",
                                    fontSize: getFontSize(17),
                                    marginHorizontal: dynamicSize(20)
                                }}
                            >
                                {
                                    isDurationSecondsSupported ? t('PROGRAM_SCREEN.DURATION_WITH_SECONDS'): t('PROGRAM_SCREEN.DURATION')
                                }
                            </Text>

                        </View>
                        <View style={{
                            flexDirection: "row",
                        }} >
                            <Text style={{  fontFamily: "ProximaNova-Regular",color: "black", fontSize: getFontSize(17) }}>
                            { isDurationSecondsSupported 
                                  ? parseTimeWithSec(program.hh, program.mm, program.ss)
                                  : parseTime(program.hh, program.mm)
                                }
                            </Text>
                            <Image
                                source={TabIcon.arrowDropDown}
                                style={{
                                    marginLeft: dynamicSize(10),
                                    width: dynamicSize(20),
                                    height: dynamicSize(20)
                                }}
                            />
                        </View>

                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        alignItems: "center",
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderBottomColor: "lightgrey",
                        height: dynamicSize(60)
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                        }}
                    >
                        <View style={{ width: wp("50%"), alignItems: "flex-start" }}>
                            <Text
                                style={{
                                    fontFamily: "ProximaNova-Regular",
                                    color: "grey",
                                    fontSize: getFontSize(17),
                                    marginHorizontal: dynamicSize(20)
                                }}
                            >
                                {t('PROGRAM_SCREEN.EVERY')}
                             </Text>
                        </View>
                        <View
                            style={{
                                justifyContent: "flex-end",
                                flexDirection: "row",
                                width: wp("50%"),
                                alignItems: "flex-end"
                            }}
                        >
                            { ['minutes','hours', 'days'].includes(program.everyUnit) &&
                                <TouchableOpacity
                                    style={{
                                        alignItems: "flex-end",
                                        flexDirection: "row"
                                    }}
                                    onPress={() => pickerShowforCyclic("every")}
                                >
                                    <Text style={{  fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                                        {program.every == 0
                                            ? t('COMMON.OFF')
                                            : program.every
                                        }
                                    </Text>

                                    <Image
                                        source={TabIcon.arrowDropDown}
                                        style={{
                                            marginLeft: dynamicSize(10),
                                            width: dynamicSize(20),
                                            height: dynamicSize(20)
                                        }}
                                    />
                                </TouchableOpacity>
                            }
                            <TouchableOpacity
                                onPress={() => pickerShowforCyclic("everyUnit")}
                                style={{
                                    marginLeft: dynamicSize(10),
                                    right: 0,
                                    flexDirection: "row"
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "ProximaNova-Regular",
                                        color: "black",
                                        fontSize: getFontSize(17)
                                    }}
                                >
                                    {program.everyUnit}
                                </Text>
                                <Image
                                    source={TabIcon.arrowDropDown}
                                    style={{
                                        marginLeft: dynamicSize(10),
                                        width: dynamicSize(20),
                                        height: dynamicSize(20)
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderBottomWidth: 1,
                        borderBottomColor: "lightgrey",
                        height: dynamicSize(60)
                    }}
                >
                    <View
                        style={{
                            justifyContent: "space-between",
                            flexDirection: "row",
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "ProximaNova-Regular",
                                color: "grey",
                                fontSize: getFontSize(17),
                                marginHorizontal: dynamicSize(20)
                            }}
                        >
                            {t('PROGRAM_SCREEN.START_AT')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (cyclicStartOn) {
                                    handleChange({ cyclicStartHH: 255, cyclicStartMM: 255 })
                                } else {
                                    const t = moment().format('HH:mm').split(":")
                                    handleChange({ cyclicStartHH: parseInt(t[0]), cyclicStartMM: parseInt(t[1]) })
                                }
                            }}
                        >
                            <TumblerSwitch 
                                style={{ marginRight: dynamicSize(120) }}
                                isActive={ cyclicStartOn == true}
                            />
                        </TouchableOpacity>

                    </View>
                    <TouchableOpacity
                        style={{ flexDirection: "row", }}
                        onPress={() =>{
                            Picker.hide()
                            const selectedTime = moment(`${program.cyclicStartHH}:${program.cyclicStartMM}`, 'HH:mm')
                            setClockModal({ 
                                clockType: "startAt",
                                onConfirm: (time)=>{
                                    setTime(time)
                                },
                                onCancel: () => {
                                    setClockModal({ clockType: false })
                                },
                                value: selectedTime.isValid() ?  selectedTime.toDate() : new Date(new Date().setHours(0,0,0,0)),
                            })
                        }}
                    >
                        <Text style={{ fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                            {cyclicStartOn ?
                                moment(`${program.cyclicStartHH}:${program.cyclicStartMM}`, 'HH:mm').format(t(`FORMATS.TIME${isUsing24HouFormat ? "_24" : ""}`))
                                :
                                t('COMMON.OFF')
                            }
                        </Text>
                        <Image
                            source={TabIcon.arrowDropDown}
                            style={{
                                marginLeft: dynamicSize(10),
                                width: dynamicSize(20),
                                height: dynamicSize(20)
                            }}
                        />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        alignItems: "center",
                        flexDirection: "row",

                        borderBottomWidth: 1,
                        borderBottomColor: "lightgrey",
                        height: dynamicSize(60)
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",

                        }}
                    >
                        <View style={{ width: wp("50%"), alignItems: "flex-start" }}>
                            <Text
                                style={{
                                    fontFamily: "ProximaNova-Regular",
                                    color: "grey",
                                    fontSize: getFontSize(17),
                                    marginHorizontal: dynamicSize(20)
                                }}
                            >
                               
                                {t('PROGRAM_SCREEN.START_IN')}
            </Text>
                        </View>
                        <View
                            style={{
                                justifyContent: "flex-end",
                                flexDirection: "row",
                                width: wp("50%"),
                                alignItems: "flex-end"
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    alignItems: "flex-end",
                                    flexDirection: "row"
                                }}
                                onPress={() => pickerShowforCyclic("startIn")}
                            >
                                <Text style={{  fontFamily: "ProximaNova-Regular",color: "black", fontSize: getFontSize(17) }}>
                                    {program.cyclicStartIn}
                                </Text>
                                <Image
                                    source={TabIcon.arrowDropDown}
                                    style={{
                                        marginLeft: dynamicSize(10),
                                        width: dynamicSize(20),
                                        height: dynamicSize(20)
                                    }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => pickerShowforCyclic("startInUnit")}
                                style={{
                                    marginLeft: dynamicSize(10),
                                    right: 0,
                                    flexDirection: "row"
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "ProximaNova-Regular",
                                        color: "black",
                                        fontSize: getFontSize(17)
                                    }}
                                >
                                    {program.startInUnit}
                                </Text>
                                <Image
                                    source={TabIcon.arrowDropDown}
                                    style={{
                                        marginLeft: dynamicSize(10),
                                        width: dynamicSize(20),
                                        height: dynamicSize(20)
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                { program.everyUnit != 'days' &&  program.cycleWindow.length > 0 && program.cycleWindow.map((cw, i) => {
                    return(
                        <View
                           key={`window-${i}`}
                            style={{
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                borderBottomWidth: 1,
                                borderBottomColor: "lightgrey",
                                height: dynamicSize(60)
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: "space-between",
                                    flexDirection: "row",
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "ProximaNova-Regular",
                                        color: "grey",
                                        fontSize: getFontSize(17),
                                        marginHorizontal: dynamicSize(20)
                                    }}
                                >
                                   { i==0 ? t('PROGRAM_SCREEN.IRRIGATION_WINDOW_OPEN'): ''}
                                   { i==1 ? t('PROGRAM_SCREEN.IRRIGATION_WINDOW_CLOSE') : ''}
                                </Text>
                                
                            </View>
                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                }}
                                onPress={() =>{
                                    Picker.hide()
                                    setClockModal({
                                        clockModal: true,
                                        clockType: "irrigationWindow",
                                        index: i,
                                        value: moment( `${cw.hh}:${cw.mm}`, 'HH:mm').toDate(),
                                        onConfirm: (time)=>{
                                            setTime(time)
                                        },
                                        onCancel: () => {
                                            setClockModal({ clockType: false })
                                        }
                                    })
                                }}
                            >
                                <Text style={{ fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                                    {(cw.hh < 24 && cw.mm < 60 ) ?
                                        moment(`${cw.hh}:${cw.mm}`, 'HH:mm').format(t(`FORMATS.TIME${isUsing24HouFormat ? "_24" : ""}`))
                                        :
                                        t('COMMON.OFF')
                                        
                                    }
                                </Text>
                                <Image
                                    source={TabIcon.arrowDropDown}
                                    style={{
                                        marginLeft: dynamicSize(10),
                                        width: dynamicSize(20),
                                        height: dynamicSize(20)
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    )    
                })


                }
            </ScrollView>

            <DateTimePicker
                is24Hour={isUsing24HouFormat}
                isVisible={["startAt", "irrigationWindow"].indexOf(clockModal.clockType) > -1}
                mode="time"
                date={clockModal.value}
                timePickerModeAndroid="clock"
                onCancel={clockModal.onCancel}
                onConfirm={clockModal.onConfirm}
                locale={i18next.locale}
            />
        </View>
    );

}

const mapStateToProps = ({internal}) => {
    return {
        isUsing24HouFormat: internal.isUsing24HouFormat
    };
};
const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( memo(withNavigationFocus(CyclicView)) );
