import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { connect, ConnectedProps } from "react-redux";
import { removeModalAction } from './actions/ui-actions'
import { selectModal } from './reducers/ui'
import { State, ModalActionType } from './store/types'

const mapStateToProps = (state: State) => ({
  modal: selectModal(state),
});
const mapDispatchToProps = {
  removeModal: removeModalAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>


const ModalManager: React.FC<Props> = ({ removeModal, modal }) => {
  const onPress = (handler?: () => void) => {
    removeModal()
    handler && handler()
  }
  if (!modal) {
    return <></>
  }
  const { title, text, actions } = modal
  return <Modal
    visible={true}
    style={[styles.modal]}
    animationType='fade'
    transparent={true}
  >
    <KeyboardAvoidingView behavior="padding" enabled style={styles.container}>
    <View style={styles.modalOverlay} />
      <View style={styles.alertWrapper}>
        <View style={styles.topArea}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!text && <Text style={styles.text}>{text}</Text>}
        </View>
        <View style={styles.buttonRow}>
          {actions.map((action, index) => (<TouchableOpacity
            onPress={() => onPress(action.handler)}
            style={styles.optionButton}
            key={index}
          >
            <Text style={action.type === ModalActionType.cancel ? styles.cancelOption : styles.confirmOption}>{action.text}</Text>
          </TouchableOpacity>))}
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  alertWrapper: {
    alignSelf: 'center',
    width: '85%',
    padding:10,
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,1)',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,1)',
    minHeight: 100,
  },
  topArea: {
    flexDirection: 'column',
    paddingBottom: 5,
    paddingTop: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    fontSize: 18,
    paddingBottom: 5,
  },
  //buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  optionButton: {
    flex: 0.5,
    borderRightWidth: .5,
    borderColor: 'rgba(24,127,254,.1)',
    padding: 10,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center'
  },
  cancelOption: {
    color: 'rgba(24,127,254,1)',
    fontSize: 17,
    fontFamily: 'System',
  },
  confirmOption: {
    fontWeight: '600',
    fontFamily: 'System',
    color: 'rgba(24,127,254,1)',
    fontSize: 17,
  },
});

export default connector(ModalManager)