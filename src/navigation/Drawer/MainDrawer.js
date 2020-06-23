import React, { memo } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Linking,
} from "react-native"

import NavigationsIcons from "bt-app/components/NavigationIcons";
import { dynamicSize, getFontSize } from "bt-app/components/dynamicsize"
import LanguageManager from 'bt-app/I18n'
import { useTranslation } from 'react-i18next';
import { versionNumber } from '../../../app.json'; 
import {isDebugInterfaceEnabled} from 'bt-app/Redux/actions/DebugActions'
import {GlobalColor} from 'bt-app/GlobalConstants'
const DrawerMain = ({ isTimerView = false, ...props }) => {
    const { t } = useTranslation();

    openMarket = () => {
        Linking.openURL("https://galconc.com/product/")
        props.navigation.closeDrawer()
    }
    const openEmail = ID => {
        Linking.openURL(`mailto:${'help@galconc.com'}?subject=Help&body=`)
        props.navigation.closeDrawer()
    }

    return (
        <View style={{ flex: 1,  backgroundColor: "rgb(250,250,250)" }}>
            <View>
                <View style={{backgroundColor: "rgb(256,256,256)"}}>
                    <Image
                        resizeMode='contain'
                        source={NavigationsIcons.galcon}
                        style={{
                            marginHorizontal: dynamicSize(10),
                            width: dynamicSize(170),
                            height: dynamicSize(80),
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => {
                        props.navigation.jumpTo("homeStack"),
                            props.navigation.closeDrawer()
                    }}>
                    <Image
                        source={NavigationsIcons.timers}
                        style={{
                            marginHorizontal: dynamicSize(18),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('MENU.ALL_TIMERS')}
                        </Text>
                    </View>
                </TouchableOpacity>
                { isDebugInterfaceEnabled() &&
                    <TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => {
                        props.navigation.jumpTo("debugStack")
                    }}>
                    <Image
                        source={NavigationsIcons.info}
                        style={{
                            marginHorizontal: dynamicSize(18),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('MENU.DEBUG_INTERFACE')}   
                        </Text>
                    </View>
                </TouchableOpacity>
                }
                
                <View
                    style={{
                        marginHorizontal: dynamicSize(18),
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}>
                    <Text
                        style={{
                            fontSize: getFontSize(15),
                            fontFamily: "ProximaNova-Bold"
                        }}>
                         {t('COMMON.GALCON')}   
                        
                    </Text>
                </View>

                <TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => openMarket()}>
                    <Image
                        source={NavigationsIcons.market}
                        style={{
                            marginHorizontal: dynamicSize(18),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}> {t('MENU.MARKET')}</Text>
                    </View>
                </TouchableOpacity>

                {/*<TouchableOpacity
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}
                    onPress={() => {
                        props.navigation.jumpTo("hotToUseStack"),
                            props.navigation.closeDrawer()
                    }}>
                    <Image
                        source={NavigationsIcons.info}
                        style={{
                            marginHorizontal: dynamicSize(18),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            
                            {t('MENU.HOW_TO_USE')}   
                        </Text>
                    </View>
                </TouchableOpacity> */}

                <TouchableOpacity
                    onPress={openEmail}
                    style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        flexDirection: "row",
                        height: dynamicSize(50)
                    }}>
                    <Image
                        source={NavigationsIcons.contact}
                        style={{
                            marginHorizontal: dynamicSize(18),
                            width: dynamicSize(30),
                            height: dynamicSize(30)
                        }}
                    />
                    <View style={{
                        flex: 1,
                        flexDirection: "row"
                    }} >
                        <Text style={{ fontFamily: "ProximaNova-Regular", fontSize: getFontSize(15) }}>
                            {t('MENU.CONTACT_US')}   
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{width: "100%", position: 'absolute', bottom: 20, justifyContent: "center", alignItems: "center"}}>
                 <LanguageManager navigation={props.navigation} />
                 <Text style={{color: GlobalColor.mainColor}} > {t("MENU.VERSION_NUMBER",{versionNumber})} </Text>
            </View>
        </View>
    )
}

export default memo(DrawerMain)
