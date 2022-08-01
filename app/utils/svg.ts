import * as _ from 'lodash';
import { Position } from 'geojson';

const areCoordinatesTheSame = (coordinates: number[][]) => {
  const collection = _.groupBy(coordinates);
  return Object.keys(collection).length === 1;
};

export const makeSvg = (
  coordinates: number[][],
  height: number,
  width: number,
): string => {
  if (!_.isArray(coordinates)) {
    return '';
  }
  if (areCoordinatesTheSame(coordinates)) {
    return `
    <svg height="${height}" width="${width}">
    <circle cx="${Math.round(width / 2)}" cy="${Math.round(
      height / 2,
    )}" r="5" stroke="black" stroke-width="1" fill="red" />
    </svg>`;
  }
  const points = coordinates.join(' ');
  return `
    <svg height="${height}" width="${width}">
    <polyline points="${points}"
    style="fill:none;stroke:red;stroke-width:2" />
    </svg>`;
};

export const makeSvgMultiTracks = (
  tracks: (number[][] | undefined)[],
  height: number,
  width: number,
): string => {
  if (!_.isArray(tracks)) {
    return '';
  }
  const polylines = tracks.map(track => {
    if (!track) return ''
    const points = track.join(' ');
    return `
    <polyline points="${points}"
    style="fill:none;stroke:red;stroke-width:2" />`
  }).join('')
  return `<svg height="${height}" width="${width}">${polylines}</svg>`;
};