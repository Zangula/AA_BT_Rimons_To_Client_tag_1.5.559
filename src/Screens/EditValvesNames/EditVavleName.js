import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
const ChangeNameComponent = ({item, index, onChangeText}) => {
  const { t } = useTranslation();
  const [focus, setFocus] = useState(false)
  const placeholder= t('VALVE_STATUS.VALVE_NUMBER', {number: item.number})

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper} >
        <Text style={[styles.text, { fontFamily: "ProximaNova-Bold" }]}> {placeholder} </Text>
        <TextInput
          maxLength={10}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChangeText={(text) => onChangeText(index,text)}
          value={item.name || ''}
          style={[styles.input, {
            borderBottomColor: focus
              ? 'grey'
              : 'green',
          }]}
          placeholder={t('EDIT_VALVE_NAMES.VALVE_PLACEHOLDER')} ></TextInput>
      </View>
    </View>

  );

}
const styles = StyleSheet.create({
  container: {
  
  },
  inputWrapper: {
    paddingTop: 20,
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 0.2,
    fontSize: 16,
    paddingHorizontal: 8,
    textAlign: "left",
    fontFamily: "ProximaNova-Regular",
  },
  input: {
    color: "#000",
    flex: 0.8,
    height: 40,
    paddingBottom: 5,
    borderRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    paddingHorizontal: 15,
    fontFamily: "ProximaNova-Regular",
  }




})
export default memo(ChangeNameComponent)