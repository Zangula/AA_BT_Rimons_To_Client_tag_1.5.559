import React, { useState, memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import EditVavleName from './EditVavleName'
import { withNavigationFocus } from '@react-navigation/compat';
import { connect as reduxConnect } from 'react-redux';
import { CustomButton } from "bt-app/components/customButtom";
import produce from 'immer';
import {changeValveNameLocally} from 'bt-app/Redux/actions/BTActions';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from 'bt-app/components/Modals/Confirmation'
const EditVavleNames  = ({peripheral}) => {
    if(!peripheral){ return null }
    const { t } = useTranslation();
    const [valveNames, setValveNames] = useState(peripheral.localSettings.valvesInfo)
    const [confirmModal, setconfirmModal] = useState({ visible: false, type: '' })
    const handlSaveAction = ()=>{
        changeValveNameLocally(peripheral,valveNames)
        setconfirmModal({
            isProcessing: false,
            visible: true,
            type: "settings_saved_locally",
            subHeading: t('INFO.SETTINGS_SAVED_LOCALLY'),
            icon: IndicationIcons.success,
            confirm: {
                text: t('COMMON.OK'),
                callback: () => {
                    setconfirmModal({ visible: false })
                },
            },
        })
    }

    const onChangeText = (index: number, text: string) => {
        setValveNames(produce(valveNames, draft=>{
            draft[index].name = text
        }))
    }
    if(!Array.isArray(valveNames)){
        return(
            <View style={[styles.container, {justifyContent: "center", alignItems: "center"}]}>
                <Text> {t('INVALID_DEVICE_READ')}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
             removeClippedSubviews={false}
            style={{
                marginBottom: 60,
            }}
            data={valveNames}
            renderItem={({ item, index }) => {
                return (
                    <EditVavleName item={item} index={index} onChangeText={onChangeText}/>
                )
            }}
            />
            <ConfirmationModal {...confirmModal} />
            <CustomButton
                onPress={handlSaveAction}
                status={"SAVE"}
                style={{}} />
        </View>
    );
    
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
    },
    item: {
        padding: 10,
        fontSize: 18, height: 44,
    },
})

export default reduxConnect(
    ({BTService, peripherals}): $Shape<Props> => ({
      connectionState: BTService.connectionState,
      deviceService: BTService.peripherals[peripherals.currentDeviceID] || {},
      peripheral: peripherals.list.find( d => d.id == peripherals.currentDeviceID),
    }),
    {
    },
)( memo(withNavigationFocus(EditVavleNames)) );
