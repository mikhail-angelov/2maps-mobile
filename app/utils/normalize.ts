import * as _ from 'lodash'

export const latLngToTileIndex = ({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) => {
    const n = Math.pow(2, zoom)
    const xtile = Math.floor(n * ((lng + 180) / 360))
    const latRad = lat * Math.PI / 180
    const ytile = Math.floor((1.0 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0 * n)
    return [xtile, ytile]
  }
  
  const normalizeBetweenTwoRanges = (val: number, minVal: number, maxVal: number, newMin: number, newMax: number): number => {
    return Math.round(newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal));
  };
  
  export const convertToBoxSize = (coordinatesXY: number[][], boxX: number, boxY: number) => {
    const maxX = _.maxBy(coordinatesXY, ([x,_])=>x)?.[0]
    const minX = _.minBy(coordinatesXY, ([x,_])=>x)?.[0]
    const maxY = _.maxBy(coordinatesXY, ([_,y])=>y)?.[1]
    const minY = _.minBy(coordinatesXY, ([_,y])=>y)?.[1]
    if (!maxX || !maxY || !minX || !minY) {
      return
    }
    return _.map(coordinatesXY, ([x, y])=>([normalizeBetweenTwoRanges(x, minX, maxX, 1, boxX ), normalizeBetweenTwoRanges(y, minY, maxY, 1, boxY )]))
  }