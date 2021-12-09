import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { LineLayerStyle, SymbolLayerStyle } from "@react-native-mapbox-gl/maps";
import { selectWikiCollection } from '../reducers/wiki'

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
    wikiCollection: selectWikiCollection(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> 

const Wikimapia: FC<Props> = ({ wikiCollection }) => {
    if (!wikiCollection) {
        return null
    }

    return (<MapboxGL.ShapeSource
        id="wikiSource"
        shape={wikiCollection}>
        <MapboxGL.LineLayer id='w' style={WikiStyle} minZoomLevel={1} />
        <MapboxGL.SymbolLayer id='wl' style={WikiStyleLabel} minZoomLevel={1} />
    </MapboxGL.ShapeSource>);
}

export default connector(Wikimapia)
