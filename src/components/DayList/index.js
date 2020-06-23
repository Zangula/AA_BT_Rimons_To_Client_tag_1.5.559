//import liraries
import React, { Component , memo} from 'react';
import { Dimensions,FlatList, Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
const { width, height } = Dimensions.get('window')
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { dynamicSize, getFontSize } from "../dynamicsize";
import{initialWeekDays} from './constants'
import { useTranslation } from 'react-i18next';
const DayList =  ({onSelect,activeDayInWeek, ...props}) => {
    const { t } = useTranslation();
    const renderDayDetails = ({item, index}) => {
        return (
            <TouchableOpacity
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: wp("14%"),
                    flexDirection: "row"
                }}
                onPress={() => {
                    let days = [...activeDayInWeek]
                    days[item.index] = days[item.index] == 1 ? 0 : 1
                    onSelect({activeDayInWeek: days})
                }}
            >
                { activeDayInWeek[item.index] ? (
                    <View
                        style={{
                            borderRadius: dynamicSize(5),
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            backgroundColor: "rgba(34, 167, 240, 1)",
                            width: wp("13%"),
                            height: hp("7%")
                        }}
                    >
                        <Image
                            source={TabIcon.shape}
                            resizeMode="contain"
                            style={{ width: dynamicSize(12), height: dynamicSize(15) }}
                        />
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15), color: "white" }}>
                            {t(`DAYLIST.${item.day}`)}
                        </Text>
                    </View>
                ) : (
                        <Text
                            style={{
                                fontFamily: "ProximaNova-Regular",
                                fontSize: getFontSize(15),
                                color: "rgba(34, 167, 240, 1)"
                            }}
                        >
                            {t(`DAYLIST.${item.day}`)}
                        </Text>
                    )}
            </TouchableOpacity>
        );
    }
 
    return (
            <FlatList
                showsVerticalScrollIndicator={false}
                data={initialWeekDays}
                extraData={activeDayInWeek}
                horizontal={true}
                renderItem={ renderDayDetails }
                keyExtractor={item => `${item.day}-${item.index}`}
            />
        
    );
    
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

export default memo(DayList)