import {Track} from '../store/types';
import {Position} from 'geojson';
import dayjs from 'dayjs';
import _ from 'lodash';

const XMLParser = require('react-xml-parser');

const addAltitude = (coordinates: Position) => [...coordinates, 0];

export const createKml = (track: Track): {name: string; data: string} => {
  const name =
    track.name || `track ${dayjs(track.start).format('YY.MM.DD HH-mm')}`;
  const coordinates = track.track.map(addAltitude).join(' ');
  const timeStart = dayjs(track.start).toISOString() || ''
  const timeEnd = dayjs(track.end).toISOString() || ''
  const data = `<?xml version="1.0" encoding="UTF-8"?>\
    <kml xmlns="http://www.opengis.net/kml/2.2">\
    <Document>\
    <name>${name}.kml</name>\
    <description>mapnn.bconf.com</description>\
    <open>1</open>\
    <Placemark>\
    <name>${name}.kml</name>\
    <TimeSpan>\
    <begin>${timeStart}</begin>\
    <end>${timeEnd}</end>\
    </TimeSpan>\
    <LineString>\
    <tessellate>1</tessellate>\
    <coordinates>${coordinates}</coordinates>\
    </LineString>\
    </Placemark>\
    </Document>\
    </kml>`;
  return {name, data};
};

const parseCoordinates = (data: string): Position[] => {
  const pointsArray = data.split(' ');
  try {
    return pointsArray.map(item =>
      item
        .split(',')
        .slice(0, 2)
        .map((value: string) => parseFloat(value)),
    );
  } catch (e) {
    return [];
  }
};

export const parseKml = (
  data: string,
): {name: string; coordinates: Position[]} => {
  const kml = new XMLParser().parseFromString(data);
  const placemarkTag = kml.getElementsByTagName('Placemark');
  const name: string = _.get(
    placemarkTag,
    '[0].children.[0].value',
    `track ${dayjs().format('YY.MM.DD HH-mm')}`,
  );

  const coordinatesTag: string = kml.getElementsByTagName('coordinates');
  const coordinates = parseCoordinates(_.get(coordinatesTag, '[0].value', ''));

  const timeSpanTag: string = kml.getElementsByTagName('TimeSpan');
  return {name, coordinates};
};
