import React, { FC } from "react";
import MapboxGL, { FillLayerStyle, LineLayerStyle, SymbolLayerStyle } from "@rnmapbox/maps";

const tileUrl = 'https://2maps.xyz/wikimapia/{z}/{x}/{y}.mvt'

const WikiStyle: LineLayerStyle = {
    lineWidth: 2,
    lineOpacity: 0.6,
    lineJoin: 'round',
    lineCap: 'round',
    lineColor: '#ff0000'
}
const WikiStyleFill: FillLayerStyle = {
    fillColor: 'rgba(200, 100, 240, 0.2)',
    fillOutlineColor: 'rgba(200, 100, 240, 1)'
}
const WikiStyleLabel: SymbolLayerStyle = {
    textColor: 'red',
    textSize: 28,
    textField: ['format',
        ['get', 'name'],
        { 'font-scale': 0.5 }],
    textAnchor: 'bottom',
}

const Wikimapia: FC = () => {
    return (<MapboxGL.VectorSource
        id="wiki"
        tileUrlTemplates={[tileUrl]}
        minZoomLevel={11}
        maxZoomLevel={14}
    >
        <MapboxGL.LineLayer
            id="wiki2"
            sourceID="wiki"
            sourceLayerID="wikiLayer"
            style={WikiStyle}
        />
        <MapboxGL.FillLayer
            id="wiki3"
            sourceID="wiki"
            sourceLayerID="wikiLayer"
            style={WikiStyleFill}
        />
        <MapboxGL.SymbolLayer
            id="wiki-label"
            sourceID="wiki"
            sourceLayerID="wikiLayer"
            style={WikiStyleLabel}
        />
    </MapboxGL.VectorSource>);
}

export default Wikimapia
