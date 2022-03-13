import React, { FC, useState, useCallback } from "react";
import { View, Linking, TextInput, Text, Alert, StyleSheet, Pressable } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Mark, ModalActionType, ModalParams } from '../store/types'
import MapModal from './Modal'
import { AirbnbRating } from 'react-native-elements';
import { purple } from "../constants/color";
import { markToDistance } from '../utils/normalize'
import { Position } from 'geojson';
import { useTranslation } from "react-i18next";

interface Props {
    mark: Mark;
    center: Position;
    save: (data: { name: string, description: string, rate: number }) => void;
    remove?: (id: string) => void;
    cancel: () => void;
    showModal: (params: ModalParams)=>void;
}

const EditMark: FC<Props> = ({ mark,center, save, cancel, remove, showModal }) => {
    const [name, setName] = useState<string>(mark?.name || '')
    const [description, setDescription] = useState<string>(mark?.description || '')
    const [rate, setRate] = useState<number>(mark?.rate || 0)
    const [isEdit, setIsEdit] = useState(!mark.id)
    const { t } = useTranslation();

    const openLink = useCallback(async () => {
        const { coordinates } = mark.geometry
        const url = `http://osmand.net/go?lat=${coordinates[1]}&lon=${coordinates[0]}&z=16&name=${mark?.name || ''}`
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            showModal({title:'', text:`${t('Don\'t know how to open this URL')}: ${url}`, actions:[
                {text: t('Ok'), type: ModalActionType.cancel},
            ]})
        }
    }, [mark]);

    const onRemove = () => {
        if (!remove) {
            return
        }
        showModal({title:t('Warning!'), text:t('Are you sure to remove marker?', {name: name || ''}), actions:[
            {text: t('No'), type: ModalActionType.cancel},
            {text: t('Yes'), type: ModalActionType.default, handler: () => remove(mark.id?.toString() || '')},
        ]})
    }
    const onCloseEdit = () => {
        setName(mark?.name || '');
        setDescription(mark?.description || '');
        setRate(mark?.rate || 0);
        setIsEdit(false);
    }

    const distance = markToDistance(center)(mark)

    return <MapModal onRequestClose={cancel} accessibilityLabel={isEdit ? t('Edit Mark'): t('Mark info')}>
        {!isEdit && <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            <View style={styles.ratingAndDistance}>
                <Pressable disabled={true}>
                    <AirbnbRating
                        showRating={false}
                        isDisabled={true}
                        size={20}
                        defaultRating={rate}
                    />
                </Pressable>
                <Text style={styles.distanceText}>{distance}</Text>
            </View>
        </View>}
        {isEdit ? <View style={styles.content}>
            <Text style={styles.inputLabel}>{t('Name')}:</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setName(value)}
                placeholder={t('name')}
                value={name}
            />
            <Text style={styles.inputLabel}>{t('Description')}:</Text>
            <TextInput
                style={styles.modalInput}
                multiline
                numberOfLines={4}
                textAlignVertical={'top'}
                onChangeText={(value) => setDescription(value)}
                placeholder={t('description')}
                value={description}
            />
            <AirbnbRating
                showRating={false}
                starContainerStyle={{ marginVertical: 10 }}
                onFinishRating={(value: number) => setRate(value)}
                defaultRating={rate}
            />
        </View> :
            <View style={styles.content}>
                {description
                    ? <Text style={styles.description}>{description}</Text>
                    : <Text style={styles.description}>{t('no description')}</Text>
                }
            </View>}
        <View style={styles.buttonsRow}>
            {isEdit ? <>
                <Button buttonStyle={styles.btn} type="clear" onPress={() => onCloseEdit()} icon={<Icon name="close" size={26} color={purple} />} />
                <Button buttonStyle={styles.btn} type="clear" onPress={() => save({ name, description, rate })} icon={<Icon name="save" size={26} color={purple} />} />
            </> : <Button buttonStyle={styles.btn} type="clear" onPress={() => setIsEdit(true)} icon={<Icon name="edit" size={26} color={purple} />} />}
            <Button buttonStyle={styles.btn} type="clear" onPress={openLink} icon={<Icon name="location-arrow" size={26} color={purple} />} />
            {/* {navigate && <Button buttonStyle={styles.btn} type='clear' onPress={navigate} icon={<Icon name="compass" size={26} color={purple} />} />} */}
            {remove && <Button buttonStyle={styles.btn} type='clear' onPress={onRemove} icon={<Icon name="trash" size={26} color={purple} />} />}
        </View>
    </MapModal>
}


const styles = StyleSheet.create({
    header: {
        marginTop: -10,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    title: {
        maxWidth: '90%',
        marginBottom: 10,
        color: 'black',
        fontSize: 24,
        fontWeight: '700',
    },
    ratingAndDistance: {
        marginLeft: -5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    distanceText: {
        marginLeft: 10,
        color: '#aaa',
        fontSize: 18,
    },
    content: {
        marginTop: 25,
        minWidth: '100%',
    },
    description: {
        color: '#555',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 10,
    },
    buttonsRow: {
        minWidth: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    btn: {
        paddingHorizontal: 10,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    inputLabel: {
        marginBottom: 5,
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    modalInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'grey',
        alignItems: 'flex-start',
        marginBottom: 10,
        minWidth: '100%',
        maxHeight: 90,
        color: 'black',
    },
});


export default EditMark