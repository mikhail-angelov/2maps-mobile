import React, { FC } from 'react';
import { Modal, ModalProps, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { purple } from '../constants/color';
interface OwnProps {
    children: React.ReactNode;
}
type Props = OwnProps & ModalProps

const MapModal: FC<Props> = ({ children, ...props }: Props) => {
    const { onRequestClose: onClose } = props
    return (
        <Modal
            animationType="fade"
            transparent={true}
            {...props}
        ><TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.centeredView} >
                <View style={styles.modalView}>
                    {children}
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>✕</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
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
        position: 'relative',
        margin: 20,
        backgroundColor: "white",
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
        maxWidth: '80%',
        minWidth: '80%',
        maxHeight: '80%',
    },
    button: {
        borderRadius: 24,
        padding: 10,
    },
    buttonClose: {
        backgroundColor: "white",
        position: "absolute",
        top: 16,
        right: 16,
        width: 48,
        height: 48,
    },
    textStyle: {
        color: purple,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: "center"
    },
})
export default MapModal