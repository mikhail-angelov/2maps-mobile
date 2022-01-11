import * as _ from 'lodash'
import distance from '@turf/distance';
import { Mark } from '../store/types';
import { Position } from 'geojson';

export const latLngToTileIndex = ({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) => {
  const n = Math.pow(2, zoom)
  const xtile = Math.floor(n * ((lng + 180) / 360))
  const latRad = lat * Math.PI / 180
  const ytile = Math.floor((1.0 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0 * n)
  return [xtile, ytile]
}

const normalizeBetweenTwoRanges = (val: number, minVal: number, maxVal: number, newMin: number, newMax: number): number => {
  let result
  if (maxVal === minVal) {
    result = (newMin + newMax) / 2
  } else {
    result = newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal)
  }
  return Math.round(result);
};

const removeAdjacentDuplicates = (coordinates: number[][]) => {
  return coordinates.reduce((acc: number[][], item) => (_.isEqual(_.last(acc), item) ? acc : [...acc, item]), [])
}

export const findMinMaxCoordinates = (coordinatesXY: number[][]) => {
  const maxX = _.maxBy(coordinatesXY, ([x, _]) => x)?.[0]
  const minX = _.minBy(coordinatesXY, ([x, _]) => x)?.[0]
  const maxY = _.maxBy(coordinatesXY, ([_, y]) => y)?.[1]
  const minY = _.minBy(coordinatesXY, ([_, y]) => y)?.[1]
  return {maxX, maxY, minX, minY}
}

export const convertToBoxSize = (coordinatesXY: number[][], boxX: number, boxY: number) => {
  const { maxX, maxY, minX, minY } = findMinMaxCoordinates(coordinatesXY)
  if (!maxX || !maxY || !minX || !minY) {
    return
  }
  const boxSizeCoordinates = _.map(coordinatesXY, ([x, y]) => ([normalizeBetweenTwoRanges(x, minX, maxX, 1, boxX), normalizeBetweenTwoRanges(y, minY, maxY, 1, boxY)]))
  return removeAdjacentDuplicates(boxSizeCoordinates)
}

export const markToDistance = (center: Position) => (mark: Mark) => {
  return `${distance(mark.geometry.coordinates, center, { units: 'kilometers' }).toFixed(2)} km`
}
