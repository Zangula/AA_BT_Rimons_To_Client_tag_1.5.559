import React,{useEffect} from 'react';
import { BackHandler, I18nManager, Text, View, TouchableOpacity, Image, Alert, AppState } from 'react-native';
import i18next from 'i18next';
import { initReactI18next, useTranslation,  } from 'react-i18next';
import  NavigationsIcons from 'bt-app/components/NavigationIcons';
import { dynamicSize, getFontSize } from 'bt-app/components/dynamicsize'
import Picker from "react-native-picker";
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage';
import { restartPeripheralScan} from 'bt-app/Redux/actions/BTActions';
//https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
import en from './en'; //ISO 639-1
import he from './he'; //ISO 639-1
import ca from './ca'; //ISO 639-1
import de from './de'; //ISO 639-1
import es from './es'; //ISO 639-1
import fr from './fr'; //ISO 639-1
import el from './el'; //ISO 639-1
import it from './it'; //ISO 639-1
import pt from './pt'; //ISO 639-1
import ru from './ru'; //ISO 639-1
import {getLocales} from "react-native-localize";
import _get from 'lodash/get';
const resources = {
  en,
  he,
  ca,
  de,
  es,
  fr,
  el,
  it,
  pt,
  ru,
}
export const setLocalePopup = (selectedLang) =>{
  if(!resources[selectedLang]){
    selectedLang = "en"
  }
  if(I18nManager.isRTL == resources[selectedLang].isRTL ){
    
    AsyncStorage.setItem('@i18next-async-storage/user-language', selectedLang)
    const CONFIRM_TITLE_LANGUAGE_CHANGE =  i18next.t('LANGUAGE_POPUP.CONFIRM_TITLE_LANGUAGE_CHANGE')
    const CONFIRM_BODY_LANGUAGE_CHANGE  = i18next.t('LANGUAGE_POPUP.CONFIRM_BODY_LANGUAGE_CHANGE')
    const BUTTON_OK = i18next.t('LANGUAGE_POPUP.BUTTON_OK')
    Alert.alert(CONFIRM_TITLE_LANGUAGE_CHANGE, CONFIRM_BODY_LANGUAGE_CHANGE ,[
      {
        text:  BUTTON_OK,
        onPress: () => {
          i18next.changeLanguage(selectedLang)
          AsyncStorage.setItem('@i18next-async-storage/user-language', selectedLang)
        },
      },
    ])
  }else{
    const CONFIRM_TITLE_EXIT =  i18next.t('LANGUAGE_POPUP.CONFIRM_TITLE_EXIT')
    const CONFIRM_BODY_EXIT =  i18next.t('LANGUAGE_POPUP.CONFIRM_BODY_EXIT')
    Alert.alert(CONFIRM_TITLE_EXIT, CONFIRM_BODY_EXIT ,[
      
    ],{ cancelable: false })
 }
}

export const setLocale = (selectedLang) =>{

  if(!resources[selectedLang]){
    selectedLang = "en"
  }
  if(I18nManager.isRTL == resources[selectedLang].isRTL ){
    i18next.changeLanguage(selectedLang)
    AsyncStorage.setItem('@i18next-async-storage/user-language', selectedLang)
  }else{
    const CONFIRM_TITLE =  _get(resources[selectedLang], 'translation.LANGUAGE_POPUP.CONFIRM_TITLE') || i18next.t('LANGUAGE_POPUP.CONFIRM_TITLE')
    const CONFIRM_BODY = _get(resources[selectedLang], 'translation.LANGUAGE_POPUP.CONFIRM_BODY') || i18next.t('LANGUAGE_POPUP.CONFIRM_BODY')
    const BUTTON_CONFIRM = _get(resources[selectedLang], 'translation.LANGUAGE_POPUP.BUTTON_CONFIRM') || i18next.t('LANGUAGE_POPUP.BUTTON_CONFIRM')
    Alert.alert(CONFIRM_TITLE, CONFIRM_BODY ,[
      {
        text:  BUTTON_CONFIRM,
        onPress: () => {
          i18next.changeLanguage(selectedLang)
          I18nManager.forceRTL(resources[selectedLang].isRTL)
          I18nManager.allowRTL(resources[selectedLang].isRTL)
          AsyncStorage.setItem('@i18next-async-storage/user-language', selectedLang)
          restartPeripheralScan()
          RNRestart.Restart();
        },
      },
    ])
 }
}

export const osLocale = ()=>{
  const locales = getLocales() || []
  return (locales[0] ? locales[0].languageCode : "en")
}
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect:  async function(callback){
    try {
      let systemLocale = osLocale()
      if(!resources[systemLocale]){
        systemLocale = "en"
      }

      if(I18nManager.isRTL == resources[systemLocale].isRTL){
        callback(systemLocale)
      }else{
        I18nManager.forceRTL(resources[systemLocale].isRTL)
        I18nManager.allowRTL(resources[systemLocale].isRTL)
        RNRestart.Restart();
      }
      
    } catch(error){
       __DEV__ && console.log("locale error", error)
      callback('en')
    }
  },
  init: () => {},
  cacheUserLanguage: function(language){
    try {
      AsyncStorage.setItem('@i18next-async-storage/user-language', language)
    } catch(error){

    }
  }
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: __DEV__,
    resources ,
  });

export default function LanguageManager() {
  const { t, i18n } = useTranslation();
  const options = {
    keys: Object.keys(resources),
    pickerData: Object.keys(resources).map(r => resources[r]['translation']['COMMON']['LANGUAGE']) 
  }

  
  const pickerShowforDrawer = () => {
    Picker.init({
        pickerData: options.pickerData,
        selectedValue: [t('COMMON.LANGUAGE')],
        pickerConfirmBtnText:  t('LANGUAGE_POPUP.BUTTON_SELECT') ,
        pickerTitleText: t('LANGUAGE_POPUP.TITLE'),
        pickerCancelBtnText: t('COMMON.CANCEL'),
        wheelFlex: [1],
        onPickerConfirm: pickedValue => {
           const selectedLang = options.keys[options.pickerData.findIndex(l => l == pickedValue[0])]
           setLocale(selectedLang)
        },
        onPickerCancel: pickedValue => {
            
        },
        onPickerSelect: pickedValue => {
        }
    })
    Picker.show()
 }

if(!__DEV__){
  return null
}
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 30 }}>
      <TouchableOpacity style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}} onPress={pickerShowforDrawer}>
        <Text style={{fontFamily: "ProximaNova-Regular",}}>{t('COMMON.LANGUAGE')}</Text>
        <Image
            resizeMode='contain'
            source={NavigationsIcons.arrowDropDown}
            style={{
                marginHorizontal: dynamicSize(8),
            }}
        />
      </TouchableOpacity>
    </View>
  );
}