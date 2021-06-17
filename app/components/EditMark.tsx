import React, { FC, useState, useCallback } from "react";
import { View, Linking, TextInput, Text, Alert, Modal, Pressable, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Feature, Point } from '@turf/helpers';


interface Props {
    mark: Feature<Point>;
    save: (data: { name: string }) => void;
    remove?: () => void;
    navigate?: () => void;
    cancel: () => void;
}

const EditMark: FC<Props> = ({ mark, save, cancel, remove, navigate }) => {
    const [name, setName] = useState<string>(mark.properties?.name || '')
    const [isEdit, setIsEdit] = useState(false)
    const openLink = useCallback(async () => {
        const { coordinates } = mark.geometry
        const url = `http://osmand.net/go?lat=${coordinates[1]}&lon=${coordinates[0]}&z=16&name=${mark.properties?.name || ''}`
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    }, [mark]);

    return <Modal
        animationType="fade"
        transparent={true}
        visible
        onRequestClose={() => {
            cancel()
        }}
    >
        <View style={styles.centeredView} >


            <View style={styles.modalView}>

                {isEdit ? <View style={styles.row}><TextInput
                    style={styles.modalText}
                    onChangeText={(value) => setName(value)}
                    placeholder="name"
                    value={name}
                />
                    <Button type="clear" onPress={() => setIsEdit(false)} icon={<Icon name="close" size={26} color="grey" />} />
                    <Button type="clear" onPress={() => save({ name })} icon={<Icon name="save" size={26} color="grey" />} />
                </View> : <View style={styles.row}>
                    <Text>{name}</Text>
                    <Button type="clear" onPress={() => setIsEdit(true)} icon={<Icon name="edit" size={26} color="grey" />} />
                </View>}
                <View style={styles.buttonsRow}>
                    <Button buttonStyle={styles.btn} type="clear" onPress={openLink} icon={<Icon name="link" size={26} color="grey" />} />
                    {navigate && <Button buttonStyle={styles.btn} type='clear' onPress={() => navigate()} icon={<Icon name="compass" size={26} color="grey" />} />}
                    {remove && <Button buttonStyle={styles.btn} type='clear' onPress={() => remove()} icon={<Icon name="trash" size={26} color="grey" />} />}
                </View>
                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={cancel}
                >
                    <Text style={styles.textStyle}>Close</Text>
                </Pressable>
            </View>
        </View>
    </Modal>


}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 10,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 20,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    btn: {
        padding: 20,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        borderWidth: 1,
        borderColor: 'grey',
        margin: 20,
    }
});


export default EditMark