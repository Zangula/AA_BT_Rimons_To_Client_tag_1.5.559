// @flow

import React, { useState , memo} from "react";
import {
    ScrollView,
    ImageBackground,
    Image,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    FlatList,
    Platform
} from "react-native";
import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize";
import moment from 'moment';


import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import CustomDayList from "bt-app/components/DayList";
import DateTimePicker from "bt-app/components/DateTimePicker";

import TabIcon from 'bt-app/components/TabIcon'
import Picker from "react-native-picker";

import { withNavigation } from '@react-navigation/compat';

import { connect as reduxConnect } from "react-redux";
import {
    parseTime, parseTimeWithSec
} from 'bt-app/Utils/conversion'

import {
    TD,
} from './constants';
import produce from 'immer'
import { useTranslation } from 'react-i18next';
import TumblerSwitch from 'bt-app/components/TumblerSwitch'
import i18next from "i18next";
const MAX_START_TIMES = 4
const { width, height } = Dimensions.get("window");
const WeeklyProgram = ({ peripheral, program, handleChange,isUsing24HouFormat, ...props }) => {
    const { t } = useTranslation();
    const [clockModal, setClockModal] = useState({ selectedIndex: 0, value: null, isVisible: false, onCancel: null, onConfirm: null })
    let { status: {
            sensorType,
            isDurationSecondsSupported,
        }
    } = peripheral;

    const setTime = time => {
        const selectedTime = moment(time).format('HH:mm').split(":")
        setClockModal(prev => {
        if (prev.clockType === "startAtforweek") {
            handleChange({startTimes: produce( program.startTimes, draft => { 
                draft[prev.selectedIndex].isActive = true
                draft[prev.selectedIndex].hh = parseInt(selectedTime[0]);
                draft[prev.selectedIndex].mm = parseInt(selectedTime[1]);
            })})
        }
        return({ ...clockModal, isVisible: false })
        })
    }


    const pickerShow = () => {
        let data = {}
        if(isDurationSecondsSupported){
            data = {
                pickerData: [TD.hours, TD.minutes, TD.seconds],
                selectedValue: [program.hh, program.mm, program.ss],
                wheelFlex: [1, 1,1],
            }
        }else{
            data = {
                pickerData: [TD.hours, TD.minutes],
                selectedValue: [program.hh, program.mm],
                wheelFlex: [1, 1],
            }
        } 

        Picker.init({
            ...data,
            pickerTitleText: '',
            pickerToolBarFontSize: 19,
            pickerFontSize: 24,
            pickerRowHeight: 26,
            pickerFontFamily: "ProximaNova-Regular",
            pickerCancelBtnText: t('COMMON.CANCEL'),
            pickerConfirmBtnText: t('COMMON.CONFIRM'),
            onPickerConfirm: pickedValue => {
                isDurationSecondsSupported
                ? handleChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]),  ss: parseInt(pickedValue[2]) })
                : handleChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]) })
            },
            onPickerCancel: pickedValue => {
            },
            onPickerSelect: pickedValue => {
                
            }
        });
        Picker.show();
    };


    const _toggleIcon = (item, index) => {
        handleChange({startTimes: produce( program.startTimes, draft => { 
            draft[index].isActive = !item.isActive 
            draft[index].hh = 0 
            draft[index].mm = 0 
            draft[index].ss = 0 

        })})
    };

    const addNewStart = () => {
        if (program.startTimes.length >= MAX_START_TIMES) {
            return
        }
        handleChange({startTimes: produce( program.startTimes, draft => { 
            let dateSet = moment()
            draft.push(
                {
                    isActive: true,
                    hh: parseInt(dateSet.format("HH")),
                    mm: parseInt(dateSet.format("mm")),
                    ss: parseInt(0),
                }
            ) 
        })})
    };

   
    const renderStartTimes = ({ item, index }) => {
        return (
            <View
                style={{
                    alignItems: "center",
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "lightgrey",
                    height: dynamicSize(60),
                    flex: 1,
                    marginHorizontal: dynamicSize(10)
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
                            marginEnd: 20,
                        }}
                    >
                        {t('PROGRAM_SCREEN.WEEKLY_STARTS', {number: index + 1})}
                    </Text>

                    <TouchableOpacity
                        style={{
                            marginRight: dynamicSize(100),
                            width: dynamicSize(40),
                            height: dynamicSize(40),
                        }}
                        onPress={() => _toggleIcon(item, index)}
                    >
                        <TumblerSwitch 
                            style={{ marginRight: dynamicSize(120) }}
                            isActive={item.isActive}
                        />
                       
                    </TouchableOpacity>
                    
                </View>
                <TouchableOpacity
                         
                    style={{flexDirection: "row",flex: 1, justifyContent: "flex-end"}}
                    onPress={() => {
                        Picker.hide()
                        setClockModal({
                            isVisible: true,
                            clockType: "startAtforweek",
                            selectedIndex: index,
                            value: moment( `${item.hh}:${item.mm}`, 'HH:mm').toDate(),
                            onConfirm: (time)=>{
                                setTime(time)
                            },
                            onCancel: () => {
                                setClockModal({ ...clockModal, isVisible: false })
                            }
                        })
                    }}
                >
                    <Text style={{  fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                        {item.isActive ? moment( `${item.hh}:${item.mm}`, 'HH:mm').format(t(`FORMATS.TIME${isUsing24HouFormat ? "_24" : ""}`)) : t('COMMON.OFF')}
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
        );
    };



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
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <View
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            width: width,
                            borderBottomWidth: 1,
                            borderBottomColor: "lightgrey",
                            height: dynamicSize(60)
                        }}
                    >
                        <TouchableOpacity  style={{
                                flexDirection: "row",
                            }} onPress={pickerShow}>
                        <View
                            style={{
                                justifyContent: "space-between",
                                flexDirection: "row",
                                width: width - dynamicSize(40)
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
                            <Text style={{  fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                                { isDurationSecondsSupported 
                                  ? parseTimeWithSec(program.hh, program.mm,program.ss)
                                  : parseTime(program.hh, program.mm)
                                }
                            </Text>
                        </View>
                       
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
                            justifyContent: "center",
                            width: wp("97%"),
                            height: hp("10%")
                        }}
                    >
                        <CustomDayList onSelect={handleChange} activeDayInWeek={program.activeDayInWeek}/>
                    </View>
                    <View style={{flex: 1, flexDirection: "row"}}>
                        <FlatList
                            data={program.startTimes}
                            renderItem={renderStartTimes}
                            keyExtractor={(item, i) => `start-item-${i}`}
                        />
                    </View>
                   
                    <TouchableOpacity
                        disabled={program.startTimes.length >= MAX_START_TIMES}
                        onPress={addNewStart}
                    >
                        <Text
                            style={{
                                fontFamily: "ProximaNova-Regular",
                                marginVertical: dynamicSize(20),
                                fontSize: getFontSize(18),
                                color: program.startTimes.length >= MAX_START_TIMES ? "#ccc" : "rgba(34, 167, 240, 1)"
                            }} >
                                {t('PROGRAM_SCREEN.BUTTON_ADD_NEW_START')}
                            </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>


            <DateTimePicker
                is24Hour={isUsing24HouFormat}
                isVisible={clockModal.isVisible}
                date={clockModal.value}
                mode="time"
                onCancel={clockModal.onCancel}
                onConfirm={clockModal.onConfirm}
                locale={i18next.locale}
            />
        </View>
    );

}
const mapStateToProps = ({internal}) => {
    return({
        isUsing24HouFormat: internal.isUsing24HouFormat
    });
};
const mapDispatchToProps = dispatch => {
    return {
    };
};

export default reduxConnect(
    mapStateToProps,
    mapDispatchToProps
)( memo(withNavigation(WeeklyProgram)) );
