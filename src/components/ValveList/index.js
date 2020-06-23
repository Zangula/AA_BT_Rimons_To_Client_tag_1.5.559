//import liraries
import React, { useState } from 'react';
import { Image, Dimensions, FlatList, View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { dynamicSize } from '../dynamicsize';
import Custommodalfortab from './CustomModalFortab';

import { connect as reduxConnect } from "react-redux";

import ConfirmationModal from '../Modals/Confirmation'
import IndicationIcons from '../IndicationIcons';
import { useTranslation } from 'react-i18next';
const irrigationiamge = require("../../Assets/Images/irrigationiamge.png")
const CustomValveList = ({selectedValves, selectValve,faucets=[],peripheral, disabled, menuName, ...props}) => {
    if(!peripheral){ return null }
    const { t } = useTranslation();
    const [menu, setMenu] = useState({copiedProgram: null})
    const [confirmModal, setconfirmModal] = useState({ visible: false, type: '' })

    if(faucets.length < 2 ){
        return null
    }
    const renderValveDetails = ({ item, index }) => {
        return (
            <TouchableOpacity
                disabled={disabled == true}
                onPress={() => selectValve(index + 1)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    width: `${100/6}%`
                }}
            >
                {selectedValves.includes(index  + 1)  ? (
                    <ImageBackground
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            width: wp("12%"),
                            height: hp("7%"),
                            opacity: disabled ? 0.7 : 1, 
                        }}
                        resizeMode="contain"
                        source={irrigationiamge}
                    >
                        <Text style={{ fontSize: 18, fontFamily: "ProximaNova-Bold", color: "white" }}>{index + 1}</Text>
                    </ImageBackground>
                ) : (
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: wp("12%"),
                                height: hp("7%")
                            }}
                        >
                            <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: 18,  textAlign: "center", color: disabled ? "#ccc" : "black" }}>
                                {index + 1}
                            </Text>
                        </View>
                    )}
            </TouchableOpacity>
        );
    }

    
    const handleOption = type => {
        if (type === "ClickCopy") {   
            setMenu({ 
                optionType: "copy",
                copiedProgram: JSON.parse(JSON.stringify(props.copiableData))
            })
            setconfirmModal({
                type: "copied",
                heading: t('INFO.PROGRAM_COPY_SUCCESS'),
                subHeading:  t('INFO.PROGRAM_COPY_SUCCESS_SUBHEADING'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        } else if (type === "onClear") {
            setMenu( prevMenu => {
                props.handleChange('clear')
                return { ...prevMenu, optionType: "clear" }
            })
            setconfirmModal({
                visible: true,
                type: "cleared",
                heading: t('INFO.CLEAR_PROGRAM_HEADING'),
                subHeading: t('INFO.CLEAR_PROGRAM_SUBHEADING'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('INFO.BUTTON_DELETE_CONFIRM'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
                close: {
                    text: t('COMMON.NO') ,
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        } else if (type === "onPaste") {
            setMenu( prevMenu => {
                props.handleChange(menu.copiedProgram)
                return({ ...prevMenu, optionType: "paste" })
            })
            
            setconfirmModal({
                visible: true,
                type: "updated",
                subHeading: t('INFO.UPDATE_SETTINGS_CONFIRM'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('INFO.BUTTON_YES_AND_UPDATE'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
                close: {
                    text: t('COMMON.NO'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        }
       
    };
  
    return (
        <View style={{ zIndex: 2, marginVertical: dynamicSize(6)}}>
            <FlatList
                style={{
                   
                }}
                showsVerticalScrollIndicator={false}
                extraData={selectedValves}
                data={faucets}
                keyExtractor={item=> `valve-${item.number}`}
                renderItem={renderValveDetails}
                numColumns={6}
            />
            {faucets.length > 1 &&
                <>
                    <View
                        style={{
                            marginBottom: dynamicSize(10),
                            opacity: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            justifyContent: "flex-start",
                            flexDirection: "row"
                        }}
                    >
                        <Text numberOfLines={1} style={{  marginLeft: 10, flex: 1, marginRight: 30, flexDirection:"row", overflow: "hidden"}}>
                            { 
                                selectedValves.map((v,i) =>{
                                    const localValveInfo = peripheral.localSettings.valvesInfo.find( f => f.number == v ) || {}
                                    const name = localValveInfo.name || t('VALVE_STATUS.VALVE_NUMBER',{number: v}) 
                                    return(
                                        <Text key={`valve-${i}`} style={{ fontFamily: "ProximaNova-Bold", color: "black" }}>
                                                { name }
                                        </Text>
                                        
                                    )
                                })
                                
                            }
                        </Text>
                        <View style={{
                                position: "absolute",
                                right: 0,
                            }}>
                            <Custommodalfortab
                                menuName={menuName}
                                isReadyToPaste={!!menu.copiedProgram}
                                onClickCopyProgram={() => handleOption("ClickCopy")}
                                onClearProgram={() => handleOption("onClear")}
                                onPasteProgram={() => handleOption("onPaste")}
                            />
                        </View>
                        
                    </View>
                    <ConfirmationModal {...confirmModal} />
                </>
            }
        </View>
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
export default reduxConnect(
    ({ BTService, peripherals }): $Shape<Props> => ({
        connectionState: BTService.connectionState,
        deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
        peripheral: peripherals.list.find(d => d.id == peripherals.currentDeviceID),
    }),
    {
     
    },
)(CustomValveList);
