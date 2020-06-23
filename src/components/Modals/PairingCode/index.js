import React, { useEffect, useState, memo } from "react"
import {
    ImageBackground,
    Image,
    Modal,
    SectionList,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    TextInput,
} from "react-native"
const { width, height } = Dimensions.get('window')
import {
    type ReduxState,
    connect,
    promptPermisison,
    disconnect,
    disconnectAll,
    executeTest,
    heartBeat,
    ConnectionState,
  } from 'bt-app/BTService/Reducer';
import { connect as reduxConnect } from 'react-redux';
import { dynamicSize, getFontSize } from '../../dynamicsize'
import { useTranslation } from 'react-i18next';
import {setPeripheral , pairPeripheral, restartPeripheralScan} from 'bt-app/Redux/actions/BTActions';
import { GlobalColor, TOTAL_ATTEMPT_NUMBER, REFRESH_RATE } from 'bt-app/GlobalConstants'

const ConnectionAttempt = {
    ATTEMPTING: "ATTEMPTING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PROCESSING: "PROCESSING",
}
const PairingModal = ({visible,onPairingCallback,appState, auth, deviceService, ...props }) => {
    const isTransitionState = deviceService.connectionState === ConnectionState.CONNECTING ||
                            deviceService.connectionState === ConnectionState.DISCOVERING ||
                            deviceService.connectionState === ConnectionState.DISCONNECTING
    const { t } = useTranslation();
    const [code, setCode] = useState({text:'', error: "", connectionAttempt: ConnectionAttempt.ATTEMPTING })
    const isConnected = deviceService.connectionState === ConnectionState.CONNECTED
    useEffect(() => {
        setCode({text:'', error: "" })
    }, [visible])

    const handleActions =(actionType)=>{
        if(actionType == 'cancel'){
            onPairingCallback('CANCELLED')
            deviceService.id && props.disconnect(deviceService)
        }

        if(actionType == 'validate'){
            if(auth.isValidCode(code.text)){
                pairPeripheral(deviceService)
                setCode( prev => ({...prev, connectionAttempt: ConnectionAttempt.PROCESSING }))
                onPairingCallback('SUCCESS')
            }else{
                setCode({...code, error: t('ERRORS.INVALID_PAIRING_CODE')  })
                onPairingCallback('FAILED')
            }

        }
        
    }
    const describeName = () => {
        switch (deviceService.connectionState) {
          case ConnectionState.CONNECTING:
            return t('COMMON.CONNECTING')
          case ConnectionState.DISCOVERING:
            return t('COMMON.DISCOVERING')
          default:
        }
    }

    const connectAttempt = () =>{
        setCode( prev => ({...prev, connectionAttempt: ConnectionAttempt.ATTEMPTING, error: "" }))
        props.connect(deviceService, auth, (connsectionStatus)=>{
            console.log("connsectionStatus", connsectionStatus)
            if(connsectionStatus == ConnectionState.CONNECTED){
                setCode( prev => ({...prev, connectionAttempt: ConnectionAttempt.SUCCESS }))
            }else{
                setCode( prev => ({...prev, connectionAttempt: ConnectionAttempt.FAILED, error: t('ERRORS.NOT_CONNECTED') }))
            }
        })
    }
    const retryConnecting = () =>{
        setCode( prev => {
            props.disconnectAll(props.peripherals,()=>{
                connectAttempt()
            })
            return({...prev, connectionAttempt: ConnectionAttempt.ATTEMPTING, error: "" })
        })
       
    }

    useEffect(() => {
        var cancelled = null
        if(deviceService.id && appState == 'active' && !isConnected && visible){
          __DEV__ && console.log(
            `Device: ${deviceService.id}`, 
            {appState, connectionState: deviceService.connectionState, failedAttempt:  deviceService.failedAttempt}
          )
          connectAttempt()
        }
        return ()=>{
          cancelled = true
        }
      }, [deviceService.id]) 
    

   
    return (
        <View>
            <Modal
                visible={visible}
                transparent={true}>

                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(122, 122, 122,0.3)',  }} >
                    <View
                        style={{
                            minWidth: 250,
                            paddingVertical: dynamicSize(30),
                            backgroundColor: 'white',
                            borderRadius: 6,
                            alignSelf: 'center',
                            paddingHorizontal: dynamicSize(40)
                        }}>
                        <Text style={{ 
                            maxWidth: dynamicSize(250),
                            marginTop: dynamicSize(25),
                            marginBottom: dynamicSize(15), 
                            textAlign: "center",
                            fontSize: getFontSize(20), 
                            fontFamily: "ProximaNova-Bold" 
                        }}>
                          {  t('WELCOME_SCREEN.ENTER_PARING_CODE') }
                        </Text>
                       
                            <View style={{
                                justifyContent: "center", alignItems: "center", paddingHorizontal: dynamicSize(0),
                            }}>
                            { code.connectionAttempt == ConnectionAttempt.SUCCESS ?
                                <TextInput
                                    maxLength={auth.MAX_LENGTH}
                                    style={{ 
                                        textAlign: "center",
                                        height: dynamicSize(42),
                                        width: "100%",
                                        fontSize: getFontSize(18), 
                                        fontFamily: "ProximaNova-Bold", height: dynamicSize(40), 
                                        justifyContent: "center", 
                                        alignItems: "center",
                                        alignSelf: "center", 
                                        borderBottomWidth: 1, 
                                    borderTopColor: 
                                    code.text.length == auth.MAX_LENGTH ? 
                                    "rgba(34, 167, 240, 1)" : "grey", 
                                    }}
                                    onChangeText={(text) => setCode(prev => ({...prev, error: "", text}))}
                                    placeholderTextColor="black"
                                    value={code.text}
                                    keyboardType='numeric'

                                /> : null
                             }
                            <Text style={{ fontFamily: "ProximaNova-Regular"}} > {describeName()}  </Text>
                            
                        </View> 
                        <View style={{ alignItems: 'flex-start', alignSelf: "center" }}>
                            <Text style={{ fontFamily: "ProximaNova-Regular", color: 'red', fontSize: getFontSize(12), textAlign: 'left' }}>{code.error}</Text>
                        </View>
                        <View  style={{ flexDirection: "column"}} >
                            { (code.connectionAttempt == ConnectionAttempt.SUCCESS || code.connectionAttempt == ConnectionAttempt.PROCESSING) &&
                                <TouchableOpacity
                                    disabled={code.connectionAttempt == ConnectionAttempt.PROCESSING}
                                    style={[{ 
                                        justifyContent: "center", alignItems: "center", 
                                        marginVertical: dynamicSize(20), alignSelf: "center", 
                                        width: "100%",
                                        backgroundColor: (code.text.length != auth.MAX_LENGTH || code.connectionAttempt == ConnectionAttempt.PROCESSING
                                            ? "#ccc"
                                            : "rgba(34, 167, 240, 1)"
                                        ), 
                                        height: dynamicSize(45), borderRadius: dynamicSize(25) 
                                    }]}
                                    onPress={() => handleActions('validate') } >
                                    <Text style={{ color: "white", fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold" }}>{ code.connectionAttempt == ConnectionAttempt.PROCESSING ?  t("COMMON.PLEASE_WAIT") : t("COMMON.OK") }</Text>
                                </TouchableOpacity>
                            }
                            { code.connectionAttempt == ConnectionAttempt.FAILED &&
                                <TouchableOpacity
                                    style={[{ 
                                        justifyContent: "center", alignItems: "center", 
                                        marginVertical: dynamicSize(20), alignSelf: "center", 
                                        width: "100%",
                                        backgroundColor: "rgba(34, 167, 240, 1)",
                                        height: dynamicSize(45), borderRadius: dynamicSize(25) 
                                    }]}
                                    onPress={retryConnecting } >
                                    <Text style={{ color: "white", fontSize: getFontSize(15), fontFamily: "ProximaNova-Bold" }}>{ t("COMMON.RETRY") }</Text>
                                </TouchableOpacity>
                            }
                            
                            { code.connectionAttempt == ConnectionAttempt.PROCESSING ? null :
                                <TouchableOpacity disabled={isTransitionState} onPress={() => handleActions('cancel') }>
                                    <Text style={{
                                        fontSize: getFontSize(15),
                                        textAlign: "center",
                                        color: isTransitionState ? "#ccc" : "rgba(34, 167, 240, 1)",
                                        fontFamily: "ProximaNova-Bold"
                                    }}>
                                    {isTransitionState ? t('COMMON.PLEASE_WAIT') : t('WELCOME_SCREEN.BUTTON_PAIRING_CANCEL') }</Text>
                                </TouchableOpacity>
                            }
                            
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default reduxConnect(
    ({BTService, peripherals, internal}, state): $Shape<Props> => ({
      appState: internal.appState,
      prevAppState: internal.prevAppState,
      bleState: BTService.bleState,
      connectionState: BTService.connectionState,
      deviceService: BTService.peripherals[state.deviceID] || {},
      peripherals: Object.values(BTService.peripherals),
    }),
    {
      executeTest,
      connect,
      disconnect,
      disconnectAll,
    },
  )( memo(PairingModal) );