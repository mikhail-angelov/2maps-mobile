import {MapFile, MapInfo, Storage} from '../store/types';
import * as _ from 'lodash';

const validateStorage = (storage: unknown): Storage => {
  if (String(storage) === 'internal' || String(storage) === 'sd-card') {
    return String(storage) as Storage;
  }
  throw new Error();
};

export const validateLocalMapList = (
  data: {
    name: any;
    url: string;
    size: any;
    storage: any;
  }[],
): MapInfo[] => {
  let result: MapInfo[] = [];
  if (!_.isEmpty(data)) {
    data.forEach(item => {
      try {
        const newMap: MapInfo = {
          name: String(item.name),
          storage: validateStorage(item.storage),
          size: item.size || 0,
          url: item.url,
        };
        result = [...result, newMap];
      } catch (e) {
        console.log('validation local map list error', e);
      }
    });
  }
  return result;
};

export const validateLoadedMapList = (data: MapFile[]): MapFile[] => {
  let result: MapFile[] = [];
  if (_.isArray(data) && !_.isEmpty(data)) {
    data.forEach(item => {
      try {
        const newMap = {
          id: item.id,
          name: item.name,
          url: item.url,
          size: item.size || 0,
        };
        result = [...result, newMap];
      } catch (e) {
        console.log('loaded map list validation error', e);
      }
    });
  }
  return result;
};
