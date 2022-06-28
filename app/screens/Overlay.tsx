import React, {FC, useEffect, useState, useCallback} from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {connect, ConnectedProps} from 'react-redux';
import { NativeModules } from "react-native";
import {minBy} from 'lodash';
import distance from '@turf/distance';
import {State, Mark, ModalActionType} from '../store/types';
import {
  selectMarks,
  selectEditedMark,
  selectSelectedMark,
} from '../reducers/marks';
import {
  removeMarkAction,
  editMarkAction,
  saveMarkAction,
  markToFeature,
} from '../actions/marks-actions';
import {
  selectActiveTrack,
  selectSelectedTrack,
  selectLocation,
  selectTracks,
  selectIsTracking,
} from '../reducers/tracker';
import {View, StyleSheet, Text, Linking} from 'react-native';
import {BottomSheet, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import EditMark from '../components/EditMark';
import Slider from '../components/Slider';
import Tracks from './Tracks';
import Markers from './Markers';
import Auth from '../components/Auth';
import MapSettings from './MapSettings';
import {
  addPointAction,
  addTrackAction,
  selectTrackAction,
  startTrackingAction,
  stopTrackingAction,
} from '../actions/tracker-actions';
import {
  checkAction,
  setTheFirstTimeAppStartAction,
  storeResetTokenAction,
} from '../actions/auth-actions';
import {
  selectIsItTheFirstTimeAppStarted,
  selectResetToken,
} from '../reducers/auth';
import {
  setCenterAction,
  setOpacityAction,
  setZoomAction,
  setShowWikimapiaAction,
} from '../actions/map-actions';
import {
  selectCenter,
  selectOpacity,
  selectZoom,
  selectPrimaryMap,
  selectSecondaryMap,
  selectShowWikimapia,
} from '../reducers/map';
import {toggleAwakeAction} from '../actions/ui-actions';
import {selectAwake} from '../reducers/ui';
import {showModalAction} from '../actions/ui-actions';
import ResetPassword from '../components/ResetPassword';
import {useTranslation} from 'react-i18next';
import Account from '../components/Account';
import About from '../components/About';
import {purple} from '../constants/color';
import {requestLocationPermissions} from '../utils/permissions';
// custom font icons: https://medium.com/bam-tech/add-custom-icons-to-your-react-native-application-f039c244386c
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import iconMoonConfig from '../fontConfig.json';
const IconMoon = createIconSetFromIcoMoon(iconMoonConfig);


interface MenuItem {
  title: string;
  onPress?: () => void;
  containerStyle?: any;
  titleStyle?: any;
}

const MenuButton = ({
  icon,
  onPress,
  color,
  bgColor,
}: {
  icon: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}) => (
  <Icon.Button
    name={icon}
    color={color || 'white'}
    backgroundColor={bgColor || '#00f5'}
    style={{width: 48, height: 48, padding: 0, justifyContent: 'center'}}
    iconStyle={{marginLeft: 10, width: 20}}
    borderRadius={24}
    onPress={onPress}
  />
);

const mapStateToProps = (state: State) => ({
  marks: selectMarks(state),
  tracks: selectTracks(state),
  activeTrack: selectActiveTrack(state),
  selectedTrack: selectSelectedTrack(state),
  location: selectLocation(state),
  center: selectCenter(state),
  opacity: selectOpacity(state),
  zoom: selectZoom(state),
  primaryMap: selectPrimaryMap(state),
  secondaryMap: selectSecondaryMap(state),
  tracking: selectIsTracking(state),
  editedMark: selectEditedMark(state),
  resetToken: selectResetToken(state),
  isItTheFirstTimeAppStarted: selectIsItTheFirstTimeAppStarted(state),
  showWikimapia: selectShowWikimapia(state),
  awake: selectAwake(state),
  selectedMark: selectSelectedMark(state),
});
const mapDispatchToProps = {
  removeMark: removeMarkAction,
  selectTrack: selectTrackAction,
  startTracking: startTrackingAction,
  stopTracking: stopTrackingAction,
  addPoint: addPointAction,
  addTrack: addTrackAction,
  setCenter: setCenterAction,
  setOpacity: setOpacityAction,
  setZoom: setZoomAction,
  checkAuth: checkAction,
  editMark: editMarkAction,
  saveMark: saveMarkAction,
  storeResetToken: storeResetTokenAction,
  setTheFirstTimeAppStart: setTheFirstTimeAppStartAction,
  showModal: showModalAction,
  setShowWikimapia: setShowWikimapiaAction,
  toggleAwake: toggleAwakeAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & {map?: MapboxGL.Camera};

const getClosestMark = (location: any, marks: Mark[]) => {
  const closest = minBy(marks, mark =>
    distance(mark.geometry.coordinates, location, {units: 'kilometers'}),
  );
  if (!closest) {
    return '';
  }
  return `${closest.name} ${distance(closest.geometry.coordinates, location, {
    units: 'kilometers',
  }).toFixed(2)} km.`;
};
const Overlay: FC<Props> = ({
  map,
  marks,
  setOpacity,
  editedMark,
  opacity,
  center,
  zoom,
  location,
  secondaryMap,
  editMark,
  saveMark,
  removeMark,
  tracking,
  activeTrack,
  startTracking,
  stopTracking,
  showModal,
  resetToken,
  storeResetToken,
  selectedTrack,
  selectTrack,
  isItTheFirstTimeAppStarted,
  setTheFirstTimeAppStart,
  showWikimapia,
  setShowWikimapia,
  awake,
  toggleAwake,
  selectedMark,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const {t} = useTranslation();

  const menuItems: MenuItem[] = [
    {
      title: 'Manage Account',
      onPress: () => {
        setShowAccount(true);
        setShowMenu(false);
      },
    },
    {
      title: 'Maps',
      onPress: () => {
        setShowSettings(true);
        setShowMenu(false);
      },
    },
    {
      title: 'Marks',
      onPress: () => {
        setShowMarkers(true);
        setShowMenu(false);
      },
    },
    {
      title: 'Tracks',
      onPress: () => {
        setShowTracks(true);
        setShowMenu(false);
      },
    },
    {
      title: 'About app',
      onPress: () => {
        setShowAbout(true);
        setShowMenu(false);
      },
    },
    {
      title: 'Cancel',
      containerStyle: {backgroundColor: purple},
      titleStyle: {color: 'white'},
      onPress: () => setShowMenu(false),
    },
  ];

  if (!location?.coords) {
    console.log('no location', location);
    return null;
  }
  const currentLocation = [location.coords.longitude, location.coords.latitude];
  // const currentLocationFeature = point(currentLocation)
  // currentLocationFeature.id = 'currentLocationFeature'
  const closest = getClosestMark(currentLocation, marks);
  const onOpacityChange = (value: number) => {
    console.log('setOpacityAction c', value);
    setOpacity(value);
  };
  const toCurrentLocation = async () => {
    console.log('-toCurrentLocation-', location);
    try {
      const isGranted = await requestLocationPermissions();
      if (!isGranted) {
        return showModal({
          title: t('Location permission denied'),
          text: t("Allow Location Permission otherwise tracking won't work"),
          actions: [{text: t('Ok'), type: ModalActionType.cancel}],
        });
      }
    } catch (e) {
      return showModal({
        title: t('Permissions error!'),
        text: t('Check location permissions error'),
        actions: [{text: t('Ok'), type: ModalActionType.cancel}],
      });
    }
    if (!location) {
      return;
    }
    map?.moveTo([location.coords.longitude, location.coords.latitude], 100);
  };
  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };
  const selectMark = (mark: Mark) => {
    const selected = markToFeature(mark);
    setShowMarkers(false);
    map?.moveTo(mark.geometry.coordinates, 100);
  };

  const onHideSelectedTrack = () => {
    selectTrack(undefined);
  };

  const toggleWikimapia = () => {
    setShowWikimapia(!showWikimapia);
  };

  useEffect(() => {
    if (isItTheFirstTimeAppStarted) {
      setShowSettings(isItTheFirstTimeAppStarted);
      setTheFirstTimeAppStart(false);
    }
  }, []);

  const navigateYandex = useCallback(async () => {
    if (!selectedMark) {
      return;
    }
    const {coordinates} = selectedMark.geometry;
    const clientId = process.env.YANDEX_NAV_CLIENT || '';
    //this line break is required for encryption
    let key = `
    ${process.env.YANDEX_NAV_KEY || ''}`;

    try {
        await  NativeModules.MapsModule.openYandexNavigator(coordinates[0]+'',coordinates[1]+'', clientId, key)
    } catch (e) {
      console.log('error', e);
      showModal({
        title: 'Oops',
        text: `${t("Can't start navigation with yandex navigator")}`,
        actions: [{text: t('Ok'), type: ModalActionType.cancel}],
      });
    }
  }, [selectedMark]);

  const navigateOsm = useCallback(async () => {
    if (!selectedMark) {
      return;
    }
    const {coordinates} = selectedMark.geometry;
    const url = `https://osmand.net/go?lat=${coordinates[1]}&lon=${
      coordinates[0]
    }&z=16&name=${selectedMark?.name || ''}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log('error', e);
      showModal({
        title: 'Oops',
        text: `${t("Can't start navigation with OSMAnd\n link:")}: ${url}`,
        actions: [{text: t('Ok'), type: ModalActionType.cancel}],
      });
    }
  }, [selectedMark]);
  const navigateGoogle = useCallback(async () => {
    if (!selectedMark) {
      return;
    }
    const {coordinates} = selectedMark.geometry;
    // const url = `geo:${coordinates[1]},${coordinates[0]}`
    const url = `https://maps.google.com/maps?daddr=${coordinates[1]},${coordinates[0]}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log('error', e);
      showModal({
        title: 'Oops',
        text: `${t("Can't start navigation with Google map\n link:")}: ${url}`,
        actions: [{text: t('Ok'), type: ModalActionType.cancel}],
      });
    }
  }, [selectedMark]);

  console.log('render overlay', zoom, opacity, editedMark);
  return (
    <>
      {!!secondaryMap && (
        <View style={styles.slider}>
          <Slider value={opacity} setValue={onOpacityChange} />
        </View>
      )}
      <View style={styles.buttonPanel}>
        <View style={styles.buttonSubPanelBottom}>
          <IconCommunity.Button
            name={showWikimapia ? 'window-close' : 'wikipedia'}
            color="white"
            backgroundColor="#00f5"
            style={{
              width: 48,
              height: 48,
              padding: 0,
              justifyContent: 'center',
            }}
            iconStyle={{marginLeft: 10, width: 20}}
            borderRadius={24}
            onPress={toggleWikimapia}
          />
        </View>
        <View style={styles.buttonSubPanel}>
          {selectedTrack && (
            <>
              <MenuButton icon="visibility-off" onPress={onHideSelectedTrack} />
              <View style={{height: 40}} />
            </>
          )}
          <MenuButton
            icon={awake ? 'brightness-high' : 'brightness-low'}
            bgColor={awake ? '#0f0a' : '#00f5'}
            onPress={toggleAwake}
          />
          <View style={{height: 40}} />
          <MenuButton icon="settings" onPress={() => setShowMenu(true)} />
          <View style={{height: 40}} />
          <MenuButton
            icon="track-changes"
            color={tracking ? 'red' : 'white'}
            onPress={toggleTracking}
          />
        </View>
        <View style={styles.buttonSubPanelBottom}>
          {selectedMark && (
            <View style={styles.navPanel}>
              <View style={styles.navPanelRow}>
                <View style={styles.navPanelItem}>
                  <IconMoon.Button
                    name="yandex"
                    color="white"
                    backgroundColor="#0f05"
                    style={{
                      width: 48,
                      height: 48,
                      padding: 0,
                      justifyContent: 'center',
                    }}
                    iconStyle={{marginLeft: 10, width: 20}}
                    borderRadius={24}
                    onPress={navigateYandex}
                  />
                </View>
                <View style={styles.navPanelItem}>
                  <IconMoon.Button
                    name="osmc"
                    color="white"
                    backgroundColor="#0f05"
                    style={{
                      width: 48,
                      height: 48,
                      padding: 0,
                      justifyContent: 'center',
                    }}
                    iconStyle={{marginLeft: 10, width: 20}}
                    borderRadius={24}
                    onPress={navigateOsm}
                  />
                </View>
                <View style={styles.navPanelItem}>
                  <MenuButton
                    icon="navigation"
                    bgColor="#0f05"
                    onPress={navigateGoogle}
                  />
                </View>
              </View>
            </View>
          )}
          <MenuButton icon="gps-fixed" onPress={toCurrentLocation} />
        </View>
      </View>
      <View style={styles.closestMark}>
        <Text style={styles.markLabel}>{closest}</Text>
      </View>
      {showMenu && (
        <BottomSheet
          isVisible={showMenu}
          containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}
          modalProps={{}}>
          {menuItems.map((l, i) => (
            <ListItem
              key={i}
              containerStyle={l.containerStyle}
              onPress={l.onPress}>
              <ListItem.Content>
                <ListItem.Title style={l.titleStyle}>
                  {t(l.title)}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </BottomSheet>
      )}
      {editedMark && (
        <EditMark
          mark={editedMark}
          center={[location.coords.longitude, location.coords.latitude]}
          save={data => saveMark({...editedMark, ...data})}
          cancel={() => editMark(undefined)}
          remove={() => (editedMark.id ? removeMark(editedMark.id) : null)}
          showModal={showModal}
        />
      )}
      {showTracks && <Tracks close={() => setShowTracks(false)} />}
      {showMarkers && center && (
        <Markers
          center={center}
          select={selectMark}
          close={() => setShowMarkers(false)}
        />
      )}
      {showAuth && <Auth close={() => setShowAuth(false)} />}
      {showSettings && (
        <MapSettings
          close={() => setShowSettings(false)}
          showAuth={() => {
            setShowSettings(false);
            setShowAuth(true);
          }}
        />
      )}
      {!!resetToken && <ResetPassword close={() => storeResetToken('')} />}
      {showAccount && (
        <Account
          close={() => setShowAccount(false)}
          showAuth={() => {
            setShowAccount(false);
            setShowAuth(true);
          }}
        />
      )}
      {showAbout && <About close={() => setShowAbout(false)} />}
    </>
  );
};

export default connector(Overlay);

const styles = StyleSheet.create({
  buttonPanel: {
    position: 'absolute',
    height: '100%',
    right: 10,
  },
  buttonSubPanel: {
    height: '30%',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonSubPanelBottom: {
    height: '30%',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  navPanel: {
    width: 48,
    height: 60,
  },
  navPanelRow: {
    position: 'absolute',
    flexDirection: 'row',
    right: 0,
  },
  navPanelItem: {
    marginLeft: 10,
  },
  slider: {
    position: 'absolute',
    top: 30,
    height: 40,
    width: '100%',
  },
  closestMark: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  markLabel: {
    padding: 4,
    backgroundColor: '#fff8',
    textAlign: 'center',
  },
});
