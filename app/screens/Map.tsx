import React, { Component } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State, Mark } from '../store/types'
import { featureToMark, editMarkAction } from '../actions/marks-actions'
import { selectIsTracking, selectSelectedTrackBBox } from '../reducers/tracker'
import styled from 'styled-components/native'
import MapboxGL, { RasterSourceProps, RegionPayload } from "@react-native-mapbox-gl/maps";
import { Feature, Point } from '@turf/helpers';
import { checkAction } from "../actions/auth-actions";
import { setCenterAction, setZoomAction } from "../actions/map-actions";
import { addPointAction, setLocationAction, restartTrackingAction } from "../actions/tracker-actions";
import { selectCenter, selectOpacity, selectZoom, selectPrimaryMap, selectSecondaryMap } from '../reducers/map'
import ActiveTrack from '../components/ActiveTrack'
import MarksLocation from "../components/MarksLocation";
import Wikimapia from "../components/Wikimapia";
import SelectedMark from "../components/SelectedMark";
import * as _ from 'lodash'

MapboxGL.setAccessToken(process.env.MAPBOX_PUB_KEY || 'pk.eyJ1IjoibWlraGFpbGFuZ2Vsb3YiLCJhIjoiY2tpa2FnbnM5MDg5ejJ3bDQybWN3eWRsdSJ9.vK_kqebrJaO7MdIg4ilaFQ');

const rasterSourceProps: RasterSourceProps = {
    id: 'stamenWatercolorSource',
    tileUrlTemplates: ['http://localhost:5555/map/mende/{z}/{x}/{y}.png'],
    minZoomLevel: 1,
    tileSize: 256,
};

const StyledMap = styled(MapboxGL.MapView)`
  flex: 1;
  width: 100%;
`

const mapStateToProps = (state: State) => ({
    center: selectCenter(state),
    opacity: selectOpacity(state),
    zoom: selectZoom(state),
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    tracking: selectIsTracking(state),
    selectedTrackBBox: selectSelectedTrackBBox(state),
});
const mapDispatchToProps = {
    setCenter: setCenterAction,
    setZoom: setZoomAction,
    checkAuth: checkAction,
    editMark: editMarkAction,
    addPoint: addPointAction,
    setLocation: setLocationAction,
    restartTracking: restartTrackingAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { setMap: (map: MapboxGL.Camera | undefined) => void }

class Map extends Component<Props> {
    private camera: MapboxGL.Camera | undefined
    private map: MapboxGL.MapView | undefined

    state: {
        selected?: Mark;
    } = {};

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
        this.props.checkAuth()
        MapboxGL.locationManager.start();
    }
    componentWillUnmount() {
        MapboxGL.locationManager.stop();
    }
    shouldComponentUpdate(nextProps: Props) {
        if (nextProps.center !== this.props.center || nextProps.zoom !== this.props.zoom) {
            //avoid render on move map
            return false
        }
        return true
    }
    
    componentDidUpdate(prevProps: any) {
        if(this.props.selectedTrackBBox && !_.isEqual(this.props.selectedTrackBBox, prevProps.selectedTrackBBox)) {
            const start = this.props.selectedTrackBBox?.[0]
            const end = this.props.selectedTrackBBox?.[1]
            this.camera?.fitBounds(start, end, 70, 100)
        }
    }

    onAddMark = async (feature: GeoJSON.Feature) => {
        const z = this.map?.getZoom()
        console.log('on add mark', feature.geometry, z)
        if (!feature.properties?.id) {
            feature.properties = feature.properties || {}
            feature.properties.id = `${Date.now()}`
        }
        const mark = featureToMark(feature as Feature<Point>)
        this.props.editMark(mark)
    }

    onMarkPress = ({ features }: any) => {
        const feature = features[0]
        console.log('on press', feature.id, this.state.selected)
        const selected = featureToMark(feature)
        if (feature.id === this.state.selected?.id) {
            this.setState({ selected: undefined })
            this.props.editMark(selected)
        } else {
            this.setState({ selected })
        }
        this.camera?.moveTo(feature.geometry.coordinates, 100)
    }

    updateCenter = (e: Feature<Point, RegionPayload>) => {
        console.log('update center', e.properties)
        this.props.setCenter(e.geometry.coordinates)
        this.props.setZoom(e.properties.zoomLevel || 15)
    }
    onUserLocationUpdate = (location: MapboxGL.Location) => {
        console.log('update user location', location)
        if (!location?.coords) {
            return
        }
        if (this.props.tracking) {
            this.props.addPoint(location)
            this.camera?.flyTo([location.coords.longitude, location.coords.latitude], 100)
        }
        this.props.setLocation(location)
    }
    onBalloonClick = () => {
        this.setState({ selected: undefined })
    }
    onBalloonLongClick = () => {
        this.props.editMark(this.state.selected)
        this.setState({ selected: undefined })
    }
    onSetMap = (map: MapboxGL.MapView) => {
        this.map = map
    }
    onSetCamera = (camera: MapboxGL.Camera) => {
        this.camera = camera
        this.props.setMap(camera)
    }
    onTouchEnd = () => {
        const { tracking, restartTracking } = this.props
        if (tracking) {
            restartTracking()
        }
    }

    render() {
        const { tracking, primaryMap, secondaryMap, opacity, center, zoom } = this.props
        const { selected } = this.state

        let styleURL = primaryMap.url
        console.log('render map', zoom, opacity)
        if (!styleURL) {
            //todo:  render invalid map setting view
            return null
        }
        if (styleURL.startsWith('http://localhost')) {
            // this custom raster map
            styleURL = JSON.stringify({
                "version": 8,
                "sources": {
                    "tile-source": {
                        "type": "raster",
                        "tiles": [primaryMap.url],
                        "tileSize": 256
                    }
                },
                "layers": [
                    {
                        "id": "base-tiles",
                        "type": "raster",
                        "source": "tile-source"
                    }
                ]
            })
        }

        return (<StyledMap
            zoomEnabled
            compassEnabled
            styleURL={styleURL}
            compassViewMargins={{ x: 0, y: 100 }}
            onLongPress={this.onAddMark}
            onRegionDidChange={this.updateCenter}
            onTouchEnd={this.onTouchEnd}
            ref={this.onSetMap}
            key={styleURL}
        >
            <MapboxGL.Camera
                ref={this.onSetCamera}
                defaultSettings={{ centerCoordinate: center, zoomLevel: zoom }}
                followZoomLevel={zoom}
                followUserMode='normal'
            />
            <MapboxGL.UserLocation visible={true} onUpdate={this.onUserLocationUpdate} showsUserHeadingIndicator={tracking} minDisplacement={50} />
            {secondaryMap && <MapboxGL.RasterSource {...rasterSourceProps} tileUrlTemplates={[secondaryMap.url]}>
                <MapboxGL.RasterLayer
                    id="stamenWatercolorLayer"
                    sourceID="stamenWatercolorSource"
                    style={{ rasterOpacity: opacity }}
                />
            </MapboxGL.RasterSource>}
            <Wikimapia />
            <MarksLocation onMarkPress={this.onMarkPress} />
            <ActiveTrack />
            <SelectedMark mark={selected} unselect={this.onBalloonClick} openEdit={this.onBalloonLongClick} />
        </StyledMap>
        );
    }
}

export default connector(Map)
