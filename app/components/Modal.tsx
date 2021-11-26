import React, { FC } from 'react';
import { Modal } from 'react-native';

interface Props {
    children: React.ReactNode;
    onRequestClose?: () => void;
    visible?: boolean;
}

const ModalLayout: FC<Props> = ({ children, onRequestClose, visible }: Props) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
    >
        {children}
    </Modal>
)

export default ModalLayout