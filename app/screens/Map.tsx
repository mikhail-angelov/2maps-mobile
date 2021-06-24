import React, { Component } from "react";
import Config from 'react-native-config'
import { connect, ConnectedProps } from "react-redux";
import { find, set } from 'lodash'
import { State, Mark } from '../store/types'
import { selectMarks } from '../reducers/marks'
import { addMarkAction, updateMarkAction, removeMarkAction, importPoisAction, exportPoisAction, removeAllPoisAction, featureToMark, markToFeature } from '../actions/marks-actions'
import { selectActiveTrack, selectSelectedTrack, selectLocation, selectTracks } from '../reducers/tracker'
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Slider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styled from 'styled-components/native'
import MapboxGL, { CircleLayerStyle, LineLayerStyle, SymbolLayerStyle } from "@react-native-mapbox-gl/maps";
import { featureCollection, Feature, Point, BBox, Position, lineString, point } from '@turf/helpers';
import EditMark from '../components/EditMark'
import NavigationPanel from '../components/NavigationPanel'
import Tracks from '../components/Tracks'
import Prompt from '../components/Prompt'
import Markers from '../components/Markers'
import { addPointAction, addTrackAction, selectTrackAction, startTrackingAction, stopTrackingAction } from "../actions/tracker-actions";
import { setCenterAction, setOpacityAction, setZoomAction } from "../actions/map-actions";
import { selectCenter, selectOpacity, selectZoom } from '../reducers/map'
import { bboxToTiles } from '../utils/bbox'

MapboxGL.setAccessToken(Config.MAPBOX_PUB_KEY);

const MAPBOX_VECTOR_TILE_SIZE = 512;

const ANNOTATION_SIZE = 245;

const rasterSourceProps = {
    id: 'stamenWatercolorSource',
    tileUrlTemplates: [
        'https://mapnn.bconf.com/map/mende/{z}/{x}/{y}.jpg',
    ],
    tileSize: 256,
};
const Container = styled(View)`
    flex: 1;
    position: relative;
`
const StyledMap = styled(MapboxGL.MapView)`
  flex: 1;
  width: 100%;
`
const SliderContainer = styled(View)`
    position: absolute;
    height: 100px;
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
    top:200px;
    right:10px;
`
const MenuButton = styled(Icon.Button)` 
    background-color: #fff5;
    opacity: 0.5;
`
const TrackStyle: LineLayerStyle = {
    lineCap: 'round',
    lineWidth: 6,
    // lineWidth: [
    //     'interpolate', ['linear'],
    //     ['zoom'],
    //     16, 1,
    //     20, 3
    // ],
    lineOpacity: 0.84,
    lineColor: 'red',
}
const SelectedTrackStyle: LineLayerStyle = {
    lineCap: 'round',
    // lineWidth: 6,
    lineWidth: [
        'interpolate', ['linear'],
        ['zoom'],
        16, 5,
        20, 7
    ],
    lineOpacity: 0.84,
    lineColor: 'blue',
}
const CurrentLocationStyle: CircleLayerStyle = {
    circleRadius: 10,
    circleColor: 'red',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}
const CenterStyle: CircleLayerStyle = {
    circleRadius: 12,
    circleColor: 'yellow',
    circleOpacity: 0.7,
    circleStrokeColor: 'black',
    circleStrokeWidth: 1,
}

const MarkStyle: CircleLayerStyle = {
    circleRadius: 12,
    circleColor: 'blue',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}

const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
    tracks: selectTracks(state),
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
    location: selectLocation(state),
    center: selectCenter(state),
    opacity: selectOpacity(state),
    zoom: selectZoom(state),
});
const mapDispatchToProps = {
    addMark: addMarkAction,
    updateMark: updateMarkAction,
    removeMark: removeMarkAction,
    importPois: importPoisAction,
    exportPois: exportPoisAction,
    selectTrack: selectTrackAction,
    startTracking: startTrackingAction,
    stopTracking: stopTrackingAction,
    addPoint: addPointAction,
    addTrack: addTrackAction,
    removeAllPois: removeAllPoisAction,
    setCenter: setCenterAction,
    setOpacity: setOpacityAction,
    setZoom: setZoomAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

class Map extends Component<Props> {
    private camera: MapboxGL.Camera | undefined
    private map: MapboxGL.MapView | undefined

    state: {
        showEdit: boolean;
        showMenu: boolean;
        showTracks: boolean;
        showTrackName: boolean;
        showMarkers: boolean;
        tracking: boolean;
        loading: boolean;
        recording: boolean;
        selected?: Feature<Point>;
        navigationMark?: Feature<Point>;
        newMark?: Feature<Point>
    } = {
            showEdit: false,
            showMenu: false,
            showTracks: false,
            showTrackName: false,
            showMarkers: false,
            recording: false,
            tracking: false,
            loading: false,
        };

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
    }
    componentWillUnmount() {
    }
    UNSAFE_componentWillUpdate(newProps: Props, st: any) {
        const { tracking } = this.state
        const { location, addPoint } = this.props
        const { location: newLocation } = newProps
        if (tracking && location.coords.latitude !== newLocation.coords.latitude || location.coords.longitude !== newLocation.coords.longitude) {
            addPoint([newLocation.coords.longitude, newLocation.coords.latitude])
        }
    }

    onOpacityChange = (value: number) => {
        this.props.setOpacity(value);
    }
    onAddMark = async (e: any) => {
        const z = this.map?.getZoom()
        console.log('on new', e.geometry, z)
        this.setState({ showEdit: true, selected: undefined, newMark: e })
    }
    onOffline = async () => {
        const b = await this.map?.getVisibleBounds()
        if (!b) {
            return
        }
        const bb = [...b[1], ...b[0]] as BBox
        const tiles = bboxToTiles(bb)
        const z = await this.map?.getZoom()
        console.log('--', b, z, tiles.length)
        const pacName = 'test'
        const p = await MapboxGL.offlineManager.getPack(pacName)
        if (p) {
            await MapboxGL.offlineManager.deletePack(pacName);
            MapboxGL.offlineManager.unsubscribe(pacName);
        }

        const options = {
            name: pacName,
            styleURL: MapboxGL.StyleURL.SatelliteStreet,
            bounds: b as [Position, Position],
            minZoom: 13,
            maxZoom: 18,
        };

        MapboxGL.offlineManager.createPack(options, (offlineRegion, offlineRegionStatus) => {
            console.log('on load', offlineRegion, offlineRegionStatus)
            if (offlineRegionStatus.state !== 1) {
                this.setState({ loading: false })
            }
        });
        this.setState({ loading: true })
    }
    onMarkPress = ({ features }: any) => {
        const feature = features[0]
        console.log('on press', feature.id, feature)
        this.setState({ selected: features[0], newMark: undefined })
        this.camera?.moveTo(feature.geometry.coordinates, 500)
    }
    onCreate = (feature: Feature<Point>, data: { name: string }) => {
        if (!feature.properties?.id) {
            feature.properties = feature.properties || {}
            feature.properties.id = `${Date.now()}`
        }
        const mark = featureToMark(feature)
        mark.name = data.name
        this.props.addMark(mark)
        this.setState({ showEdit: false })
    }
    onSave = (feature: Feature<Point>, data: { name: string; description: string }) => {
        if (!feature.properties?.id) {
            feature.properties = feature.properties || {}
            feature.properties.id = `${Date.now()}`
        }
        const mark = featureToMark(feature)
        mark.name = data.name
        mark.description = data.description
        const newFeature = markToFeature(mark)
        this.setState({ showEdit: false, selected: newFeature })
        this.props.updateMark(mark)
    }
    onNavigate = () => {
        if (!this.state.selected?.id) {
            return
        }
        this.setState({ showEdit: false, navigationMark: { ...this.state.selected }, tracking: true })
    }
    onRemove = (id: string) => {
        this.props.removeMark(id)
        this.setState({ selected: undefined })
    }
    onCancel = () => {
        this.setState({ showEdit: false, newMark: undefined })
    }
    toggleTracking = () => {
        const { tracking } = this.state
        if (tracking) {
            this.setState({ showTrackName: true })
        } else {
            this.props.startTracking()
        }
        this.setState({ tracking: !tracking })
    }
    onNameTrack = (name: string) => {
        const { activeTrack, addTrack, stopTracking } = this.props
        if (activeTrack) {
            const track = { ...activeTrack, name }
            addTrack(track)
        }
        stopTracking()
        this.setState({ showTrackName: false })
    }
    onCancelNameTrack = () => {
        this.props.stopTracking()
        this.setState({ showTrackName: false })
    }
    toggleNavigation = () => {
        const { navigationMark } = this.state
        if (navigationMark) {
            this.setState({ navigationMark: undefined })
            return
        }
        this.onNavigate()
    }
    onSelectTrack = (id: string) => {
        const track = find(this.props.tracks, { id })
        this.props.selectTrack(track)
        this.setState({ showTracks: false })
    }
    onCenter = () => {
        const { location } = this.props
        const center = [location.coords.longitude, location.coords.latitude]
        this.camera?.moveTo(center, 500)
    }
    updateCenter = async (e: Feature<Point>) => {
        console.log('update center', this.props.center, e)
        this.props.setCenter(e.geometry.coordinates)
        const z = await this.map?.getZoom()
        this.props.setZoom(z || 15)
    }
    selectMark = (mark: Mark) => {
        const selected = markToFeature(mark)
        this.setState({ showMarkers: false, selected })
        this.camera?.moveTo(mark.geometry.coordinates, 500)
    }
    importPois = () => this.props.importPois()
    exportPois = () => this.props.exportPois()
    removeAllPois = () => this.props.removeAllPois()
    onCloseMarkers = () => this.setState({ showMarkers: false })

    render() {
        const { marks, location, tracks, activeTrack, selectedTrack, opacity, center, zoom } = this.props
        const { selected, showEdit, navigationMark, tracking, loading, recording, newMark, showMenu, showTracks, showTrackName, showMarkers } = this.state
        const marksCollection = featureCollection(marks.map(markToFeature))

        const route = activeTrack && activeTrack.track.length > 1 ? lineString(activeTrack.track) : null
        const selectedRoute = selectedTrack && selectedTrack.track.length > 1 ? lineString(selectedTrack.track) : null

        // const currentLocation = [location.coords.longitude, location.coords.latitude]
        // const currentLocationFeature = point(currentLocation)
        // currentLocationFeature.id = 'currentLocationFeature'
        const centerFeature = point(center)
        console.log('render', zoom)
        return (
            <Container>
                <StyledMap zoomEnabled compassEnabled
                    compassViewMargins={{ x: 0, y: 100 }}
                    styleURL={MapboxGL.StyleURL.SatelliteStreet}
                    onLongPress={this.onAddMark}
                    onRegionDidChange={this.updateCenter}
                    ref={(m: MapboxGL.MapView) => (this.map = m)}
                >
                    <MapboxGL.Camera
                        ref={(c: MapboxGL.Camera) => (this.camera = c)}
                        zoomLevel={zoom}
                        centerCoordinate={center}
                        followUserLocation={tracking}
                        followZoomLevel={zoom}
                        followHeading={0}
                        followUserMode='course'
                    />
                    <MapboxGL.RasterSource {...rasterSourceProps}>
                        <MapboxGL.RasterLayer
                            id="stamenWatercolorLayer"
                            sourceID="stamenWatercolorSource"
                            style={{ rasterOpacity: opacity }}
                        />
                    </MapboxGL.RasterSource>

                    <MapboxGL.ShapeSource
                        id="marksLocationSource"
                        hitbox={{ width: 20, height: 20 }}
                        onPress={this.onMarkPress}
                        shape={marksCollection}>
                        <MapboxGL.CircleLayer id='marks' style={MarkStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>
                    {center && <MapboxGL.ShapeSource
                        id="markCenter"
                        shape={centerFeature}>
                        <MapboxGL.CircleLayer id='cent' style={CenterStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>}

                    {selected && <MapboxGL.MarkerView
                        id="sel"
                        coordinate={selected.geometry.coordinates}
                        title={selected.properties?.name}
                        anchor={{ x: 0.5, y: 1.2 }}
                    >
                        <TouchableOpacity onPress={() => this.setState({ showEdit: true })} style={styles.touchable}>
                            <MapboxGL.Callout title={selected.properties?.name} />
                        </TouchableOpacity>
                    </MapboxGL.MarkerView>}
                    {/* <MapboxGL.MarkerView
                        id="sel-center"
                        coordinate={center}
                        title={`${center}`}
                        anchor={{ x: 0.5, y: 1.2 }}
                    >
                        <TouchableOpacity onPress={() => this.camera.moveTo(centerFeature.geometry.coordinates, 500)} style={styles.touchable}>
                            <MapboxGL.Callout title={`${center}`} />
                        </TouchableOpacity>
                    </MapboxGL.MarkerView> */}
                    {/* <MapboxGL.ShapeSource
                        id="centerSource"
                        shape={currentLocationFeature}
                        onPress={() => this.camera?.moveTo(currentLocationFeature.geometry.coordinates, 500)}
                    >
                        <MapboxGL.CircleLayer id='center' style={CurrentLocationStyle} minZoomLevel={1} />
                        {selected && <MapboxGL.Callout title={selected.properties?.name} ></MapboxGL.Callout>}
                    </MapboxGL.ShapeSource> */}
                    {route && <MapboxGL.ShapeSource id='track' shape={route}>
                        <MapboxGL.LineLayer id='lineLayer' style={TrackStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>}
                    {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
                        <MapboxGL.LineLayer id='sel-lineLayer' style={SelectedTrackStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>}
                </StyledMap>
                <SliderContainer>
                    <StyledSlider
                        value={opacity}
                        onValueChange={this.onOpacityChange}
                        thumbTintColor="#4264fb"
                        thumbTouchSize={{ width: 44, height: 44 }}
                        maximumTrackTintColor='#c5b9eb'
                        minimumTrackTintColor='#5a3fc0'
                    />
                </SliderContainer>
                <Buttons>
                    <MenuButton name="insights" color="black" backgroundColor="#fff5" onPress={() => this.setState({ showTracks: true })} />
                    <View style={{ height: 40 }} />
                    <MenuButton name="location-pin" color="black" backgroundColor="#fff5" onPress={() => this.setState({ showMarkers: true })} />
                    <View style={{ height: 40 }} />
                    <MenuButton name="gps-fixed" color={tracking ? "red" : "black"} backgroundColor="#fff5" onPress={this.toggleTracking} />
                    <View style={{ height: 40 }} />
                    {/* <MenuButton name={loading ? "hourglass-bottom" : "save"} color="black" backgroundColor="#fff5" onPress={this.onOffline} /> */}
                </Buttons>
                {showEdit && selected && <EditMark
                    mark={selected}
                    save={(data) => this.onSave(selected, data)}
                    cancel={this.onCancel}
                    remove={this.onRemove}
                    navigate={this.onNavigate}
                />}
                {showEdit && newMark && <EditMark
                    mark={newMark}
                    save={(data) => this.onCreate(newMark, data)}
                    cancel={this.onCancel}
                />}

                {navigationMark && <NavigationPanel target={navigationMark.geometry.coordinates} close={() => this.setState({ navigationMark: undefined })} />}
                {showTracks && <Tracks
                    select={this.onSelectTrack}
                    toggleTracking={this.toggleTracking}
                    unSelect={this.toggleNavigation}
                    isTracking={tracking} tracks={tracks} close={() => this.setState({ showTracks: false })} />}
                {showTrackName && <Prompt visible alertSubject="Enter track name" promptText="" successfulAnswer={this.onNameTrack} cancelAnswer={this.onCancelNameTrack} />}
                {showMarkers && center && <Markers
                    markers={marks}
                    center={center}
                    select={this.selectMark}
                    importMarks={this.importPois}
                    exportMarks={this.exportPois}
                    removeAll={this.removeAllPois}
                    close={this.onCloseMarkers} />}
            </Container>
        );
    }
}

export default connector(Map)

const styles = StyleSheet.create({
    annotationContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: ANNOTATION_SIZE / 2,
        borderWidth: StyleSheet.hairlineWidth,
        height: ANNOTATION_SIZE,
        justifyContent: 'center',
        overflow: 'hidden',
        width: ANNOTATION_SIZE,
        fontSize: 20,
    },
    touchableContainer: { borderColor: 'black', borderWidth: 1.0, width: 60, backgroundColor: 'white', },
    touchable: {
        // backgroundColor: 'blue',
        // width: 40,
        height: 50,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchableText: {
        color: 'white',
        fontWeight: 'bold',
    },
});