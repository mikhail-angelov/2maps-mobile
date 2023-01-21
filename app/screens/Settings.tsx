import React, {FC} from 'react';
import {View, StyleSheet, Modal} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import {Text, Switch} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MenuProvider} from 'react-native-popup-menu';
import {State} from '../store/types';
import {
  selectShowOSD,
  selectShowPaintButton,
  selectShowWikiButton,
  selectShowTrackButton,
} from '../reducers/settings';
import {
  showOSDAction,
  showPaintButtonAction,
  showTrackButtonAction,
  showWikiButtonAction,
} from '../actions/settings-actions';
import {useTranslation} from 'react-i18next';
import {purple} from '../constants/color';

const mapStateToProps = (state: State) => ({
  showOSD: selectShowOSD(state),
  showPaintButton: selectShowPaintButton(state),
  showWikiButton: selectShowWikiButton(state),
  showTrackButton: selectShowTrackButton(state),
});
const mapDispatchToProps = {
  setShowOSD: showOSDAction,
  setShowPaintButton: showPaintButtonAction,
  setShowTrackButton: showTrackButtonAction,
  setShowWikiButton: showWikiButtonAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & {close: () => void};

const Settings: FC<Props> = ({
  close,
  showOSD,
  showPaintButton,
  showWikiButton,
  showTrackButton,
  setShowOSD,
  setShowPaintButton,
  setShowWikiButton,
  setShowTrackButton,
}) => {
  const {t} = useTranslation();

  return (
    <Modal style={styles.container} visible onRequestClose={close}>
      <MenuProvider>
        <View style={styles.wrapper}>
          <View style={styles.buttons}>
            <Icon.Button
              style={styles.titleButton}
              backgroundColor="#fff0"
              name="arrow-back-ios"
              onPress={close}
            />
            <Text style={styles.title}>{t('Settings')}</Text>
          </View>

          <View style={styles.settingsItem}>
            <Switch
              value={showOSD}
              onValueChange={value => {
                setShowOSD(value);
              }}
            />
            <Text style={styles.labelText}>{t('Show OSD')}</Text>
          </View>
          <View style={styles.settingsItem}>
            <Switch
              value={showPaintButton}
              onValueChange={value => {
                setShowPaintButton(value);
              }}
            />
            <Text style={styles.labelText}>{t('Show Paint Button')}</Text>
          </View>
          <View style={styles.settingsItem}>
            <Switch
              value={showWikiButton}
              onValueChange={value => {
                setShowWikiButton(value);
              }}
            />
            <Text style={styles.labelText}>{t('Show Wiki Button')}</Text>
          </View>
          <View style={styles.settingsItem}>
            <Switch
              value={showTrackButton}
              onValueChange={value => {
                setShowTrackButton(value);
              }}
            />
            <Text style={styles.labelText}>{t('Show Tracking Button')}</Text>
          </View>
        </View>
      </MenuProvider>
    </Modal>
  );
};

export default connector(Settings);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    marginTop: 20,
    width: '100%',
  },
  wrapper: {},
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
    paddingHorizontal: 10,
    backgroundColor: purple,
  },
  titleButton: {
    textAlign: 'center',
    alignContent: 'center',
    padding: 10,
    margin: 10,
  },
  title: {
    marginTop: 12,
    marginRight: 42,
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingLeft: 10,
  },
  labelText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
