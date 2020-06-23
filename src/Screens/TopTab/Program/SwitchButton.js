import React, {memo } from "react";
import {
    Image,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize";

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { useTranslation } from 'react-i18next';
const SwitchButton = ({ type, selected, icon, onPress }) => {
    const { t } = useTranslation();
    return (
        <View 
        style={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "column",
            height: dynamicSize(62),
        }}>
            <TouchableOpacity
            onPress={onPress}
            style={{
                width: wp("40%"),
                shadowOpacity: dynamicSize(0.3),
                shadowColor: "#000",
                borderRadius: dynamicSize(8),
                height: dynamicSize(45),
                alignSelf: "center",
                backgroundColor: selected
                    ? "rgba(34, 167, 240, 1)"
                    : "white",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row"
            }}
        >
            <Image
                source={icon}
                resizeMode="contain"
                style={{
                    width: dynamicSize(22),
                    height: dynamicSize(22),
                    
                }}
            />
            <Text
                style={{
                    fontFamily: "ProximaNova-Regular",
                    marginLeft: dynamicSize(8),
                    color: selected
                        ? "white"
                        : "rgba(34, 167, 240, 1)",
                    fontSize: getFontSize(15)
                }}
            >
                {t(`PROGRAM_SCREEN.PROGRAM_TYPE_${type}`)}
        </Text>
        {selected && <View style={styles.TriangleShapeCSS} /> }
        </TouchableOpacity>
        
        
    </View>

    );

}
const styles = StyleSheet.create({
    TriangleShapeCSS: {
        position: "absolute",
        bottom: -9,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 9,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: "rgba(34, 167, 240, 1)"
      }
})
export default memo(SwitchButton)
