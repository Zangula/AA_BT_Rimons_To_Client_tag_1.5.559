import React, { useState, useEffect , memo} from 'react';
import { I18nManager , Image, TouchableOpacity, View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';

import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize'
import TabIcon from "bt-app/components/TabIcon";
import { withNavigationFocus } from '@react-navigation/compat';
import {
    parseTime, parseTimeWithSec
} from 'bt-app/Utils/conversion'
import {
    initialWeekDays
} from 'bt-app/components/DayList/constants';

import moment from 'moment';
import { useTranslation } from 'react-i18next';
const IrrigationCard = ({valveInfo, program, ...props}) => {
    const { t } = useTranslation();
    const [state, setState] = useState({ start_at: null, activeCycle: []   })
    useEffect(() => {
        let start_at;
        if(program.programType  == 'weekly'){
            for (const a of program.startTimes) {
                if( a.isActive && a.hh < 24 && a.mm < 60 ){
                    start_at = moment( `${a.hh}:${a.mm}`, 'HH:mm').format( t("FORMATS.TIME") ) 
                    break  
                }
            }
            for (let index = 0; index < 7; index++) {
                if(program.activeDayInWeek[index] == 1){ 
                    const day = initialWeekDays.find( f => f.index == index)
                    setState({ ...state, start_at, programType: "WEEKLY", activeCycle: [ ...state.activeCycle, t(`DAYLIST.${day.day}`)] })
                }
            }        
        }
        if(program.programType  == 'cyclic'){
            
            if(program.every > 0){
                start_at = moment( `${program.cyclicStartHH}:${program.cyclicStartMM}`, 'HH:mm').format(t("FORMATS.TIME"))  
                setState({ ...state,start_at, programType: "CYCLIC", activeCycle: [t('COMMON.EVERY_CYCLE', {count: program.every, range_unit: program.everyUnit})]})
            }
        }
    }, [program])
    

    return (
        <View style={styles.card}>
            <View style={{ flex: 0.2, flexDirection: "column", alignItems: "center", paddingVertical: dynamicSize(20) }}>
                <Image resizeMode="contain" source={TabIcon.irrigationiamge} />
            </View>
            <View style={{flex: 0.7,  flexDirection: "column", paddingVertical: dynamicSize(20) }}>
                <View style={{flexDirection: "row", alignItems: "flex-start", }}>
                    <Text style={{ textAlign: 'left', fontFamily: "ProximaNova-Regular", width: dynamicSize(80), fontSize: getFontSize(18), fontFamily: "ProximaNova-Bold" }}>
                        { t('VALVE_STATUS.VALVE_NUMBER',{number: program.valveNumber})}
                    </Text>
                    <Text style={{marginHorizontal: dynamicSize(10), fontSize: getFontSize(18), fontFamily: "ProximaNova-Bold" }}>
                        {valveInfo.name ?  ` - ${valveInfo.name}` : ''}
                    </Text>
                </View>
                
                { state.activeCycle.length ?
                    <>
                        <View style={{flexDirection: "row", alignItems: "flex-start", }}>
                            <Text style={{  textAlign: 'left', fontFamily: "ProximaNova-Regular", width: dynamicSize(80), fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold", }}>{t('IRRIGATINVIEW_SCREEN.DURATION')}</Text>
                            <Text style={{  fontFamily: "ProximaNova-Regular", marginHorizontal: dynamicSize(10), fontSize: getFontSize(15), fontFamily: "ProximaNova-Regular", }}>
                                { props.isDurationSecondsSupported 
                                    ? parseTimeWithSec(program.hh, program.mm,program.ss)
                                    : parseTime(program.hh, program.mm)
                                }
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "flex-start",  }}>
                            <Text style={{   textAlign: 'left', fontFamily: "ProximaNova-Regular", width: dynamicSize(80), fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold", }}>{ t(`PROGRAM_SCREEN.PROGRAM_TYPE_${state.programType}`) }</Text>
                            <Text style={{  fontFamily: "ProximaNova-Regular",marginHorizontal: dynamicSize(10), fontSize: getFontSize(15), fontFamily: "ProximaNova-Regular",  }}>{state.activeCycle}
                            </Text>
                        </View>
                    
                    { state.start_at &&
                        <View style={{ flexDirection: "row", alignItems: "flex-start",  }}>
                         <Text style={{   textAlign: 'left', fontFamily: "ProximaNova-Regular", width: dynamicSize(80), fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold", }}>{t('IRRIGATINVIEW_SCREEN.START_AT')}</Text>
                         <Text style={{  fontFamily: "ProximaNova-Regular",marginHorizontal: dynamicSize(10), fontSize: getFontSize(15), fontFamily: "ProximaNova-Regular",  }}>{state.start_at}
                         </Text>
                     </View>
                    }
                    </>
                    : 
                    <View style={{ flexDirection: "row", alignItems: "flex-start",  }}>
                        <Text style={{fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15), color: "#ccc" }}>{ t('IRRIGATINVIEW_SCREEN.NO_ACTIVE')} </Text>
                    </View>
                    
                }
            
                
            </View>
            <TouchableOpacity style={{ flex: 0.1, alignItems: "center", justifyContent: "center" }} 
            onPress={() => props.navigation.navigate("Program")} >
            <Image source={TabIcon.chevronRight} style={{
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                marginHorizontal: dynamicSize(20), alignItems: "flex-start",
                height: dynamicSize(20),
            }} />

        </TouchableOpacity>
   
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        flex: 1,
        flexDirection: "row",
        padding: 10, 
        elevation: dynamicSize(4),
        borderWidth: dynamicSize( StyleSheet.hairlineWidth *2),
        borderColor: "#ddd",
        shadowColor: "#000",
        marginHorizontal: dynamicSize(10),
        marginVertical: dynamicSize(10),
        
        marginHorizontal: dynamicSize(10),
    },
});

export default memo(withNavigationFocus(IrrigationCard))