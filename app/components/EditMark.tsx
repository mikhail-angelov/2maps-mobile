import React, { FC, useState, useCallback } from "react";
import { View, Linking, TextInput, Text, Alert, Pressable, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Mark } from '../store/types'
import MapModal from './Modal'

interface Props {
    mark: Mark;
    save: (data: { name: string, description: string }) => void;
    remove?: (id: string) => void;
    cancel: () => void;
}

const EditMark: FC<Props> = ({ mark, save, cancel, remove }) => {
    const [name, setName] = useState<string>(mark?.name || '')
    const [description, setDescription] = useState<string>(mark?.description || '')
    const [isEdit, setIsEdit] = useState(!mark.id)
    console.log('ed', description)
    const openLink = useCallback(async () => {
        const { coordinates } = mark.geometry
        const url = `http://osmand.net/go?lat=${coordinates[1]}&lon=${coordinates[0]}&z=16&name=${mark?.name || ''}`
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    }, [mark]);

    const onRemove = () => {
        if (!remove) {
            return
        }
        Alert.alert(
            "Warning!",
            `Are you sure to remove ${name} marker?`,
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => remove(mark.id?.toString() || '') }
            ]
        );
    }

    return <MapModal onRequestClose={cancel}>
        {isEdit ? <View style={styles.content}>
            <Text>Name:</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setName(value)}
                placeholder="name"
                value={name}
            />
            <Text>Description:</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setDescription(value)}
                placeholder="description"
                value={description}
            />
        </View>
            : <View style={styles.content}>
                <Text>{name}</Text>
                <Text style={styles.subTitle}>{description}</Text>
            </View>}
        <View style={styles.buttonsRow}>
            {isEdit ? <>
                <Button buttonStyle={styles.btn} type="clear" onPress={() => setIsEdit(false)} icon={<Icon name="close" size={26} color="grey" />} />
                <Button buttonStyle={styles.btn} type="clear" onPress={() => save({ name, description })} icon={<Icon name="save" size={26} color="grey" />} />
            </> : <Button buttonStyle={styles.btn} type="clear" onPress={() => setIsEdit(true)} icon={<Icon name="edit" size={26} color="grey" />} />}
            <Button buttonStyle={styles.btn} type="clear" onPress={openLink} icon={<Icon name="link" size={26} color="grey" />} />
            {/* {navigate && <Button buttonStyle={styles.btn} type='clear' onPress={navigate} icon={<Icon name="compass" size={26} color="grey" />} />} */}
            {remove && <Button buttonStyle={styles.btn} type='clear' onPress={onRemove} icon={<Icon name="trash" size={26} color="grey" />} />}
        </View>
    </MapModal>


}


const styles = StyleSheet.create({
    content: {
        marginTop: 30,
        minWidth: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 10,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    btn: {
        paddingHorizontal: 20,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    subTitle: {
        marginVertical: 10,
        color: 'black',
        fontSize: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 10,
        minWidth: '100%',
    }
});


export default EditMark