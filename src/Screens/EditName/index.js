
import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { CustomButton } from 'bt-app/components/customButtom';
import { connect as reduxConnect } from 'react-redux';
import { withNavigationFocus } from '@react-navigation/compat';
import {
  type ReduxState,
  saveDeviceAttributes,
  ConnectionState,
} from 'bt-app/BTService/Reducer';
import { useTranslation } from 'react-i18next';
import {isDebugInterfaceEnabled, toggleDebugInterface} from 'bt-app/Redux/actions/DebugActions'
import { debugCheatCode } from '../../../app.json'; 

const Editname = ({navigation, ...props}) => {
  const { t } = useTranslation();
  const {params} = props.route
  const {device} = params || {}
  const [name, setName] = useState(device.name)
  const [nameFocused, setNameFocused] = useState(false)
  const [note, setNote] = useState(device.note)
  const [noteFocused, setNoteFocused] = useState(false)
  
  useEffect(()=>{
    setName(device.name)
    setNote(device.note)
  },[device.name, device.note])
  
  const saveDetails = () => {
    props.saveDeviceAttributes(device, {name,note})
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper} >
        <Text style={[styles.text, { fontFamily: "ProximaNova-Bold" }]}> {device.modelName}</Text>
        <TextInput
          onChangeText={(text) => setName(text)}
          value={name}
          onSubmitEditing={()=>{
            __DEV__ && console.log("cheat test", {name,debugCheatCode})
            if(name == debugCheatCode){
             
              Alert.alert(
                "Debugging Mode",
                `Turn Mode ${ isDebugInterfaceEnabled() ? "OFF" : "ON" } ?`,
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'OK', onPress: () => {
                    props.toggleDebugInterface(!isDebugInterfaceEnabled());
                  }},
                ],
              )
              return false
            }
          }}
          onFocus={() => setNameFocused(true) }
          onBlur={() => setNameFocused(false) }
          style={[styles.input, {
            borderBottomColor: nameFocused
              ? 'grey'
              : 'green',
          }]}
          placeholder={t('EDIT_NAME_SCREEN.DEVICE_NAME')} placeholderTextColor="#ccc"></TextInput>

      </View>

      <View style={styles.inputWrapper}>
        <Text style={[styles.text, { fontFamily: "ProximaNova-Regular" }]}>{t('EDIT_NAME_SCREEN.NOTE')} </Text>
        <TextInput 
          onChangeText={(text) => setNote(text)}
          value={note}
          onFocus={() => setNoteFocused(true) }
          onBlur={() => setNoteFocused(false) }
          style={[styles.input, {
            borderBottomColor: noteFocused
              ? 'grey'
              : 'rgba(34, 167, 240, 1)',
          }]}  placeholder={t('EDIT_NAME_SCREEN.NOTE')} placeholderTextColor="#ccc"></TextInput>
      </View>
      <CustomButton
        onPress={saveDetails}

        status={t('EDIT_NAME_SCREEN.BUTTON_SAVE')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "left",
    color: 'black',
    fontSize: 15,
    paddingHorizontal: 10,
    fontFamily: "ProximaNova-Regular",
    flex: 0.2,
  },
  input: {
    flex: 0.8,
    color: "#000",
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 15,
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    fontFamily: "ProximaNova-Regular",
  }




})


export default reduxConnect(
  (state) => ({

  }),
  {
    saveDeviceAttributes,
    toggleDebugInterface,
  },
)( memo(withNavigationFocus(Editname)) );
