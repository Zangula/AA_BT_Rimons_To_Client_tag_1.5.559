import React, { Component, useState, useEffect, memo , useRef} from "react";
import {
    Image,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert
} from "react-native";

import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize";
import { CustomButton } from "bt-app/components/customButtom";
const { width, height } = Dimensions.get("window");
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Customvalvelist from 'bt-app/components/ValveList';

import ProgramModel from 'bt-app/BTService/models/program';

import ConfirmationModal from 'bt-app/components/Modals/Confirmation'
import IndicationIcons from 'bt-app/components/IndicationIcons'
import { connect as reduxConnect } from "react-redux";
import { bindActionCreators } from "redux";
import CyclicView from './cyclicView';
import WeeklyView from './weeklyView';
import { withNavigationFocus } from '@react-navigation/compat';
import {
    type ReduxState,
    executeTest,
    ConnectionState,
} from 'bt-app/BTService/Reducer';
import {
    GLTimerTests
} from 'bt-app/BTService/tests';
import TabIcon from 'bt-app/components/TabIcon'
import {
    saveLocalProgram
} from 'bt-app/Redux/actions/BTActions'
import SwitchButton from './SwitchButton';
import produce from 'immer'
import { useTranslation } from 'react-i18next';
import Picker from "react-native-picker";
const DefenProgram = ({ deviceService, peripheral, navigation, ...props }) => {
    if(!peripheral){ return null }
    const { t } = useTranslation();
    const prevTest = useRef();
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    const [confirmModal, setconfirmModal] = useState({ visible: false, type: '' })
    const [actionButton, setActionButton] = useState({})
    const [programs, setPrograms] = useState(peripheral.localSettings.programs || peripheral.programs)
    const [selectedValve, setSelectedValve] = useState(1)

    let { status: {
            isCyclicSupported,
            isWeeklySupported,
            valvesNumber,
            sensorType,
            faucets,
        }
    } = peripheral;
    const program = programs[selectedValve]
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', e => {
          Picker.hide()
        });
      
        return unsubscribe;
    }, [navigation]);
    useEffect(() => {
        if (isConnected) {
            setActionButton({ label: t('PROGRAM_SCREEN.BUTTON_SEND_AND_SYNC'), color: "rgba(46, 204, 113, 1)", action: 'send_and_sync' })
        } else {
            setActionButton({ label: t('PROGRAM_SCREEN.BUTTON_SAVE'), color: "rgba(46, 204, 113, 1)", action: 'save' })
        }
    }, [deviceService.connectionState])

    useEffect(() => {
        const progs = peripheral.localSettings.programs || peripheral.programs
        setPrograms(progs)
    }, [peripheral.localSettings.programs || peripheral.programs])



    const sendAndSync = (actionName) => {
        let errors = [], newPrograms = []
        for (const valveNum in programs) {
            let _program = programs[valveNum]
            if (programs.hasOwnProperty(valveNum)) {
                let newProgram = new ProgramModel({valveNumber: valveNum, sensorType})
                let err = newProgram.validateWith(_program)
                if(err){
                    errors = [...errors, ...err]
                }
                newPrograms.push(newProgram)
            }
        }

        if(errors.length){
            const first_err = errors.find( e => e.valveNumber == selectedValve) ||  errors[0]
            const heading = valvesNumber > 1 ? (
                t('VALVE_STATUS.VALVE_NUMBER', {number: first_err.valveNumber}) : ''
            ) : (
                ""
            )
            Alert.alert(heading,t(`ERRORS.${first_err.type}`, first_err.options),[
                {text: t('COMMON.OK'), onPress: () =>{ }},
            ])
            return 
        }

        if (actionName == 'send_and_sync') {
            saveLocalProgram(peripheral, { config: "clear_program" })
            props.executeTest(GLTimerTests.WRITE_PROGRAM.id, newPrograms,()=>{
                setconfirmModal(prevModal => ({...prevModal, isProcessing: false}))
            })
            setconfirmModal({
                isProcessing: true,
                visible: true,
                type: "program_sent_to_timer",
                subHeading: t('INFO.TIMER_UPDATE_SUCCESS'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        }

        if (actionName == 'save') {
            for (const newProgram of newPrograms) {
                saveLocalProgram(peripheral, { program: newProgram, config: "program" })
            }
        
            setconfirmModal({
                visible: true,
                type: "program_saved_locally",
                subHeading: t('INFO.PROGRAM_SAVED_LOCALLY'),
                icon: IndicationIcons.success,
                confirm: {
                    text: t('COMMON.OK'),
                    callback: () => {
                        setconfirmModal({ visible: false })
                    },
                },
            })
        }
    }

    const handleProgramChange = (changes) => {
        if(changes == 'clear'){
            let newProgram = new ProgramModel({valveNumber: selectedValve, sensorType})
            newProgram.clearAllSettings()
            setPrograms(produce(draft=>{
                draft[selectedValve] = newProgram.savableProgram()
            }))
            return
        }
        setPrograms(produce(draft=>{
            for (const key in changes) {
                let value = changes[key];
                if ( changes.hasOwnProperty(key) ) {
                    draft[selectedValve][key] = value
                }
            }
            __DEV__ && console.log("Programs", changes, programs)
        }))
        
    }

    const setprogramType = (type) => {
        handleProgramChange({ programType: type })
    }



    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            <Customvalvelist
                menuName={`program-menu-${peripheral.id}`}
                selectedValves={[selectedValve]}
                copiableData={program}
                faucets={faucets}
                handleChange={handleProgramChange}
                selectValve={(valveNum)=> setSelectedValve(valveNum) }
            />
            <View style={{ marginTop: 15, alignItems: "center" }}>
                <View
                    style={{

                        flexDirection: "row",
                        width: wp("95%"),
                        alignSelf: "center",
                        justifyContent: "space-evenly",
                    }}
                >
                    {isCyclicSupported && program &&<SwitchButton 
                            key='cyclic-button'
                            onPress={() => setprogramType('cyclic')} 
                            selected={program.programType == 'cyclic' }
                            icon={program.programType == 'cyclic'
                                    ? TabIcon.buttonRefreshArrow
                                    : TabIcon.cyclic
                            }
                            type={"CYCLIC"}
                        />
                    }
                    {isWeeklySupported && program &&<SwitchButton 
                         key='weekly-button'
                        onPress={() => setprogramType('weekly')}
                        icon={
                            program.programType == 'weekly'
                            ? TabIcon.settingsSliderCopy
                            : TabIcon.weekly
                         } 
                        selected={program.programType == 'weekly' }
                        type={"WEEKLY"}
                        />
                    }

                </View>
            </View>

            {program && program.programType == 'cyclic' && 
                <CyclicView peripheral={peripheral} program={program} handleChange={handleProgramChange} />
            }

            { program && program.programType == 'weekly' &&
                <WeeklyView peripheral={peripheral} program={program} handleChange={handleProgramChange} />
            }


            <ConfirmationModal {...confirmModal} />
            <CustomButton onPress={() => sendAndSync(actionButton.action)} status={actionButton.label} />
        </View>
    );

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
)( memo(withNavigationFocus(DefenProgram)) );
