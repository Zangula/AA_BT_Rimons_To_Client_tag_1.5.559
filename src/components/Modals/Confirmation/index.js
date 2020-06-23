
import React, { Component , memo} from 'react';
import { Dimensions, TouchableOpacity, Image, Modal, View, Text, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { dynamicSize, getFontSize } from '../../dynamicsize';

const { width, height } = Dimensions.get('window')

//connect my redux store to this component
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
const ConfirmationModal = ({ isProcessing, type, visible = false, icon , heading,  subHeading , close  , confirm  }) => {
    const {t} = useTranslation()

    const handleOk = () => {
        confirm.callback(type)
    }

    const handleCancel = () => {
        close.callback(type)
    }

    return (
        <Modal
            visible={visible}
            transparent={true}>
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(32, 32, 32,0.8)', alignItems: 'center' }} >
                <View
                    style={{
                        justifyContent: 'center',
                        width: wp("70%"),
                        height: hp("35%"),
                        backgroundColor: 'white',
                        //top: dynamicSize(200),
                        alignSelf: 'center',
                        //justifyContent: 'space-between'
                    }}>
                    <View style={{
                        justifyContent: 'center', alignItems: "center",
                        width: wp("70%"),
                        height: hp("20%"),
                    }}>
                        { icon &&
                            <Image style={{ width: wp("15%"), height: hp("9%") }} resizeMode="contain" source={icon} />
                        }
                        
                        { heading && <Text style={{
                            color: 'black',
                            fontFamily: "ProximaNova-Bold",
                            fontSize: getFontSize(16), textAlign: 'center',
                        }}>
                            {heading}
                        </Text>}
                        { isProcessing == true && 
                            <Text style={{ fontFamily: "ProximaNova-Regular", marginHorizontal: dynamicSize(20), textAlign: "center", margin: dynamicSize(10), color: "rgba(0,0,0,0.54)" }}>
                                {t('COMMON.ACTION_INPROCESS')}
                            </Text>
                        }
                        { isProcessing != true && subHeading &&
                            <Text style={{ fontFamily: "ProximaNova-Regular", marginHorizontal: dynamicSize(20), textAlign: "center", margin: dynamicSize(10), color: "rgba(0,0,0,0.54)" }}>
                                {subHeading}
                            </Text>
                        }
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: hp("7%"), }}>
                        { close && close.callback && 
                            <View style={{ justifyContent: "center", width: dynamicSize(100) }} >
                                <TouchableOpacity onPress={handleCancel}>
                                    <Text style={{
                                        fontSize: getFontSize(15),
                                        fontFamily: "ProximaNova-Regular", color: 'rgba(34, 167, 240, 1)', borderRadius: 0, overflow: 'hidden',
                                        textAlign: 'center'}} >
                                        { isProcessing ?  t('COMMON.CANCEL') : close.text }
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        
                        { confirm && confirm.callback && 
                            <TouchableOpacity
                                disabled={isProcessing}
                                style={[{ alignSelf: "center", justifyContent: "center", height: hp("5%"), alignItems: "center", width: wp("35%"), backgroundColor: "rgba(34, 167, 240, 1)", borderRadius: dynamicSize(20) }, isProcessing ? {backgroundColor: "#ccc"} : {}]}
                                visible={false}
                                onPress={handleOk}
                            >
                                <Text style={{
                                    textAlign: "center",
                                    fontSize: getFontSize(15),
                                    fontFamily: "ProximaNova-Regular",
                                    fontWeight: 'normal', color: 'white',
    
                                }}>
                                    { confirm.text }
                                </Text>
                            </TouchableOpacity>
                     
                        }
                       </View>
                </View>


            </View>

        </Modal>

    )

}

const mapStateToProps = state => {

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {}
}


export default connect(mapStateToProps, mapDispatchToProps)( memo(ConfirmationModal) )
