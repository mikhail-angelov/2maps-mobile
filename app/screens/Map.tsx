import React, { Component } from "react";
import Config from 'react-native-config'
import { connect, ConnectedProps } from "react-redux";
import { Mark, State } from '../store/types'
import { selectMarks } from '../reducers/marks'
import { addMarkAction, removeMarkAction } from '../actions/marks-actions'
import { View, Text } from "react-native";
import { Slider } from 'react-native-elements';
import styled from 'styled-components/native'
import MapboxGL from "@react-native-mapbox-gl/maps";
import { featureCollection, feature } from '@turf/helpers';
import EditMark from '../components/EditMark'
import RemoveMark from '../components/RemoveMark'

MapboxGL.setAccessToken(Config.MAPBOX_PUB_KEY);

const CENTER_COORD = [44.320691, 56.090846];
const MAPBOX_VECTOR_TILE_SIZE = 512;


const photoIconHalo = {
    circleRadius: 12,
    circleColor: 'blue',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
}

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
`
const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
});
const mapDispatchToProps = {
    addMark: addMarkAction,
    removeMark: removeMarkAction
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

class Map extends Component<Props> {
    private _map: any

    state: {
        opacity: number;
        showEdit: boolean;
        showRemove: boolean;
        mark?: Mark;
    } = {
            opacity: 0.5,
            showEdit: false,
            showRemove: false,
        };

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
    }
    onOpacityChange = (value: number) => {
        this.setState({ opacity: value });
    }
    onAddMark = (e: any) => {
        console.log('on new', e.geometry)
        this.setState({ showEdit: true, mark: { id: '', name: '', geometry: e.geometry } })
    }
    onMarkPress = ({ features }: any) => {
        const feature = features[0]
        console.log('on press', feature.id, feature)
        const mark = this.props.marks.find(item => item.id === feature.id)
        this.setState({ showEdit: true, mark })
        this._map.moveTo(feature.geometry.coordinates, 500)
    }
    onSave = (mark: Mark) => {
        if (!mark.id) {
            mark.id = `${Date.now()}`
        }
        this.setState({ showEdit: false, mark })
        this.props.addMark(mark)
    }
    onShowRemove = () => {
        this.setState({ showEdit: false, showRemove: true })
    }
    onRemove = () => {
        if (!this.state.mark) {
            return
        }
        this.props.removeMark(this.state.mark.id)
        this.setState({ showRemove: false, mark: undefined })
    }
    onCancel = () => {
        this.setState({ showEdit: false, showRemove: false })
    }

    render() {
        const { marks } = this.props
        const { mark, showEdit, showRemove } = this.state
        const features = marks.map((mark) => {
            const aFeature = feature(mark.geometry);
            aFeature.id = mark.id;
            return aFeature
        })
        const fCollection = featureCollection(features)

        return (
            <Container>
                <StyledMap zoomEnabled compassEnabled onLongPress={this.onAddMark}>
                    <MapboxGL.Camera
                        ref={(c) => (this._map = c)} 
                        zoomLevel={12}
                        centerCoordinate={CENTER_COORD}
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
                        shape={fCollection}>
                        <MapboxGL.CircleLayer id='marks' style={photoIconHalo} minZoomLevel={1} />
                    </MapboxGL.ShapeSource>
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
                {showEdit && mark && <EditMark mark={mark} save={this.onSave} cancel={this.onCancel} remove={mark.id ? this.onShowRemove : undefined} />}
                {showRemove && mark && <RemoveMark mark={mark} remove={this.onRemove} cancel={this.onCancel} />}
            </Container>
        );
    }
}

export default connector(Map)