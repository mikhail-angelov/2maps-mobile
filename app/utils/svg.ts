import * as _ from 'lodash';

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
