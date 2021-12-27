import React, { FC, useState } from "react";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { connect, ConnectedProps } from "react-redux";
import { minBy } from 'lodash'
import distance from '@turf/distance';
import { State, Mark } from '../store/types'
import { selectMarks, selectEditedMark } from '../reducers/marks'
import { removeMarkAction, editMarkAction, saveMarkAction, markToFeature } from '../actions/marks-actions'
import { selectActiveTrack, selectSelectedTrack, selectLocation, selectTracks, selectIsTracking } from '../reducers/tracker'
import { View, StyleSheet, Text } from "react-native";
import {  BottomSheet, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styled from 'styled-components/native'
import EditMark from '../components/EditMark'
import Slider from '../components/Slider'
import Tracks from './Tracks'
import Markers from './Markers'
import Auth from '../components/Auth'
import MapSettings from './MapSettings'
import { addPointAction, addTrackAction, selectTrackAction, startTrackingAction, stopTrackingAction } from "../actions/tracker-actions";
import { checkAction, storeResetTokenAction } from "../actions/auth-actions";
import { loadWikiAction } from "../actions/wiki-actions";
import { selectWikiCollection } from "../reducers/wiki";
import { selectResetToken } from "../reducers/auth";
import { setCenterAction, setOpacityAction, setZoomAction } from "../actions/map-actions";
import { selectCenter, selectOpacity, selectZoom, selectPrimaryMap, selectSecondaryMap } from '../reducers/map'
import ResetPassword from "../components/ResetPassword";
import { useTranslation } from "react-i18next";
import Account from "../components/Account";
import About from "../components/About";

interface MenuItem {
    title: string;
    onPress?: () => void;
    containerStyle?: any;
    titleStyle?: any;

}

const SliderContainer = styled(View)`
    position: absolute;
    top: 40px;
    height: 40px;
    width:100%;
`
const StyledSlider = styled(Slider)`
  flex: 1;
  z-index: 10000000;  
  max-height: 60px;
   padding-horizontal: 24px;
   margin-top: 50px;
`
const Buttons = styled(View)`
    position: absolute;
    bottom:50px;
    left:10px;
`
const MenuButton =  ({icon, onPress, color}: {icon: string, onPress:()=>void, color?:string})=>(<Icon.Button name={icon} color={color||"white"} backgroundColor="#00f5"  style={{width:40, height: 40, padding:0, justifyContent:'center'}} iconStyle={{marginLeft:10, width:20}} borderRadius={20} onPress={onPress} />)

const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
    tracks: selectTracks(state),
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
    location: selectLocation(state),
    center: selectCenter(state),
    opacity: selectOpacity(state),
    zoom: selectZoom(state),
    wikiCollection: selectWikiCollection(state),
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    tracking: selectIsTracking(state),
    editedMark: selectEditedMark(state),
    resetToken: selectResetToken(state),
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
    loadWiki: loadWikiAction,
    checkAuth: checkAction,
    editMark: editMarkAction,
    saveMark: saveMarkAction,
    storeResetToken: storeResetTokenAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { map?: MapboxGL.Camera }

const getClosestMark = (location: any, marks: Mark[]) => {
    const closest = minBy(marks, mark => distance(mark.geometry.coordinates, location, { units: 'kilometers' }))
    if (!closest) {
        return ''
    }
    return `${closest.name} ${distance(closest.geometry.coordinates, location, { units: 'kilometers' }).toFixed(2)} km.`
}
const Overlay: FC<Props> = ({ map, marks, setOpacity, editedMark, opacity, center, zoom, location, editMark, saveMark, removeMark, tracking, activeTrack, startTracking, stopTracking, addTrack, resetToken, storeResetToken, selectedTrack, selectTrack }) => {
    const [showMenu, setShowMenu] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [showAccount, setShowAccount] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [showMarkers, setShowMarkers] = useState(false)
    const [showTracks, setShowTracks] = useState(false)
    const [showAbout, setShowAbout] = useState(false)
    const { t } = useTranslation();

    const menuItems: MenuItem[] = [
        { title: 'Manage Account', onPress: () => { setShowAccount(true); setShowMenu(false) } },
        { title: 'Settings', onPress: () => { setShowSettings(true); setShowMenu(false) } },
        { title: 'POI', onPress: () => { setShowMarkers(true); setShowMenu(false) } },
        { title: 'Tracks', onPress: () => { setShowTracks(true); setShowMenu(false) } },
        { title: 'About app', onPress: () => { setShowAbout(true); setShowMenu(false) } },
        { title: 'Cancel', containerStyle: { backgroundColor: 'blue' }, titleStyle: { color: 'white' }, onPress: () => setShowMenu(false), }
    ]

    if (!location?.coords) {
        console.log('no location', location)
        return null
    }
    const currentLocation = [location.coords.longitude, location.coords.latitude]
    // const currentLocationFeature = point(currentLocation)
    // currentLocationFeature.id = 'currentLocationFeature'
    const closest = getClosestMark(currentLocation, marks)
    const onOpacityChange = (value: number) => {
        console.log('setOpacityAction c', value);
        setOpacity(value);
    }
    const toCurrentLocation = async () => {
        console.log('-toCurrentLocation-', location)
        if (!location) {
            return
        }
        map?.moveTo([location.coords.longitude, location.coords.latitude], 100)
    }
    const toggleTracking = () => {
        if (tracking) {
            stopTracking()
        } else {
            startTracking()
        }
    }
    const selectMark = (mark: Mark) => {
        const selected = markToFeature(mark)
        setShowMarkers(false)
        map?.moveTo(mark.geometry.coordinates, 100)
    }

    const onHideSelectedTrack = () => {
        selectTrack(undefined)
    }

    console.log('render overlay', zoom, opacity)
    return (<>
        <SliderContainer>
            <Slider value={opacity} setValue={onOpacityChange} />
           
        </SliderContainer>
        <Buttons>
            {/* <MenuButton name="insights" color="black" backgroundColor="#fff5" onPress={() => this.setState({ showTracks: true })} />
                    <View style={{ height: 40 }} /> */}
            {selectedTrack && <>
                <MenuButton icon="visibility-off" onPress={onHideSelectedTrack} />
                <View style={{ height: 40 }} />
            </>}
            <MenuButton icon="gps-fixed"  onPress={toCurrentLocation} />
            <View style={{ height: 40 }} />
            <MenuButton icon="track-changes" color={tracking ? "red" : "white"} onPress={toggleTracking} />
            <View style={{ height: 40 }} />
            <MenuButton icon="settings" onPress={() => setShowMenu(true)} />
        </Buttons>
        <View style={styles.closestMark}><Text style={styles.markLabel}>{closest}</Text></View>
        {showMenu && <BottomSheet isVisible={showMenu} containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }} modalProps={{}}>
            {menuItems.map((l, i) => (<ListItem key={i} containerStyle={l.containerStyle} onPress={l.onPress}>
                <ListItem.Content>
                    <ListItem.Title style={l.titleStyle}>{t(l.title)}</ListItem.Title>
                </ListItem.Content>
            </ListItem>))}
        </BottomSheet>}
        {editedMark && <EditMark
            mark={editedMark}
            center={[location.coords.longitude,location.coords.latitude]}
            save={(data) => saveMark({ ...editedMark, ...data })}
            cancel={() => editMark(undefined)}
            remove={() => editedMark.id ? removeMark(editedMark.id) : null}
        />}
        {showTracks && <Tracks close={() => setShowTracks(false)} />}
        {showMarkers && center && <Markers center={center} select={selectMark} close={() => setShowMarkers(false)} />}
        {showAuth && <Auth close={() => setShowAuth(false)} />}
        {showSettings && <MapSettings close={() => setShowSettings(false)} />}
        {!!resetToken && <ResetPassword close={()=> storeResetToken('')} />}
        {showAccount && <Account close={() => setShowAccount(false)} showAuth={() => {setShowAccount(false); setShowAuth(true)}} />}
        {showAbout && <About close={() => setShowAbout(false)} />}
    </>
    );

}

export default connector(Overlay)

const styles = StyleSheet.create({

    closestMark: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
        justifyContent: 'center'
    },
    markLabel: {
        padding: 4,
        backgroundColor: '#fff8',
        textAlign: 'center',
    }
});