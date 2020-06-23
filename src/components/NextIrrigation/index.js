import React, { useState, useEffect, memo } from 'react';
import {
    View, Text, Image,
    Dimensions, TouchableOpacity, I18nManager,
} from 'react-native';
import { dynamicSize, getFontSize } from '../dynamicsize'
import 'moment/min/locales'

import componentIcons from "../componentIcons"
import { connect as reduxConnect } from 'react-redux';

import {
    type ReduxState,
    executeTest,
} from '../../BTService/Reducer';
import {
    GLTimerTests
} from '../../BTService/tests';
import { initialWeekDays } from '../DayList/constants'
import moment from 'moment';
import i18next from "i18next";

import { useTranslation } from 'react-i18next';
const timeOfDay = (hrs) =>{
    __DEV__ && console.log("hrs", hrs)
    if (hrs == 0)
        return 'MIDNIGHT';
    else if (hrs >= 0 && hrs < 600)
        return 'BEFOREMORNING';
    else if (hrs >= 600 && hrs < 1200)
        return 'MORNING';
    else if (hrs >= 1200 && hrs < 1500)
        return 'NOON';
    else if (hrs >= 1500 && hrs < 1800)
         return 'AFTERNOON';
    else if (hrs >= 1800 && hrs < 2100)
         return 'EVENING';
    else if (hrs >= 2100 && hrs < 2359)
         return 'NIGHT';
}
const { width, height } = Dimensions.get('window')
const NextIrrigation = ({ deviceService, peripheral,isUsing24HouFormat, ...props }) => {
    const { t } = useTranslation();
    const [nextIrrigation, setNextIrrigation] = useState(null)


    useEffect(() => {
        let _nextIrrigations = []
        if (!peripheral) { return }
        for (const valveNum in (peripheral.localSettings.programs || peripheral.programs)) {
            let program = (peripheral.localSettings.programs || peripheral.programs)[valveNum]
            const {
                activeDayInWeek = [],
                startTimes = [],
                cyclicStartMM,
                cyclicStartHH,
                every,
                cyclicStartIn,
                programType,
                startInUnit,
                everyUnit,
            } = program

            if (programType == 'cyclic' && every > 0) { // Calculate next irrigation for cyclic
                let _date = moment(), _now = moment()
                if (cyclicStartHH <= 12 || cyclicStartMM <= 59) { _date = moment(`${cyclicStartHH}:${cyclicStartMM}`, 'HH:mm') }
                if (cyclicStartIn > 0) { _date = _date.add(cyclicStartIn, startInUnit) }
                if (_date > _now) {
                    const _isToday = _date.isSame(_now, "day")
                    _nextIrrigations.push({valveNum, date: _date, hh: program.hh , mm: program.mm})
                    continue
                } else {
                    while (_date < _now && ['days', 'hours'].indexOf(everyUnit) > -1) {
                        if (__DEV__) { console.log("Inside while") }
                        if (everyUnit == 'days') {
                            _date = _date.add(every, 'days')
                        }

                        if (everyUnit == 'hours') {
                            _date = _date.add(every, 'hours')
                        }
                    }
                    _nextIrrigations.push({valveNum, date: _date, hh: program.hh , mm: program.mm})
                    break;
                }
            }

            if (programType == 'weekly') { // Calculate next irrigation for weekly
                const _dayName = moment().format("ddd").toUpperCase(); //Today
                const _hourName = parseFloat(moment().format("HH.mm"))
                let _startTimes = startTimes.map(a => ({ ...a })).sort(function (a, b) {
                    return parseFloat(a.hh) - parseFloat(b.hh);
                })
                let _todayOrMore = null
                for (let [n, i] of [...initialWeekDays, ...initialWeekDays].entries()) {
                    const isThisWeek = (n <= initialWeekDays.length - 1)
                    if (!_todayOrMore && i.day == _dayName) {
                        _todayOrMore = true
                    }
                    if ((_todayOrMore && activeDayInWeek[i.index] == 1)) {
                        let _startTime = null
                        if (i.day == _dayName && isThisWeek) {
                            _startTime = (_startTimes.filter(a => a.isActive && _hourName < parseFloat(moment(`${a.hh}:${a.mm}`, "HH:mm").format("HH.mm"))) || [])[0]
                        } else {
                            _startTime = (_startTimes.filter(a => a.isActive) || [])[0]
                        }
                        if (_startTime) {
                            const time = `${_startTime.hh}:${_startTime.mm}`
                            if (i.day == _dayName && isThisWeek) {
                                _nextIrrigations.push({valveNum, date: moment(time, 'HH:mm'), hh: program.hh , mm: program.mm })
                            } else {
                                _nextIrrigations.push({valveNum, date: moment(moment(time, 'HH:mm')).day(n), hh: program.hh , mm: program.mm})
                            }
                            break; // exit itration
                        }
                    }
                }
            }

        }
        if (_nextIrrigations.length) {
            let _nextIrrigation =  _nextIrrigations.sort((a, b) => a.date.valueOf() - b.date.valueOf())[0],
                _now = moment()
                if(__DEV__){
                    console.log("_nextIrrigations", _nextIrrigations)
                }
            
            if (_nextIrrigation && _nextIrrigation.date.isSame(_now, "day")) {
                setNextIrrigation({
                    valveNum: _nextIrrigation.valveNum,
                    at: t('COMMON.NEXT_IRRIGATION_RUNNING_TODAY',
                        {
                            date: moment(_nextIrrigation.date).locale(i18next.language).format(t(`FORMATS.TODAY_IRRIGATION${isUsing24HouFormat ? "_24" : ""}`)),
                            timeOfDay: t(`DAY_TIMES.${timeOfDay(parseInt(_nextIrrigation.date.format("Hmm")) )}`),
                            interpolation: {
                                escapeValue: false
                            },
                        },
                    ),
                   
                    })
            } else {
                setNextIrrigation({
                    valveNum: _nextIrrigation.valveNum,
                    at: t('COMMON.NEXT_IRRIGATION_RUNNING_OTHER',
                    {
                        date: moment(_nextIrrigation.date).locale(i18next.language).format(t(`FORMATS.NEXT_IRRIGATION${isUsing24HouFormat ? "_24" : ""}`)),
                        timeOfDay: t(`DAY_TIMES.${timeOfDay( parseInt(_nextIrrigation.date.format("Hmm")) )}`),
                        interpolation: {
                            escapeValue: false
                        },
                    },
                )})
                        
            }
        } else {
            setNextIrrigation(null)
        }

    }, [peripheral && peripheral.localSettings.programs || peripheral && peripheral.programs])

    const handleOnPress = () => {
        if (peripheral.status.valvesNumber > 1) {
            props.navigation.navigate("TimerIrrigationListScreen")
            return
        }
        props.navigation.navigate("Program")
    }

    if (!nextIrrigation || !peripheral) {
        return null
    }

    return (
        <TouchableOpacity
            style={[{
                flexDirection: "row", backgroundColor: "rgba(34, 167, 240, 1)", height: dynamicSize(60),
                alignItems: 'center',
            }, props.style]}
            onPress={props.onPress}>

            <Image style={{
                marginHorizontal: dynamicSize(10)
            }} source={componentIcons.irrigation} />
            <View style={{ flex: 1 }}>
                <Text style={[{ textAlign: 'left',color: "white", fontSize: dynamicSize(15), fontFamily: "ProximaNova-Bold" }, props.textStyle]}>
                    {t('COMMON.NEXT_IRRIGATION')}{' '}
                    {peripheral.status.faucets.length > 1 ? t('VALVE_STATUS.VALVE_NUMBER', {number: nextIrrigation.valveNum }) : '' }
                </Text>
                <Text style={[{ textAlign: 'left', fontFamily: "ProximaNova-Regular", color: "white", fontSize: dynamicSize(15), fontWeight: 'normal' }, props.subtextStyle]}>
                    {nextIrrigation.at}
                </Text>
            </View>
            {peripheral.status.valvesNumber > 1 &&
                <TouchableOpacity style={{ width: 50, height: "100%",justifyContent: "center", alignItems: "center"}} onPress={handleOnPress}>
                    <Image style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} source={componentIcons.chevronRightWhite} />
                </TouchableOpacity>
            }

        </TouchableOpacity>
    )




}

export default reduxConnect(
    ({ internal,BTService, peripherals }): $Shape<Props> => ({
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
        isUsing24HouFormat: internal.isUsing24HouFormat,
    }),
    {
        executeTest,
    },
)(memo(NextIrrigation));
