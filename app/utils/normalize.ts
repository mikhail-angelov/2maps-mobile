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

export const findMinMaxCoordinates = (multipleCoordinatesXY: number[][][]) => {
  const result = { maxX: 0, maxY: 0, minX: 0, minY: 0 }
  multipleCoordinatesXY.forEach((coordsXY: number[][], indexJ) => {
    coordsXY.forEach(([x, y]: number[], indexK) => {
      if (indexJ === 0 && indexK === 0) {
        result.maxX = x
        result.minX = x
        result.maxY = y
        result.minY = y
        return
      }
      result.maxX = Math.max(x, result.maxX)
      result.minX = Math.min(x, result.minX)
      result.maxY = Math.max(y, result.maxY)
      result.minY = Math.min(y, result.minY)
    })
  })
  return result
}

export const convertToBoxSize = (coordinatesXY: number[][][], boxX: number, boxY: number): number[][][] => {
  const { maxX, maxY, minX, minY } = findMinMaxCoordinates(coordinatesXY)
  return coordinatesXY.map((coords: number[][]) => {
    const boxSizeCoordinates = _.map(coords, ([x, y]) => ([normalizeBetweenTwoRanges(x, minX, maxX, 1, boxX), normalizeBetweenTwoRanges(y, minY, maxY, 1, boxY)]))
    return removeAdjacentDuplicates(boxSizeCoordinates)
  })
}

export const markToDistance = (center: Position) => (mark: Mark) => {
  return `${distance(mark.geometry.coordinates, center, { units: 'kilometers' }).toFixed(2)} km`
}
