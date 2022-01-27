import {MapFile, MapInfo} from '../store/types';
import * as _ from 'lodash';
import {LocalMapFile} from '../actions/map-actions';

const validateNotEmptyStrings = (stringsList: string[]) => _.every(stringsList, value => typeof value === 'string' && value !== '')
const validateNotEmptyNumbers = (stringsList: number[]) => _.every(stringsList, value => typeof value === 'number' && value >= 0)

export const validateLocalMapList = (data: {[key: string]: LocalMapFile}): {[key: string]: LocalMapFile} => {
  let result: {[key: string]: LocalMapFile} = {};
  if (!_.isEmpty(data)) {
    result = Object.entries(data).reduce((acc, [key, item]) => {
      try {
        const {name, size, storage, path, maxzoom, minzoom} = item
        if(validateNotEmptyStrings([key, name, storage, path]) && validateNotEmptyNumbers([size, maxzoom, minzoom])) {
          return {...acc, [key]: item}
        }
      } catch (e) {
        console.log('validate local maps list error', e)
      }
      return acc
    }, {})
  }
  return result;
};

export const validateLoadedMapList = (data: MapFile[]): MapFile[] => {
  let result: MapFile[] = [];
  if (_.isArray(data) && !_.isEmpty(data)) {
    result = data.filter(item => item && validateNotEmptyStrings([item.id, item.name, item.url]) && validateNotEmptyNumbers([item.size]))
  }
  return result;
};

export const validateMapInfoList = (list: MapInfo[]): MapInfo[] => {
  return list.filter(item => item && validateNotEmptyStrings([item.name, item.storage, item.url]) && validateNotEmptyNumbers([item.size]))
}