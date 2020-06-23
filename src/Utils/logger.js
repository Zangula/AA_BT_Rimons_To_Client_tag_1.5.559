//import {store} from '../Redux/store'
import {WRITE_LOG, CLEAR_LOG} from 'bt-app/Redux/actions/ActionTypes'
import { showMessage } from "react-native-flash-message";
import _filter from 'lodash/filter';
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
export const log =  async ({message = "defaut", data}) =>{
    process.env.reduxStore && process.env.reduxStore.getState().internal.isDebugMode == true && process.env.reduxStore.dispatch({type: WRITE_LOG, message, data})
}
import moment from 'moment'
process.env.popupMessages = []
process.env.errorMessages = []

export const logError =  async ({message = "defaut", data}) =>{
    process.env.reduxStore && process.env.reduxStore.getState().internal.isDebugMode == true && process.env.reduxStore.dispatch({type: WRITE_LOG, message, data})
}
export const logPopup =  async (message = "message") =>{
    if(process.env.reduxStore && process.env.reduxStore.getState().internal.isPopupMode == true){
        let shownMessage = "", now = new Date()
        process.env.popupMessages.push({time: now.toISOString(), message})
        process.env.popupMessages =  _filter(process.env.popupMessages, i=>{
            const duration = moment.duration(moment(now).diff(moment(i.time)));
            if(duration.asSeconds() <= 5){
                shownMessage = shownMessage + i.message
                return true
            }
            return false
        })
        __DEV__ && console.log("shownMessage", shownMessage)
        showMessage({
            type: "danger", 
            animationDuration: 220,
            duration: 10000,
            message: shownMessage,
        })
    }
}

export const showErrorMessage =  async (message = "message") =>{
    let shownMessage = "", now = new Date()
    process.env.errorMessages.push({time: now.toISOString(), message})
    process.env.errorMessages =  _filter(process.env.errorMessages, i=>{
        const duration = moment.duration(moment(now).diff(moment(i.time)));
        if(duration.asSeconds() <= 5){
            shownMessage = shownMessage + i.message
            return true
        }
        return false
    })
    __DEV__ && console.log("shownMessage", shownMessage)
    showMessage({
        type: "danger", 
        animationDuration: 220,
        duration: 10000,
        message: shownMessage,
        renderCustomContent: (<View><Text> sdfsdfsdfsfd  </Text> </View>)
    })
}

export const clearDebugLog = async () =>{
    process.env.reduxStore && process.env.reduxStore.dispatch({type: CLEAR_LOG})
}

