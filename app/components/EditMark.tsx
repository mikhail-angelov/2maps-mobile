import React, { FC, useState, useCallback } from "react";
import { View, Linking, TextInput, Text, Alert, Modal, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Feature, Point } from '@turf/helpers';


interface Props {
    mark: Feature<Point>;
    save: (data: { name: string, description: string }) => void;
    remove?: (id: string) => void;
    navigate?: () => void;
    cancel: () => void;
}

const EditMark: FC<Props> = ({ mark, save, cancel, remove, navigate }) => {
    const [name, setName] = useState<string>(mark.properties?.name || '')
    const [description, setDescription] = useState<string>(mark.properties?.description_orig || '')
    const [isEdit, setIsEdit] = useState(!mark.id)
    console.log('ed', description)
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

    const onRemove = () => {
        if(!remove){
            return
        }
        Alert.alert(
            "Warning!",
            `Are you sure to remove ${name} marker?`,
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: ()=>remove(mark.id?.toString()||'') }
            ]
        );
    }

    return <Modal
        animationType="fade"
        transparent={true}
        visible
        onRequestClose={cancel}
    >
        <TouchableWithoutFeedback onPress={cancel}>
            <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView} >


            <View style={styles.modalView}>

                {isEdit ? <View style={styles.content}><TextInput
                    style={styles.modalInput}
                    onChangeText={(value) => setName(value)}
                    placeholder="name"
                    value={name}
                />

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
                    {navigate && <Button buttonStyle={styles.btn} type='clear' onPress={navigate} icon={<Icon name="compass" size={26} color="grey" />} />}
                    {remove && <Button buttonStyle={styles.btn} type='clear' onPress={onRemove} icon={<Icon name="trash" size={26} color="grey" />} />}
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
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
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: '50%',
    },
    content: {
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    btn: {
        paddingHorizontal: 20,
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