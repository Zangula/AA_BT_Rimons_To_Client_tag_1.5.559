import React, {useEffect, useState, memo} from "react"
import { Dimensions, View, Text, Image, ImageBackground, TouchableOpacity, I18nManager } from "react-native"

import { dynamicSize } from "../../dynamicsize";
import moment from 'moment';

const { width, height } = Dimensions.get('window')
const timer = require("../../../Assets/Images/timer.png")
const timerIrrigating = require("../../../Assets/Images/timer_irrigating.gif")
const animatedDrop = require("../../../Assets/Gif/drop.gif")
const valveONImage = require('../../../Assets/Images/valveOn.png')
const valveImage = require('../../../Assets/Images/faucet.png')
import { useTranslation } from 'react-i18next';
const IrrigationIndicator = ({ isOpen= false, hh, mm,ss, size="sm", onEnd }) => {
    const { t } = useTranslation();
    const isSecondsSupported = false
    const [timeLeftSec, setTimeLeftSec] = useState(0)
    useEffect(() => {
        const newTimeLeft = hh*60*60 + mm*60 + ss
        if(!newTimeLeft){
            clearInterval(intervalId)
            return
        }
        setTimeLeftSec(newTimeLeft)
        const intervalId = setInterval(() => {
            setTimeLeftSec(prevTimeLeftSec =>{
                if(prevTimeLeftSec<=0){
                    onEnd && onEnd()
                    clearInterval(intervalId)
                    return 0
                }
                 return prevTimeLeftSec - 1
            })
        }, 1000);
           // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
    }, [hh, mm, ss])
    const timeLeftString =  moment.utc(timeLeftSec*1000).format('HH:mm:ss')
    const imageWidth = size=="lg" ? dynamicSize(180) : dynamicSize(130)
    return (
        <View style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row"
        }}>
            <ImageBackground key={`back-image-${isOpen ? 'irrigating' : 'timer'}`} source={ isOpen ? timerIrrigating :  timer} resizeMode="contain" style={{
                alignItems: "center",
                justifyContent: "center",
                width: imageWidth,
                height: imageWidth,
                borderRadius: dynamicSize(150),
                flexDirection: "column",
                alignItems: "center"
            }}>
                <Image source={isOpen ? valveImage : valveONImage} 
                    resizeMode="contain"
                    style={{
                        width: isOpen > 0 ? dynamicSize(30) : dynamicSize(40) ,
                        height: isOpen > 0 ? dynamicSize(26) : dynamicSize(40) ,
                    }} />
                { isOpen > 0 && 
                    <Image source={animatedDrop}
                        resizeMode="center" 
                        style={I18nManager.isRTL ?  {
                           marginRight: 20, height: 20,
                        } : {
                            marginLeft: 20, height: 20,
                         }} />
                }
                {isOpen > 0 && 
                    <View style={{ alignItems: "center",
                    justifyContent: "center",}}>
                        <Text style={{ fontSize: 20, fontFamily: "ProximaNova-Regular" }}>{ timeLeftString }</Text>
                        <Text> { t('COMMON.TIME_LEFT') } </Text>
                    </View>
                }

            </ImageBackground>
        </View>
    )
}

export default memo(IrrigationIndicator); 