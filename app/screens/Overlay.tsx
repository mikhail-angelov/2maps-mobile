import React, {FC, useEffect, useState} from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {connect, ConnectedProps} from 'react-redux';
import {minBy} from 'lodash';
import distance from '@turf/distance';
import {State, Mark, ModalActionType, Tracking, MarkType} from '../store/types';
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
  selectSelectedTrack,
  selectLocation,
  selectTracks,
  selectIsTracking,
} from '../reducers/tracker';
import {View, StyleSheet, Text} from 'react-native';
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
  startTrackingAdnRecordingAction,
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
import {
  navigateYandex,
  navigateGoogle,
  navigateOsm,
} from '../actions/navigation';
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
import { addPointForDrawingChunkAction, finishDrawNewChunkAction, startDrawNewChunkAction, removeLastDrawingChunkAction, saveActualDrawingAction, setActualDrawingAction } from '../actions/drawing-actions';
import Drawings from './Drawings';
import { selectActiveDrawing } from '../reducers/drawings';
import Drawing from '../components/Drawing';
import TripSelectionDialog from '../components/TripSelectionDialog';
import Trips from './Trips'
import { selectActiveTrip, selectActiveTripMark } from '../reducers/trips';
import { removeActiveTripMarkAction, setActualTripAction, saveTripMarkAction } from '../actions/trips-actions';
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
  onLongPress,
  color,
  bgColor,
}: {
  icon: string;
  onPress: () => void;
  onLongPress?: () => void;
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
    onLongPress={onLongPress}
  />
);

const mapStateToProps = (state: State) => ({
  marks: selectMarks(state),
  tracks: selectTracks(state),
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
  selectedMarkState: selectSelectedMark(state),
  selectedDrawing: selectActiveDrawing(state),
  selectedActiveTrip: selectActiveTrip(state),
  selectedActiveTripMarkState: selectActiveTripMark(state),
});
const mapDispatchToProps = {
  removeMark: removeMarkAction,
  selectTrack: selectTrackAction,
  startTracking: startTrackingAction,
  startTrackingAdnRecording: startTrackingAdnRecordingAction,
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
  addPointForDrawingChunk: addPointForDrawingChunkAction,
  finishDrawNewChunk: finishDrawNewChunkAction,
  startDrawNewChunk: startDrawNewChunkAction,
  removeLastDrawingChunk: removeLastDrawingChunkAction,
  saveActualDrawing: saveActualDrawingAction,
  setActualDrawing: setActualDrawingAction,
  setActualTrip: setActualTripAction,
  removeTripMark: removeActiveTripMarkAction,
  saveTripMark: saveTripMarkAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & {map?: MapboxGL.MapView, camera?: MapboxGL.Camera};

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
  camera,
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
  startTracking,
  startTrackingAdnRecording,
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
  selectedMarkState,
  selectedDrawing,
  setActualDrawing,
  selectedActiveTrip,
  setActualTrip,
  selectedActiveTripMarkState,
  removeTripMark,
  saveTripMark,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [showTrips, setShowTrips] = useState(false);
  const [markAppendedToTrip, setMarkAppendedToTrip] = useState<Mark>();
  const [showAbout, setShowAbout] = useState(false);
  const [activeDrawingLayout, setActiveDrawingLayout] = useState(false);
  const [showDrawings, setShowDrawings] = useState(false);
  const {t} = useTranslation();

  const selectedMark = selectedActiveTripMarkState ? selectedActiveTripMarkState : selectedMarkState

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
      title: 'Drawings',
      onPress: () => {
        setShowDrawings(true);
        setShowMenu(false);
      },
    },
    {
      title: 'Trips',
      onPress: () => {
        setShowTrips(true);
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
    camera?.moveTo([location.coords.longitude, location.coords.latitude], 100);
  };
  let trackingColor='white';
  if(tracking === Tracking.track){
    trackingColor='green';
  }else if(tracking === Tracking.trackAndRecord){
    trackingColor='red';
  }
  const toggleTracking = () => {
    if (tracking === Tracking.none) {
      startTracking();
    } else {
      stopTracking();
    }
  };
  const toggleTrackingAndRecord = () => {
    if (tracking === Tracking.none) {
      startTrackingAdnRecording();
    } else {
      stopTracking();
    }
  };
  const selectMark = (mark: Mark) => {
    const selected = markToFeature(mark);
    setShowMarkers(false);
    camera?.moveTo(mark.geometry.coordinates, 100);
  };

  const onHideSelectedTrack = () => {
    selectTrack(undefined);
    setActualDrawing("")
    setActualTrip("")
  };

  const toggleWikimapia = () => {
    setShowWikimapia(!showWikimapia);
  };

  const onMarkSave = (data: {name: string; description: string; rate: number}) => {
    if (!editedMark) {
      return
    }
    const newMark = {...editedMark, ...data}
    if (editedMark.type === MarkType.TRIP) {
      saveTripMark(newMark)
      return
    }
    saveMark(newMark)
  }
  const onMarkRemove = () => {
    if (!editedMark?.id) {
      return
    }
    if (editedMark.type === MarkType.TRIP) {
      removeTripMark(editedMark.id)
      return
    }
    return editedMark.id ? removeMark(editedMark.id) : null
  }
  
  useEffect(() => {
    if (isItTheFirstTimeAppStarted) {
      setShowSettings(isItTheFirstTimeAppStarted);
      setTheFirstTimeAppStart(false);
    }
  }, []);

  console.log('render overlay', zoom, opacity, editedMark);
  return (
    <>
      {!!secondaryMap && !activeDrawingLayout && (
        <View style={styles.slider}>
          <Slider value={opacity} setValue={onOpacityChange} />
        </View>
      )}
      {!activeDrawingLayout && (
        <View style={styles.buttonPanel}>
          <View style={styles.buttonSubPanelTop}>
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
            {(selectedTrack || !!selectedDrawing.length || !!selectedActiveTrip) && (
              <View style={styles.visibilityOffButton}>
                <MenuButton icon="visibility-off" onPress={onHideSelectedTrack} />
              </View>
            )}
            <MenuButton
              icon={awake ? 'brightness-high' : 'brightness-low'}
              bgColor={awake ? '#0f0a' : '#00f5'}
              onPress={toggleAwake}
            />
            <IconCommunity.Button
              name="brush"
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
              onPress={() => setActiveDrawingLayout(true)}
            />
            <MenuButton icon="settings" onPress={() => setShowMenu(true)} />
            <MenuButton
              icon="track-changes"
              color={trackingColor}
              onPress={toggleTracking}
              onLongPress={toggleTrackingAndRecord}
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
                      onPress={() =>
                        navigateYandex(selectedMark.geometry.coordinates)
                      }
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
                      onPress={() =>
                        navigateOsm(selectedMark.geometry.coordinates)
                      }
                    />
                  </View>
                  <View style={styles.navPanelItem}>
                    <MenuButton
                      icon="navigation"
                      bgColor="#0f05"
                      onPress={() =>
                        navigateGoogle(selectedMark.geometry.coordinates)
                      }
                    />
                  </View>
                </View>
              </View>
            )}
            <MenuButton icon="gps-fixed" onPress={toCurrentLocation} />
          </View>
        </View>
      )}
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
          save={onMarkSave}
          cancel={() => editMark(undefined)}
          remove={onMarkRemove}
          showModal={showModal}
          setMarkAppendedToTrip={setMarkAppendedToTrip}
        />
      )}
      {markAppendedToTrip && (
        <TripSelectionDialog markAppendedToTrip={markAppendedToTrip} onClose={() => setMarkAppendedToTrip(undefined)} />
      )}
      {showTracks && <Tracks close={() => setShowTracks(false)} />}
      {showDrawings && <Drawings close={() => setShowDrawings(false)} />}
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
      {showTrips && <Trips close={() => setShowTrips(false)} />}
      {activeDrawingLayout && (
        <Drawing setActiveDrawingLayout={setActiveDrawingLayout} map={map} />
      )}
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
  buttonSubPanelTop: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 90,
  },
  buttonSubPanel: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 90,
    position: 'relative',
    marginVertical: 20,
  },
  visibilityOffButton: {
    position: 'absolute',
    top: 10,
  },
  buttonSubPanelBottom: {
    flex: 1,
    minHeight: 50,
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
  }
});
