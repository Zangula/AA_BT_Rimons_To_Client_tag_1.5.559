import React, { useEffect, useState } from "react"
import { I18nManager, Image } from "react-native"
import DrawerIcon from 'bt-app/components/DrawerIcon'




export default TumblerSwitch = ({style,isActive, disabled, ...props}) => {
    return(
        <Image
            style={[style,{ opacity: disabled ? 0.5 : 1}, {transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]} ]}
            resizeMode="contain"
            source={
                isActive ? DrawerIcon.tumblerOn : DrawerIcon.tumblerOff
            }
        />
    )
}
