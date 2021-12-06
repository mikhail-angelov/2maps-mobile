import { Track } from "../store/types"
import { Position } from 'geojson';
import dayjs from 'dayjs'

const addAltitude = (coordinates: Position) => ([...coordinates, 0])

export const compileKml = (track: Track): {name: string, data: string} => {
    const name = track.name || `track ${dayjs(track.start).format('YY.MM.DD HH-mm')}`
    const coordinates = track.track.map(addAltitude).join(' ')
    const data = `<?xml version="1.0" encoding="UTF-8"?>\
    <kml xmlns="http://www.opengis.net/kml/2.2">\
    <Document>\
    <name>${name}.kml</name>\
    <description>mapnn.bconf.com</description>\
    <open>1</open>\
    <Placemark>\
    <name>${name}.kml</name>\
    <LineString>\
    <tessellate>1</tessellate>\
    <coordinates>${coordinates}</coordinates>\
    </LineString>\
    </Placemark>\
    </Document>\
    </kml>`
    return {name, data}
}