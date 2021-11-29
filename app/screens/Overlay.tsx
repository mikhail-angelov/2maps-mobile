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
import { Slider, BottomSheet, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styled from 'styled-components/native'
import EditMark from '../components/EditMark'
import Tracks from './Tracks'
import Prompt from '../components/Prompt'
import Markers from './Markers'
import Auth from '../components/Auth'
import MapSettings from './MapSettings'
import { addPointAction, addTrackAction, selectTrackAction, startTrackingAction, stopTrackingAction, getLocation } from "../actions/tracker-actions";
import { checkAction } from "../actions/auth-actions";
import { loadWikiAction } from "../actions/wiki-actions";
import { selectWikiCollection } from "../reducers/wiki";
import { selectIsAuthenticated } from "../reducers/auth";
import { setCenterAction, setOpacityAction, setZoomAction } from "../actions/map-actions";
import { selectCenter, selectOpacity, selectZoom, selectPrimaryMap, selectSecondaryMap, selectStyleUrl } from '../reducers/map'

interface MenuItem {
    title: string;
    onPress?: () => void;
    containerStyle?: any;
    titleStyle?: any;

}

const SliderContainer = styled(View)`
    position: absolute;
    top: 0px;
    height: 80px;
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
    isAuthenticated: selectIsAuthenticated(state),
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    styleUrl: selectStyleUrl(state),
    tracking: selectIsTracking(state),
    editedMark: selectEditedMark(state),
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
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & {map?: MapboxGL.Camera}



// state: {
//     showEdit: boolean;
//     showMenu: boolean;
//     showTracks: boolean;
//     showTrackName: boolean;
//     showMarkers: boolean;
//     showAuth: boolean;
//     showMaps: boolean;
//     loading: boolean;
//     recording: boolean;
//     selected?: Feature<Point>;
//     navigationMark?: Feature<Point>;
//     newMark?: Feature<Point>
// } = {
//         showEdit: false,
//         showMenu: false,
//         showTracks: false,
//         showTrackName: false,
//         showMarkers: false,
//         showAuth: false,
//         showMaps: false,
//         recording: false,
//         loading: false,
//     };

// componentDidMount() {
//     MapboxGL.setTelemetryEnabled(false);
//     this.props.checkAuth()
// }
// componentWillUnmount() {
// }
// UNSAFE_componentWillUpdate(newProps: Props, st: any) {
//     const { location, tracking, addPoint } = this.props
//     const { location: newLocation } = newProps
//     if (tracking && location.coords.latitude !== newLocation.coords.latitude || location.coords.longitude !== newLocation.coords.longitude) {
//         addPoint([newLocation.coords.longitude, newLocation.coords.latitude])
//     }
// }


// onAddMark = async (e: any) => {
//     const z = this.map?.getZoom()
//     console.log('on new', e.geometry, z)
//     this.setState({ showEdit: true, selected: undefined, newMark: e })
// }

// onLoadWiki = async () => {
//     const bounds = await this.map?.getVisibleBounds()
//     const z = await this.map?.getZoom()
//     console.log('--', z, bounds)
//     if (!bounds || !z || z < 9) {
//         return
//     }
//     this.props.loadWiki(bounds)
// }
// onWikiPress = (f: Feature) => {
//     console.log('on wiki', f)
// }

// onCreate = (feature: Feature<Point>, data: { name: string }) => {
//     if (!feature.properties?.id) {
//         feature.properties = feature.properties || {}
//         feature.properties.id = `${Date.now()}`
//     }
//     const mark = featureToMark(feature)
//     mark.name = data.name
//     this.props.addMark(mark)
//     this.setState({ showEdit: false })
// }
// onSave = (feature: Feature<Point>, data: { name: string; description: string }) => {
//     if (!feature.properties?.id) {
//         feature.properties = feature.properties || {}
//         feature.properties.id = `${Date.now()}`
//     }
//     const mark = featureToMark(feature)
//     mark.name = data.name
//     mark.description = data.description
//     const newFeature = markToFeature(mark)
//     this.setState({ showEdit: false, selected: newFeature })
//     this.props.updateMark(mark)
// }

// onRemove = (id: string) => {
//     this.props.removeMark(id)
//     this.setState({ selected: undefined })
// }
// onCancel = () => {
//     this.setState({ showEdit: false, newMark: undefined })
// }


// onNameTrack = (name: string) => {
//     const { activeTrack, addTrack, stopTracking } = this.props
//     if (activeTrack) {
//         const track = { ...activeTrack, name }
//         addTrack(track)
//     }
//     stopTracking()
//     this.setState({ showTrackName: false })
// }
// onCancelNameTrack = () => {
//     this.props.stopTracking()
//     this.setState({ showTrackName: false })
// }

// updateCenter = async (e: Feature<Point>) => {
//     console.log('update center', this.props.center, e)
//     // this.props.setCenter(e.geometry.coordinates)
//     // const z = await this.map?.getZoom()
//     // this.props.setZoom(z || 15)
// }
// onUserLocationUpdate = (location:any) =>{
//     console.log('update user location', location)
// }

// onNavigate = () => {
//     console.log('on navigate')
// }


const getClosestMark = (location: any, marks: Mark[]) => {
    const closest = minBy(marks, mark => distance(mark.geometry.coordinates, location, { units: 'kilometers' }))
    if (!closest) {
        return ''
    }
    return `${closest.name} ${distance(closest.geometry.coordinates, location, { units: 'kilometers' }).toFixed(2)} km.`
}
const Overlay: FC<Props> = ({ map, marks, setOpacity, editedMark, opacity, center, zoom, location, isAuthenticated, editMark, saveMark, removeMark, tracking, activeTrack, startTracking, stopTracking, addTrack }) => {
    const [showMenu, setShowMenu] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [showMarkers, setShowMarkers] = useState(false)
    const [showTracks, setShowTracks] = useState(false)

    const menuItemsNotAuth: MenuItem[] = [
        { title: 'Login', onPress: () => { setShowAuth(true); setShowMenu(false) } },
        { title: 'Settings', onPress: () => { setShowSettings(true); setShowMenu(false) } },
        { title: 'POI', onPress: () => { setShowMarkers(true); setShowMenu(false) } },
        { title: 'Tracks', onPress: () => { setShowTracks(true); setShowMenu(false) } },
        { title: 'Cancel', containerStyle: { backgroundColor: 'blue' }, titleStyle: { color: 'white' }, onPress: () => setShowMenu(false), }
    ]
    const menuItemsAuth: MenuItem[] = [
        { title: 'Logout', onPress: () => { setShowAuth(true); setShowMenu(false) } },
        { title: 'Settings', onPress: () => { setShowSettings(true); setShowMenu(false) } },
        { title: 'POI', onPress: () => { setShowMarkers(true); setShowMenu(false) } },
        { title: 'Tracks', onPress: () => { setShowTracks(true); setShowMenu(false) } },
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
    const menuItems = isAuthenticated ? menuItemsAuth : menuItemsNotAuth
    const onOpacityChange = (value: number) => {
        setOpacity(value);
    }
    const toCurrentLocation = async () => {
        const location = await getLocation()
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

    console.log('render overlay', zoom, closest)
    return (<>
        <SliderContainer>
            <StyledSlider
                value={opacity}
                onValueChange={onOpacityChange}
                thumbTintColor="#4264fb"
                thumbTouchSize={{ width: 44, height: 44 }}
                maximumTrackTintColor='#c5b9eb'
                minimumTrackTintColor='#5a3fc0'
            />
        </SliderContainer>
        <Buttons>
            {/* <MenuButton name="insights" color="black" backgroundColor="#fff5" onPress={() => this.setState({ showTracks: true })} />
                    <View style={{ height: 40 }} /> */}
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
                    <ListItem.Title style={l.titleStyle}>{l.title}</ListItem.Title>
                </ListItem.Content>
            </ListItem>))}
        </BottomSheet>}
        {editedMark && <EditMark
            mark={editedMark}
            save={(data) => saveMark({ ...editedMark, ...data })}
            cancel={() => editMark(undefined)}
            remove={() => editedMark.id ? removeMark(editedMark.id) : null}
        />}
        {showTracks && <Tracks close={() => setShowTracks(false)} />}
        {showMarkers && center && <Markers center={center} select={selectMark} close={() => setShowMarkers(false)} />}
        {showAuth && <Auth close={() => setShowAuth(false)} />}
        {showSettings && <MapSettings close={() => setShowSettings(false)} />}
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