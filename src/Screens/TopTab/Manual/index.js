import React, { useState, useEffect, memo } from "react"
import { Dimensions, View, Text, Image, TouchableOpacity, Alert } from "react-native"
import { CustomButton } from "bt-app/components/customButtom";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize";
const { width, height } = Dimensions.get('window')
import ControlModel from "bt-app/BTService/models/control";
import { withNavigationFocus } from '@react-navigation/compat';
import { connect as reduxConnect } from 'react-redux';
import { initialValveDetails } from './constants';
import IrrigationIndicator from 'bt-app/components/indicators/Irrigation';
import isEmpty from 'lodash/isEmpty'                            
import Customvalvelist from 'bt-app/components/ValveList';
import {
    TD,
} from './constants';
import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from 'bt-app/BTService/Reducer';

import Picker from "react-native-picker";
import { ScrollView } from "react-native-gesture-handler";

import {
    GLTimerTests
  } from 'bt-app/BTService/tests';
  import {
    parseTime, parseTimeWithSec
} from 'bt-app/Utils/conversion'
import {
    changeValveStatusLocally
} from 'bt-app/Redux/actions/BTActions'
import produce from 'immer'
import { useTranslation } from 'react-i18next';
const DefenManual = ({  deviceService, peripheral, navigation, ...props }) => {
    if(!peripheral || isEmpty(peripheral.status)){ return null }
    const { t } = useTranslation();
    const [isProcessing, setProcessing] = useState(false)
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    const [controls, setControls] = useState(Array(peripheral.status.valvesNumber).fill({hh:0, mm: 0, ss: 0}).reduce(function(result, item , index) {
          result[index +1 ] = item 
          return result;
    }, {}))

    const [actionButton, setActionButton] = useState({})
    const [selectedValves, setSelectedValves] = useState([1])
    const control = controls[selectedValves[0]]
    let { status: {
        isOpen,
        isDurationSecondsSupported,
        valvesNumber,
        sensorType,
        faucets,
        openFaucets,
        rainOff,
        isSensorWet,
      }
    } = peripheral;
    const openFaucet = openFaucets.find(s => s.valve == selectedValves[0] )
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', e => {
          Picker.hide()
        });
      
        return unsubscribe;
    }, [navigation]);
    useEffect(() => {
        if(openFaucet && (openFaucet.openedFrom == "MANUAL" || sensorType == "TAMAR" && openFaucet.openedFrom == "PROGRAM")){     // bug tamr opened from manual dont give its bit open manual
            setActionButton(
                {label: t("MANUAL_SCREEN.BUTTON_STOP"), color:  "rgba(34, 167, 240, 1)"  , action: 'stop'}
            )
        }else{
            setActionButton({label:  t("MANUAL_SCREEN.BUTTON_START"), color:  "rgba(46, 204, 113, 1)" , action: 'start'})
        }
        
    }, [openFaucet])
    

    const isAllValveSelected =  control && control.isAllValveSelected
    const onIrrigationEnd = ()=>{
        changeValveStatusLocally(peripheral, false)
        deviceService.id && props.executeTest(GLTimerTests.READ_DEVICE.id)
    }

    const handleManualAction = (actionName) => {
        let newControl = new ControlModel({sensorType})
        if(actionName == 'start'){
            const timeInSec = control.hh*60*60 + control.mm*60 + control.ss
            if( !(timeInSec > 0) ){
                Alert.alert("",t('ERRORS.DURATION_NOT_PRESENT'),[
                    {text: t('COMMON.OK'), onPress: () =>{ }},
                ])
                return
            }
            if(isOpen && openFaucet &&( openFaucet.openedFrom == "PROGRAM" || openFaucet.openedFrom == "MANUAL" ) ){
                Alert.alert("",t('ERRORS.VALVE_ALREADY_OPEN'),[
                    {text: t('COMMON.CANCEL'), onPress: () =>{ }},
                    {text: t('COMMON.STOP') , onPress: () => handleManualAction('stop')},
                ])
                return
            }
            if( rainOff > 0 ){
                Alert.alert("",t('ERRORS.NOT_ACTIVE'),[
                    {text: t('COMMON.OK'), onPress: () =>{ }},
                ])
                return
            }
            if( isSensorWet == true ){
                Alert.alert("",t('ERRORS.SENSOR_WET'),[
                    {text: t('COMMON.OK'), onPress: () =>{ }},
                ])
                return
            }
            

            newControl.setDuration(control.hh, control.mm, control.ss )
            newControl.setOpen(selectedValves[0])
            
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl, ()=> {
                setProcessing(false) 
            })
            setProcessing(true)
        }
        if(actionName == 'stop'){
            newControl.setClose(selectedValves[0])
            props.executeTest(GLTimerTests.WRITE_CONTROL.id, newControl, ()=> {
                setProcessing(false) 
            })
            setProcessing(true)
        }
        if(__DEV__){
            console.log("newControl:", newControl.pretty() )
        }

    }

    const handleControlChange = (changes) => {
        if(changes == 'clear'){
            setControls(produce(draft=>{
                draft[selectedValves[0]] = { hh: 0, mm: 0, ss: 0}
            }))
            return
        }
        setControls(produce(draft=>{
            for (const key in changes) {
                let value = changes[key];
                if ( changes.hasOwnProperty(key) ) {
                    draft[selectedValves[0]][key] = value
                }
            }
            if(__DEV__){
                console.log("control:",draft, changes)
            }
            }))        
    }

    const handleSelectValve = (param) => {
        if(param == 'all'){
            handleControlChange({isAllValveSelected: !isAllValveSelected})
            return
        }
        if(selectedValves.length == 1 && selectedValves.includes(param)){
            return
        }
        
        if(param > 0){ 
            setSelectedValves(prevSelectedValves => {
                let newValves = prevSelectedValves.indexOf(param) == -1 ? [param,...prevSelectedValves] : prevSelectedValves.filter( f => f != param)
                if(newValves.length > 1){ // Maximum number of valves
                    newValves.pop()
                }
                return newValves;
            }) 
        }
    }


    const pickerShow = () => {
        let data = {}
        if(isDurationSecondsSupported){
            data = {
                pickerData: [TD.hours, TD.minutes, TD.seconds],
                selectedValue: [control.hh, control.mm, control.ss],
                wheelFlex: [1,1,1]
            }
        }else{
            data = {
                pickerData: [TD.hours, TD.minutes],
                selectedValue: [control.hh, control.mm],
                wheelFlex: [1,1]
            }
        } 
        Picker.init({
            ...data,
            pickerTitleText: '',
            pickerCancelBtnText: t('COMMON.CANCEL'),
            pickerConfirmBtnText: t('COMMON.CONFIRM'),
            pickerToolBarFontSize: 19,
            pickerFontSize: 24,
            pickerRowHeight: 26,
            pickerFontFamily: "ProximaNova-Regular",
            onPickerConfirm: pickedValue => {
                if(isDurationSecondsSupported){
                    handleControlChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]), ss: parseInt(pickedValue[2]) });
                }else{
                    handleControlChange({ hh: parseInt(pickedValue[0]), mm: parseInt(pickedValue[1]) });
                }
            },
            onPickerCancel: pickedValue => {
            },
            onPickerSelect: pickedValue => {

            }
        });
        Picker.show();
    };
    

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: "#fff"  }}>
            <ScrollView>
                <Customvalvelist
                    menuName={`manual-menu-${peripheral.id}`}
                    copiableData={control}
                    handleChange={handleControlChange}
                    disabled={isAllValveSelected}
                    selectedValves={selectedValves}
                    faucets={faucets}
                    selectValve={(valveNum)=> handleSelectValve(valveNum) }
                />
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
                <TouchableOpacity style={{
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
                        <Text style={{ fontFamily: "ProximaNova-Regular", color: "black", fontSize: getFontSize(17) }}>
                            { isDurationSecondsSupported 
                                ? parseTimeWithSec(control.hh, control.mm,control.ss)
                                : parseTime(control.hh, control.mm)
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
            { isConnected && openFaucet 
                ?   <View key={`indicator-open`} style={{marginVertical: dynamicSize(20)}}>
                        <IrrigationIndicator  onEnd={onIrrigationEnd} isOpen={(openFaucet.openedFrom == "MANUAL" || sensorType == "TAMAR" && openFaucet.openedFrom == "PROGRAM") } size={"lg"} hh={openFaucet.hh_left} mm={openFaucet.mm_left} ss={openFaucet.ss_left} /> 
                    </View>
                :   <View key={`indicator-empty`} style={{marginVertical: dynamicSize(20)}}>
                       <IrrigationIndicator  onEnd={onIrrigationEnd} isOpen={false} size={"lg"} hh={0} mm={0} ss={0} />
                    </View>
            }
            </ScrollView>
            <CustomButton
                disabled={!isConnected || isProcessing}
                onPress={() => handleManualAction(actionButton.action) }
                status={ isProcessing ? t('COMMON.ACTION_INPROCESS') :  actionButton.label}
                style={[( !isConnected || isProcessing) ? {backgroundColor: "#ccc"} : {
                    backgroundColor: actionButton.color
                }]} />
        </View >
    );

}

export default reduxConnect(
    ({BTService, peripherals}): $Shape<Props> => ({
        testInfo: {
            currentTest: BTService.currentTest,
            prevTest: BTService.prevTest
        },
      connectionState: BTService.connectionState,
      deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
      peripheral: peripherals.list.find( d => d.id == peripherals.currentDeviceID),
    }),
    {
      executeTest,
    },
)(memo(withNavigationFocus(DefenManual)));
