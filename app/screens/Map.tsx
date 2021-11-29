import React, { Component } from "react";
import Config from 'react-native-config'
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { selectMarks } from '../reducers/marks'
import { featureToMark, editMarkAction, markToFeature } from '../actions/marks-actions'
import { selectIsTracking } from '../reducers/tracker'
import { StyleSheet, TouchableOpacity } from "react-native";
import styled from 'styled-components/native'
import MapboxGL, { CircleLayerStyle, LineLayerStyle, SymbolLayerStyle, RasterSourceProps, RegionPayload } from "@react-native-mapbox-gl/maps";
import { featureCollection, Feature, Point } from '@turf/helpers';
import { GeoJSON } from 'geojson';
import { checkAction } from "../actions/auth-actions";
import { setCenterAction, setZoomAction } from "../actions/map-actions";
import { addPointAction, setLocationAction } from "../actions/tracker-actions";
import { selectCenter, selectOpacity, selectZoom, selectPrimaryMap, selectSecondaryMap } from '../reducers/map'
import ActiveTrack from '../components/ActiveTrack'

MapboxGL.setAccessToken(Config.MAPBOX_PUB_KEY || 'pk.eyJ1IjoibWlraGFpbGFuZ2Vsb3YiLCJhIjoiY2tpa2FnbnM5MDg5ejJ3bDQybWN3eWRsdSJ9.vK_kqebrJaO7MdIg4ilaFQ');

const ANNOTATION_SIZE = 245;

const rasterSourceProps: RasterSourceProps = {
    id: 'stamenWatercolorSource',
    tileUrlTemplates: [
        // 'https://mapnn.bconf.com/map/mende/{z}/{x}/{y}.jpg',
        'http://localhost:5555/map/mende/{z}/{x}/{y}.png',
        // 'http://192.168.31.251:3000/map/mende/{z}/{x}/{y}.jpg',
    ],
    minZoomLevel: 1,
    tileSize: 256,
};

const StyledMap = styled(MapboxGL.MapView)`
  flex: 1;
  width: 100%;
`

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


const MarkStyle: CircleLayerStyle = {
    circleRadius: 12,
    circleColor: 'blue',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}
const WikiStyle: LineLayerStyle = {
    lineWidth: 2,
    lineColor: 'red',
    lineOpacity: 0.6,
}
const WikiStyleLabel: SymbolLayerStyle = {
    textColor: 'red',
    textSize: 18,
    textField: ['get', 'title'],
    textAnchor: 'bottom',
}

const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
    center: selectCenter(state),
    opacity: selectOpacity(state),
    zoom: selectZoom(state),
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    tracking: selectIsTracking(state),
});
const mapDispatchToProps = {
    setCenter: setCenterAction,
    setZoom: setZoomAction,
    checkAuth: checkAction,
    editMark: editMarkAction,
    addPoint: addPointAction,
    setLocation: setLocationAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { setMap: (map: MapboxGL.Camera | undefined) => void }

class Map extends Component<Props> {
    private camera: MapboxGL.Camera | undefined
    private map: MapboxGL.MapView | undefined

    state: {
        selected?: Feature<Point>;
    } = {};

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
        this.props.checkAuth()
    }
    componentWillUnmount() {
    }
    shouldComponentUpdate(nextProps: Props) {
        if (nextProps.center !== this.props.center || nextProps.zoom !== this.props.zoom) {
            //avoid render on move map
            return false
        }
        return true
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
        console.log('on press', feature.id, feature, this.state.selected)
        if (feature.id === this.state.selected?.id) {
            this.setState({ selected: undefined })
            this.props.editMark(featureToMark(this.state.selected as Feature<Point>))
        } else {
            this.setState({ selected: features[0] })
        }
        this.camera?.moveTo(feature.geometry.coordinates, 100)
    }
    onCreate = (feature: Feature<Point>, data: { name: string }) => {
        if (!feature.properties?.id) {
            feature.properties = feature.properties || {}
            feature.properties.id = `${Date.now()}`
        }
        const mark = featureToMark(feature)
        mark.name = data.name
        this.props.editMark(mark)
    }

    updateCenter = async (e: Feature<Point, RegionPayload>) => {
        console.log('update center', e)
        this.props.setCenter(e.geometry.coordinates)
        // const z = await this.map?.getZoom()
        this.props.setZoom(e.properties.zoomLevel || 15)
    }
    onUserLocationUpdate = (location: MapboxGL.Location) => {
        console.log('update user location', location)
        if (!location?.coords) {
            return
        }
        if (this.props.tracking) {
            this.props.addPoint(location)
        }
        this.props.setLocation(location)
    }
    onBalloonClick = () => {
        this.setState({ selected: undefined })
    }
    onSetMap = (map: MapboxGL.MapView) => {
        this.map = map
    }
    onSetCamera = (camera: MapboxGL.Camera) => {
        this.camera = camera
        this.props.setMap(camera)
    }

    render() {
        const { tracking, primaryMap, secondaryMap, opacity, marks, center, zoom } = this.props
        const { selected } = this.state
        const marksCollection = featureCollection(marks.filter(item => !item.deleted).map(markToFeature))

        let styleURL = primaryMap.url
        console.log('render map', zoom, styleURL)
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
            ref={this.onSetMap}
            key={styleURL}
        >
            <MapboxGL.Camera
                ref={this.onSetCamera}
                defaultSettings={{ centerCoordinate: center, zoomLevel: zoom }}
                followUserLocation={tracking}
                followZoomLevel={zoom}
                followHeading={1}
                followUserMode='course'
            />
            <MapboxGL.UserLocation visible={true} onUpdate={this.onUserLocationUpdate} showsUserHeadingIndicator={tracking} minDisplacement={50} />
            {secondaryMap && <MapboxGL.RasterSource {...rasterSourceProps} tileUrlTemplates={[secondaryMap.url]}>
                <MapboxGL.RasterLayer
                    id="stamenWatercolorLayer"
                    sourceID="stamenWatercolorSource"
                    style={{ rasterOpacity: opacity }}
                />
            </MapboxGL.RasterSource>}

            {/* {wikiCollection && <MapboxGL.ShapeSource
                    id="wikiSource"
                    shape={wikiCollection}>
                    <MapboxGL.LineLayer id='w' style={WikiStyle} minZoomLevel={1} />
                    <MapboxGL.SymbolLayer id='wl' style={WikiStyleLabel} minZoomLevel={1} />
                </MapboxGL.ShapeSource>} */}
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
                <TouchableOpacity onPress={this.onBalloonClick} style={styles.touchable}>
                    <MapboxGL.Callout title={selected.properties?.name} />
                </TouchableOpacity>
            </MapboxGL.MarkerView>}
            <ActiveTrack />
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
                    </MapboxGL.ShapeSource>  */}
            {/*  {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
                    <MapboxGL.LineLayer id='sel-lineLayer' style={SelectedTrackStyle} minZoomLevel={1} />
                </MapboxGL.ShapeSource>} */}
        </StyledMap>
        );
    }
}

export default connector(Map)

const styles = StyleSheet.create({
    touchable: {
        // backgroundColor: 'blue',
        // width: 40,
        height: 50,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});