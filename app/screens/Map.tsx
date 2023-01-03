import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import {State, Tracking} from '../store/types';
import {
  featureToMark,
  editMarkAction,
  selectMarkAction,
} from '../actions/marks-actions';
import {selectSelectedMark} from '../reducers/marks';
import {
  selectIsTracking,
  selectLocation,
  selectSelectedTrackBBox,
} from '../reducers/tracker';
import MapboxGL, {
  OnPressEvent,
  RasterSourceProps,
  RegionPayload,
} from '@rnmapbox/maps';
import {Feature, Point} from '@turf/helpers';
import {checkAction} from '../actions/auth-actions';
import {setCenterAction, setZoomAction} from '../actions/map-actions';
import {
  addPointAction,
  setLocationAction,
  restartTrackingAction,
} from '../actions/tracker-actions';
import {
  selectCenter,
  selectOpacity,
  selectZoom,
  selectPrimaryMap,
  selectSecondaryMap,
  selectShowWikimapia,
} from '../reducers/map';
import ActiveTrack from '../components/ActiveTrack';
import MarksLocation from '../components/MarksLocation';
import Wikimapia from '../components/Wikimapia';
import SelectedMark from '../components/SelectedMark';
import * as _ from 'lodash';
import Drawing from '../components/DrawingMapLayer';
import {selectDrawingBBox} from '../reducers/drawings';
import TripMapLayer from '../components/TripMapLayer';
import {selectTripMarkAction} from '../actions/trips-actions';
import {selectActiveTrip, selectActiveTripMark} from '../reducers/trips';

MapboxGL.setWellKnownTileServer('Mapbox');
MapboxGL.setAccessToken(
  process.env.MAPBOX_PUB_KEY ||
    'pk.eyJ1IjoibWlraGFpbGFuZ2Vsb3YiLCJhIjoiY2tpa2FnbnM5MDg5ejJ3bDQybWN3eWRsdSJ9.vK_kqebrJaO7MdIg4ilaFQ',
);

export const rasterSourceProps: RasterSourceProps = {
  id: 'stamenWatercolorSource',
  tileUrlTemplates: ['http://localhost:5555/map/mende/{z}/{x}/{y}.png'],
  minZoomLevel: 1,
  tileSize: 256,
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
});

const mapStateToProps = (state: State) => ({
  center: selectCenter(state),
  opacity: selectOpacity(state),
  zoom: selectZoom(state),
  primaryMap: selectPrimaryMap(state),
  secondaryMap: selectSecondaryMap(state),
  tracking: selectIsTracking(state),
  selectedTrackBBox: selectSelectedTrackBBox(state),
  location: selectLocation(state),
  showWikimapia: selectShowWikimapia(state),
  selectedMark: selectSelectedMark(state),
  selectedDrawingBBox: selectDrawingBBox(state),
  selectedTripMark: selectActiveTripMark(state),
  selectedTrip: selectActiveTrip(state),
});
const mapDispatchToProps = {
  setCenter: setCenterAction,
  setZoom: setZoomAction,
  checkAuth: checkAction,
  editMark: editMarkAction,
  addPoint: addPointAction,
  setLocation: setLocationAction,
  restartTracking: restartTrackingAction,
  selectMark: selectMarkAction,
  selectTripMark: selectTripMarkAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & {
  setMap: (map: MapboxGL.MapView | undefined) => void;
  setCamera: (map: MapboxGL.Camera | undefined) => void;
};

class Map extends Component<Props> {
  private camera: MapboxGL.Camera | undefined;
  private map: MapboxGL.MapView | undefined;
  private interval: ReturnType<typeof setInterval> | undefined;

  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
    this.props.checkAuth();
    // MapboxGL.locationManager.start();
    this.interval = setInterval(() => {
      const {tracking, location} = this.props;
      if (tracking !== Tracking.none && location) {
        this.camera?.moveTo(
          [location.coords.longitude, location.coords.latitude],
          100,
        );
      }
    }, 20000);
  }
  componentWillUnmount() {
    // MapboxGL.locationManager.stop();
    this.interval && clearInterval(this.interval);
  }
  shouldComponentUpdate(nextProps: Props) {
    if (
      nextProps.center !== this.props.center ||
      nextProps.zoom !== this.props.zoom ||
      nextProps.location !== this.props.location
    ) {
      //avoid render on move map
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps: any) {
    if (
      (this.props.selectedTrackBBox &&
        !_.isEqual(
          this.props.selectedTrackBBox,
          prevProps.selectedTrackBBox,
        )) ||
      (this.props.selectedDrawingBBox &&
        !_.isEqual(
          this.props.selectedDrawingBBox,
          prevProps.selectedDrawingBBox,
        ))
    ) {
      const trackStart = this.props.selectedTrackBBox?.[0];
      const trackEnd = this.props.selectedTrackBBox?.[1];

      const drawingStart = this.props.selectedDrawingBBox?.[0];
      const drawingEnd = this.props.selectedDrawingBBox?.[1];

      const startX = _.min([trackStart?.[0], drawingStart?.[0]]);
      const startY = _.min([trackStart?.[1], drawingStart?.[1]]);
      const endX = _.max([trackEnd?.[0], drawingEnd?.[0]]);
      const endY = _.max([trackEnd?.[1], drawingEnd?.[1]]);
      if (
        startX === undefined ||
        startY === undefined ||
        endX === undefined ||
        endY === undefined
      ) {
        return;
      }
      this.camera?.fitBounds([startX, startY], [endX, endY], 70, 100);
    }
  }

  onAddMark = async (feature: GeoJSON.Feature) => {
    const z = this.map?.getZoom();
    console.log('on add mark', feature.geometry, z);
    if (!feature.properties?.id) {
      feature.properties = feature.properties || {};
      feature.properties.id = `${Date.now()}`;
    }
    const mark = featureToMark(feature as Feature<Point>);
    this.props.editMark(mark);
  };

  onMarkPress = ({features}: any) => {
    const feature = features[0];
    console.log('on press', feature.id);
    const selected = featureToMark(feature);
    if (feature.id === this.props.selectedMark?.id) {
      this.props.selectMark();
      this.props.editMark(selected);
    } else {
      this.props.selectMark(selected);
    }
    this.camera?.moveTo(feature.geometry.coordinates, 100);
  };

  onTripMarkPress = (event: OnPressEvent) => {
    console.log('on trip mark press', event.features);
    const selectedMark = featureToMark(event.features[0] as Feature<Point>);
    this.props.selectTripMark(selectedMark);
  };

  updateCenter = (e: Feature<Point, RegionPayload>) => {
    console.log('update center', e.properties);
    this.props.setCenter(e.geometry.coordinates);
    this.props.setZoom(e.properties.zoomLevel || 15);
  };
  onUserLocationUpdate = (location: MapboxGL.Location) => {
    console.log('update user location', location);
    if (!location?.coords || (!!location?.coords && !!location?.coords?.accuracy && location?.coords?.accuracy > 20)) {
      return;
    }
    if (this.props.tracking !== Tracking.none) {
      this.props.addPoint(location);
    }
    this.props.setLocation(location);
  };
  onBalloonClick = () => {
    this.props.editMark(this.props.selectedMark);
    this.props.selectMark();
  };
  onBalloonLongClick = () => {
    this.props.editMark(this.props.selectedMark);
    this.setState({selected: undefined});
  };
  onSetMap = (map: MapboxGL.MapView) => {
    this.map = map;
    this.props.setMap(map);
  };
  onSetCamera = (camera: MapboxGL.Camera) => {
    this.camera = camera;
    this.props.setCamera(camera);
  };
  onTouchEnd = () => {
    console.log('--onTouchEnd');
    this.setState({selected: undefined});
    const {tracking, restartTracking} = this.props;
    if (tracking !== Tracking.none) {
      restartTracking();
    }
  };
  onTripMarkBalloonClick = () => {
    this.props.editMark(this.props.selectedTripMark);
    this.props.selectTripMark();
  };
  onTripMarkBalloonLongClick = () => {
    this.props.editMark(this.props.selectedTripMark);
    this.props.selectTripMark();
  };
  render() {
    const {
      tracking,
      primaryMap,
      secondaryMap,
      opacity,
      center,
      zoom,
      showWikimapia,
      selectedMark,
      selectedTripMark,
      selectedTrip,
    } = this.props;

    let styleURL = primaryMap.url;
    let mapKey = `${primaryMap.url}-${secondaryMap?.url}`;
    console.log('render map', zoom, opacity);
    if (!styleURL) {
      //todo:  render invalid map setting view
      return null;
    }
    if (styleURL.startsWith('http://localhost')) {
      // this custom raster map
      styleURL = JSON.stringify({
        version: 8,
        sources: {
          'tile-source': {
            type: 'raster',
            tiles: [primaryMap.url],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'tile-source',
          },
        ],
      });
    }

    return (
      <MapboxGL.MapView
        style={styles.map}
        zoomEnabled
        compassEnabled
        styleURL={styleURL}
        compassViewMargins={{x: 0, y: 100}}
        onLongPress={this.onAddMark}
        onRegionDidChange={this.updateCenter}
        onTouchEnd={this.onTouchEnd}
        ref={this.onSetMap}
        key={mapKey}>
        <MapboxGL.Camera
          ref={this.onSetCamera}
          defaultSettings={{centerCoordinate: center, zoomLevel: zoom}}
          followZoomLevel={zoom}
          followUserMode="normal"
        />
        <MapboxGL.UserLocation
          visible={true}
          renderMode="native"
          onUpdate={this.onUserLocationUpdate}
          showsUserHeadingIndicator={tracking !== Tracking.none}
          minDisplacement={50}
        />
        {secondaryMap && (
          <MapboxGL.RasterSource
            {...rasterSourceProps}
            tileUrlTemplates={[secondaryMap.url]}>
            <MapboxGL.RasterLayer
              id="stamenWatercolorLayer"
              sourceID="stamenWatercolorSource"
              style={{rasterOpacity: opacity}}
            />
          </MapboxGL.RasterSource>
        )}
        {showWikimapia && <Wikimapia />}
        <MarksLocation onMarkPress={this.onMarkPress} />
        <ActiveTrack />
        <SelectedMark
          mark={selectedMark}
          unselect={this.onBalloonClick}
          openEdit={this.onBalloonLongClick}
        />

        <SelectedMark
          mark={selectedTripMark}
          trip={selectedTrip}
          unselect={this.onTripMarkBalloonClick}
          openEdit={this.onTripMarkBalloonLongClick}
        />
        <Drawing />
        <TripMapLayer camera={this.camera} onMarkPress={this.onTripMarkPress} />
      </MapboxGL.MapView>
    );
  }
}

export default connector(Map);
