import React, { Component } from "react";
import Config from 'react-native-config'
import { connect, ConnectedProps } from "react-redux";
import { find } from 'lodash'
import { State } from '../store/types'
import { selectMarks } from '../reducers/marks'
import { addMarkAction, removeMarkAction, importPoisAction, exportPoisAction, featureToMark, markToFeature } from '../actions/marks-actions'
import { selectActiveTrack, selectSelectedTrack, selectCompass, selectLocation, selectTracks } from '../reducers/tracker'
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Slider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styled from 'styled-components/native'
import MapboxGL, { CircleLayerStyle, LineLayerStyle, SymbolLayerStyle } from "@react-native-mapbox-gl/maps";
import { featureCollection, Feature, Point, BBox, Position, lineString, point } from '@turf/helpers';
import EditMark from '../components/EditMark'
import RemoveMark from '../components/RemoveMark'
import MenuList, { MENU } from '../components/MenuList'
import NavigationPanel from '../components/NavigationPanel'
import Tracks from '../components/Tracks'
import Prompt from '../components/Prompt'
import { addPointAction, addTrackAction, selectTrackAction, startTrackingAction, stopTrackingAction } from "../actions/tracker-actions";
import { bboxToTiles } from '../utils/bbox'

MapboxGL.setAccessToken(Config.MAPBOX_PUB_KEY);

const CENTER_COORD = [44.320691, 56.090846];
const MAPBOX_VECTOR_TILE_SIZE = 512;

const ANNOTATION_SIZE = 245;

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
const CenterStyle: CircleLayerStyle = {
    circleRadius: 10,
    circleColor: 'red',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}

const MarkStyle: CircleLayerStyle = {
    circleRadius: 12,
    circleColor: 'blue',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}
const BallonStyle: SymbolLayerStyle = {
    // textField: ['get', 'description'],
    textField: '{description}',
    textSize: 12,
    textPitchAlignment: 'map',
    iconAllowOverlap: false,
}

const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
    tracks: selectTracks(state),
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
    compass: selectCompass(state),
    location: selectLocation(state),
});
const mapDispatchToProps = {
    addMark: addMarkAction,
    removeMark: removeMarkAction,
    importPois: importPoisAction,
    exportPois: exportPoisAction,
    selectTrack: selectTrackAction,
    startTracking: startTrackingAction,
    stopTracking: stopTrackingAction,
    addPoint: addPointAction,
    addTrack: addTrackAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

class Map extends Component<Props> {
    private camera: MapboxGL.Camera | undefined
    private map: MapboxGL.MapView | undefined

    state: {
        opacity: number;
        showEdit: boolean;
        showRemove: boolean;
        showMenu: boolean;
        showTracks: boolean;
        showTrackName: boolean;
        tracking: boolean;
        loading: boolean;
        recording: boolean;
        selected?: Feature<Point>;
        navigationMark?: Feature<Point>;
        newMark?: Feature<Point>
    } = {
            opacity: 0.5,
            showEdit: false,
            showRemove: false,
            showMenu: false,
            showTracks: false,
            showTrackName: false,
            recording: false,
            tracking: false,
            loading: false,
        };

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
    }
    componentWillUnmount() {
    }
    UNSAFE_componentWillUpdate(newProps: Props) {
        const { tracking } = this.state
        const { location, addPoint } = this.props
        const { location: newLocation } = newProps
        if (tracking && location.coords.latitude !== newLocation.coords.latitude || location.coords.longitude !== newLocation.coords.longitude) {
            addPoint([newLocation.coords.longitude, newLocation.coords.latitude])
        }

    }
    onHandleMenu = (item: MENU) => {
        const { importPois, exportPois, selectTrack } = this.props
        console.log('menu', item)
        this.setState({ showMenu: false })
        switch (item) {
            case MENU.Import:
                importPois();
                break;
            case MENU.Export:
                exportPois();
                break;
            case MENU.ToggleTracking:
                this.toggleTracking();
                break;
            case MENU.Tracks:
                this.setState({ showTracks: true });
                break;
            case MENU.SelectTrack:
                selectTrack(undefined)
                break;

        }
    }
    onOpacityChange = (value: number) => {
        this.setState({ opacity: value });
    }
    onAddMark = async (e: any) => {
        const z = this.map?.getZoom()
        console.log('on new', e.geometry, z)
        // this.setState({ showEdit: true, selected: undefined, newMark: feature(e.geometry) })
    }
    onOffline= async () => {
        const b = await this.map?.getVisibleBounds()
        if (!b) {
            return
        }
        const bb = [...b[1], ...b[0]] as BBox
        const tiles = bboxToTiles(bb)
        const z = this.map?.getZoom()

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
            minZoom: 1,
            maxZoom: 20,
        };

        MapboxGL.offlineManager.createPack(options, (offlineRegion, offlineRegionStatus) => {
            console.log('on load', offlineRegion, offlineRegionStatus)
            if(offlineRegionStatus.state !== 1){
                this.setState({loading: false})
            }
        });
        this.setState({loading: true})
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
    onSave = (feature: Feature<Point>, data: { name: string }) => {
        if (!feature.properties?.id) {
            feature.properties = feature.properties || {}
            feature.properties.id = `${Date.now()}`
        }
        const mark = featureToMark(feature)
        mark.name = data.name
        const newFeature = markToFeature(mark)
        this.setState({ showEdit: false, selected: newFeature })
        this.props.addMark(mark)
    }
    onShowRemove = () => {
        this.setState({ showEdit: false, showRemove: true })
    }
    onNavigate = () => {
        if (!this.state.selected?.id) {
            return
        }
        this.setState({ showEdit: false, navigationMark: { ...this.state.selected }, tracking: true })
    }
    onRemove = () => {
        if (!this.state.selected?.id) {
            return
        }
        this.props.removeMark(this.state.selected.id + '')
        this.setState({ showRemove: false, selected: undefined })
    }
    onCancel = () => {
        this.setState({ showEdit: false, showRemove: false, newMark: undefined })
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
        const { selected, navigationMark } = this.state
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

    render() {
        const { marks, compass, location, tracks, activeTrack, selectedTrack } = this.props
        const { selected, showEdit, showRemove, navigationMark, tracking,loading, recording, newMark, showMenu, showTracks, showTrackName } = this.state
        const center = [location.coords.longitude, location.coords.latitude]
        const marksCollection = featureCollection(marks.map(markToFeature))

        const route = activeTrack && activeTrack.track.length > 1 ? lineString(activeTrack.track) : null
        const selectedRoute = selectedTrack && selectedTrack.track.length > 1 ? lineString(selectedTrack.track) : null

        const centerFeature = point(center)
        centerFeature.id = 'center'
        return (
            <Container>
                <StyledMap zoomEnabled compassEnabled
                    compassViewMargins={{ x: 0, y: 100 }}
                    styleURL={MapboxGL.StyleURL.SatelliteStreet}
                    onLongPress={this.onAddMark}
                    ref={(m: MapboxGL.MapView) => (this.map = m)}
                >
                    <MapboxGL.Camera
                        ref={(c: MapboxGL.Camera) => (this.camera = c)}
                        zoomLevel={15}
                        centerCoordinate={CENTER_COORD}
                        followUserLocation={tracking}
                        followZoomLevel={16}
                        followPitch={45}
                        followHeading={0}
                        followUserMode='course'

                    />
                    <MapboxGL.RasterSource {...rasterSourceProps}>
                        <MapboxGL.RasterLayer
                            id="stamenWatercolorLayer"
                            sourceID="stamenWatercolorSource"
                            style={{ rasterOpacity: this.state.opacity }}
                        />
                    </MapboxGL.RasterSource>

                    <MapboxGL.ShapeSource
                        id="marksLocationSource"
                        hitbox={{ width: 20, height: 20 }}
                        onPress={this.onMarkPress}
                        shape={marksCollection}>
                        <MapboxGL.CircleLayer id='marks' style={MarkStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>

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
                    <MapboxGL.ShapeSource
                        id="centerSource"
                        shape={centerFeature}
                        onPress={() => this.camera?.moveTo(centerFeature.geometry.coordinates, 500)}
                    >
                        <MapboxGL.CircleLayer id='center' style={CenterStyle} minZoomLevel={1} />
                        {selected && <MapboxGL.Callout title={selected.properties?.name} ></MapboxGL.Callout>}
                    </MapboxGL.ShapeSource>
                    {route && <MapboxGL.ShapeSource id='track' shape={route}>
                        <MapboxGL.LineLayer id='lineLayer' style={TrackStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>}
                    {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
                        <MapboxGL.LineLayer id='sel-lineLayer' style={SelectedTrackStyle} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>}
                </StyledMap>
                <SliderContainer>
                    <StyledSlider
                        value={this.state.opacity}
                        onValueChange={this.onOpacityChange}
                        thumbTintColor="#4264fb"
                        thumbTouchSize={{ width: 44, height: 44 }}
                        maximumTrackTintColor='#c5b9eb'
                        minimumTrackTintColor='#5a3fc0'
                    />
                </SliderContainer>
                <Buttons>
                    <MenuButton name="dehaze" color="black" backgroundColor="#fff5" onPress={() => this.setState({ showMenu: true })} />
                    <View style={{ height: 40 }} />
                    <MenuButton name="gps-fixed" color={tracking ? "red" : "black"} backgroundColor="#fff5" onPress={this.toggleTracking} />
                    <View style={{ height: 40 }} />
                    <MenuButton name="gps-fixed" color="black" backgroundColor="#fff5" onPress={this.onCenter} />
                    <View style={{ height: 40 }} />
                    <MenuButton name={loading?"hourglass-bottom":"save"} color="black" backgroundColor="#fff5" onPress={this.onOffline} />
                </Buttons>
                {showEdit && selected && <EditMark
                    mark={selected}
                    save={(data) => this.onSave(selected, data)}
                    cancel={this.onCancel}
                    remove={this.onShowRemove}
                    navigate={this.onNavigate}
                />}
                {showEdit && newMark && <EditMark
                    mark={newMark}
                    save={(data) => this.onCreate(newMark, data)}
                    cancel={this.onCancel}
                />}
                {showRemove && selected && <RemoveMark mark={selected} remove={() => this.onRemove()} cancel={this.onCancel} />}

                {navigationMark && <NavigationPanel location={location} compass={compass} target={navigationMark.geometry.coordinates} close={() => this.setState({ navigationMark: undefined })} />}
                {showMenu && <MenuList handle={this.onHandleMenu} isRecording={recording} isTracking={tracking} />}
                {showTracks && <Tracks select={this.onSelectTrack} tracks={tracks} close={() => this.setState({ showTracks: false })} />}
                {showTrackName && <Prompt visible alertSubject="Enter track name" promptText="" successfulAnswer={this.onNameTrack} cancelAnswer={this.onCancelNameTrack} />}
            </Container>
        );
    }
}

export default connector(Map)