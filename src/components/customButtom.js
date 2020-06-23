import React, { Component } from 'react';
import {
    View, Text, Image,
    Dimensions, Platform, StyleSheet,
    TextInput, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { dynamicSize, getFontSize } from '../components/dynamicsize'
const { width, height } = Dimensions.get('window')
export const CustomButton = ({ disabled, ...props}) => {
    return (
        <TouchableOpacity
            disabled={disabled}
            style={[{
                bottom: 0, left: 0, right: 0, position: "absolute", backgroundColor: 'rgba(46, 204, 113, 1)', width: width, height: dynamicSize(60),
                alignItems: 'center', justifyContent: 'center'
            }, props.style]}
            onPress={props.onPress}
        >
            <Text style={[{ color: "white", fontSize: dynamicSize(15), fontFamily: "ProximaNova-Bold" }, props.textStyle]}>
                {props.status}
            </Text>
        </TouchableOpacity>
    )
}
