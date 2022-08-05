import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Input } from "react-native-elements";
import { connect, ConnectedProps } from "react-redux";
import { removeModalAction } from './actions/ui-actions'
import { selectModal } from './reducers/ui'
import { State, ModalActionType, ModalAction } from './store/types'

const mapStateToProps = (state: State) => ({
  modal: selectModal(state),
});
const mapDispatchToProps = {
  removeModal: removeModalAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>


const ModalManager: React.FC<Props> = ({ removeModal, modal }) => {
  const defaultInputValue = dayjs().format('YY.MM.DD')
  const [name, setName] = useState(defaultInputValue)
  const onPress = (handler?: (text: any) => void) => {
    removeModal()
    setName(defaultInputValue)
    handler && handler(name)
  }
  if (!modal) {
    return <></>
  }
  const { title, text, actions } = modal
  let buttonsData: ModalAction[] = []
  let inputsData: ModalAction[] = []
  actions.forEach(item => {
    if (item.type === ModalActionType.input) {
      inputsData.push(item)
    } else {
      buttonsData.push(item)
    }
  })
  return <Modal
    visible={true}
    style={[styles.modal]}
    animationType='fade'
    transparent={true}
  >
    <View style={styles.container}>
    <View style={styles.modalOverlay} />
      <View style={styles.alertWrapper}>
        <View style={styles.topArea}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!text && <Text style={styles.text}>{text}</Text>}
        </View>
        <View>
          {inputsData.map((action, index)=> (
            <TouchableOpacity
                  style={styles.optionInput}
                  key={index}
                ><Input onChangeText={value => setName(value)} selectTextOnFocus value={name}></Input></TouchableOpacity>
          ))}
        </View>
        <View style={styles.buttonRow}>
          {buttonsData.map((action, index) => (
            <TouchableOpacity
            onPress={() => onPress(action.handler)}
            style={styles.optionButton}
            key={index}
          >
            <Text style={action.type === ModalActionType.cancel ? styles.cancelOption : styles.confirmOption}>{action.text}</Text>
          </TouchableOpacity>))}
        </View>
      </View>
    </View>
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
  optionInput: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
});

export default connector(ModalManager)