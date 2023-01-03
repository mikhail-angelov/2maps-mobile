import { ActionTypeEnum, AppThunk } from '.';
import * as _ from 'lodash';
import { Position } from 'geojson';
import {
  selectActiveDrawing,
  selectActiveDrawingChunk,
  selectAllDrawings,
} from '../reducers/drawings';
import { Drawing, ModalActionType, State } from '../store/types';
import { v4 as uuid } from '@lukeed/uuid';
import RNFS from 'react-native-fs';
import { showModalAction } from './ui-actions';
import { ThunkDispatch } from 'redux-thunk';
import { getDrawingsDirectoryPath } from './api';
import i18next from 'i18next';
import { convertToBoxSize, findMinMaxCoordinates, latLngToTileIndex } from '../utils/normalize';
import { makeSvg } from '../utils/svg';
import MapboxGL from '@rnmapbox/maps';
import Share from 'react-native-share';

const DRAWINGS_EXT = '.drawing';
const SVG_EXT = '.svg';

export const addPointForDrawingChunkAction =
  (locationX: number, locationY: number): AppThunk =>
    async (dispatch, getState) => {
      const x = Math.round(locationX);
      const y = Math.round(locationY);

      const activeDrawingChunk = selectActiveDrawingChunk(getState());
      if (!activeDrawingChunk) {
        return;
      }
      const lastRecord = _.last(activeDrawingChunk);
      if (!_.isEqual(lastRecord, [x, y])) {
        dispatch({
          type: ActionTypeEnum.SetDrawingChunk,
          payload: [...activeDrawingChunk, [x, y]],
        });
      }
    };

export const startDrawNewChunkAction =
  (): AppThunk => async (dispatch, getState) => {
    const activeDrawingChunk = selectActiveDrawingChunk(getState());
    if (!activeDrawingChunk) {
      dispatch({ type: ActionTypeEnum.SetDrawingChunk, payload: [] });
    }
  };

export const finishDrawNewChunkAction =
  (map: MapboxGL.MapView): AppThunk =>
    async (dispatch, getState) => {
      const activeDrawingChunk = selectActiveDrawingChunk(getState());
      if (!activeDrawingChunk) {
        return;
      }
      try {
        const getCoordPromises = activeDrawingChunk.map(viewPosition =>
          map.getCoordinateFromView(viewPosition),
        );
        const coords = await Promise.all(getCoordPromises);
        const activeDrawing = selectActiveDrawing(getState());
        dispatch({
          type: ActionTypeEnum.SetActiveDrawing,
          payload: [...activeDrawing, coords],
        });
        dispatch({ type: ActionTypeEnum.SetDrawingChunk, payload: undefined });
      } catch (e) {
        console.error(e)
      }
    };

export const removeLastDrawingChunkAction =
  (): AppThunk => async (dispatch, getState) => {
    const activeDrawing = selectActiveDrawing(getState());
    dispatch({
      type: ActionTypeEnum.SetActiveDrawing,
      payload: activeDrawing.slice(0, -1),
    });
  };
export const saveActualDrawingAction =
  (): AppThunk => async (dispatch, getState) => {
    const activeDrawing = selectActiveDrawing(getState());
    if (activeDrawing.length === 0) {
      return;
    }
    const newDrawing: Drawing = {
      id: uuid(),
      date: Date.now(),
      name: '',
      drawing: activeDrawing,
    };
    dispatch(
      showModalAction({
        title: `${i18next.t('Save drawing')}`,
        text: `${i18next.t('Enter drawing name:')}`,
        actions: [
          { type: ModalActionType.input },
          {
            text: 'Ok',
            type: ModalActionType.cancel,
            handler: async text => {
              newDrawing.name = text || '';
              dispatch({ type: ActionTypeEnum.SaveDrawing, payload: newDrawing });
              await writeDrawingToFile(newDrawing, dispatch);
            },
          },
        ],
      }),
    );
  };

export const setActualDrawingAction =
  (id: string): AppThunk =>
    async (dispatch, getState) => {
      const drawings = selectAllDrawings(getState());
      const result = drawings.find(item => item.id === id);
      if (!result || !result.drawing) {
        dispatch({
          type: ActionTypeEnum.SetActiveDrawing,
          payload: [],
        })
        dispatch({
          type: ActionTypeEnum.SetSelectedDrawingBBox,
          payload: undefined,
        });
        return
      }
      dispatch({
        type: ActionTypeEnum.SetActiveDrawing,
        payload: result.drawing,
      })
      let { maxX, maxY, minX, minY } = findMinMaxCoordinates(result.drawing)
      if (Math.abs(maxX - minX) < 0.005 && Math.abs(maxY - minY) < 0.006) {
        minX -= 0.0025;
        maxX += 0.0025;
        minY -= 0.003;
        maxY += 0.003;
      }
      const start = [minX, minY];
      const end = [maxX, maxY];
      dispatch({
        type: ActionTypeEnum.SetSelectedDrawingBBox,
        payload: [start, end],
      });
    };

export const removeDrawingAction =
  (id: string): AppThunk =>
    async (dispatch, getState) => {
      const drawings = selectAllDrawings(getState());
      const result = drawings.filter(item => item.id !== id);
      dispatch({ type: ActionTypeEnum.SetDrawings, payload: result });
    };

const writeDrawingToFile = async (
  activeDrawing: Drawing,
  dispatch: ThunkDispatch<State, unknown, any>,
) => {
  const path = await getDrawingsDirectoryPath();
  if (!path) {
    return Promise.reject('can not find app directory path');
  }
  try {
    await RNFS.readDir(path);
  } catch (e) {
    if (_.get(e, 'message') === 'Folder does not exist') {
      await RNFS.mkdir(path);
    } else {
      const title = i18next.t('Can not save drawing!');
      const text = `${i18next.t('Directory unreachable')}: ${path}; ${_.get(
        e,
        'message',
        '',
      )}`;
      dispatch(
        showModalAction({
          title,
          text,
          actions: [{ text: 'Ok', type: ModalActionType.cancel }],
        }),
      );
      throw e;
    }
  }
  const filepath = `${path}/${activeDrawing.id}`;
  await RNFS.writeFile(
    decodeURI(filepath + DRAWINGS_EXT),
    JSON.stringify(activeDrawing),
    'utf8',
  );
  const svgThumbnail = renderDrawingIcon(activeDrawing.drawing) || '';
  if (svgThumbnail) {
    await RNFS.writeFile(decodeURI(filepath + SVG_EXT), svgThumbnail, 'utf8');
  }
};

const renderDrawingIcon = (drawing: Position[][]) => {
  if (!drawing || _.isEmpty(drawing)) return;
  const boxX = 50;
  const boxY = 50;
  const chunksSvgList = drawing.map(drawingChunk => {
    const coordinatesXY = drawingChunk.map(point =>
      latLngToTileIndex({ lng: point[0], lat: point[1], zoom: 100 }),
    );
    return coordinatesXY;
  });
  const boxCoordinates = convertToBoxSize(
    chunksSvgList,
    boxX - 1,
    boxY - 1,
  );
  if (!boxCoordinates || _.isEmpty(boxCoordinates)) {
    return;
  }
  const resultSvg = makeSvg(boxCoordinates, boxX, boxY);
  return resultSvg;
};

export const getDrawingThumbnailsFromSvgFilesAction =
  (): AppThunk => async (dispatch, getState) => {
    const path = await getDrawingsDirectoryPath();
    if (!path) {
      return;
    }
    const drawings = selectAllDrawings(getState());
    const drawingsWithThumbnailsPromises = drawings.map(
      item =>
        new Promise(async resolve => {
          try {
            const svgPath = `${path}/${item.id}${SVG_EXT}`;
            const svgFileStat = await RNFS.stat(svgPath);
            if (svgFileStat.isFile()) {
              item.thumbnail = await RNFS.readFile(svgFileStat.path, 'utf8');
            }
            resolve(item);
          } catch (e) {
            resolve('');
          }
        }),
    );

    const drawingsWithThumbnails = await Promise.all(
      drawingsWithThumbnailsPromises,
    );
    dispatch({
      type: ActionTypeEnum.SetDrawings,
      payload: drawingsWithThumbnails,
    });
  };
export const removeDrawingThumbnailFromStateAction =
  (): AppThunk => async (dispatch, getState) => {
    const drawings = selectAllDrawings(getState());
    const resultWithoutThumbnail = _.map(drawings, item =>
      _.omit(item, 'thumbnail'),
    );
    dispatch({
      type: ActionTypeEnum.SetDrawings,
      payload: resultWithoutThumbnail,
    });
  };

export const shareActualDrawing = async (map: MapboxGL.MapView) => {
  let imagePngPath
  try {
    imagePngPath = await map.takeSnap(true)
    if (!imagePngPath) {
      throw "No image path"
    }
    await Share.open({
      message: i18next.t('My Drawing from 2Maps App'),
      url: imagePngPath,
    });
  } catch (e) {
    console.error("share error", e)
    throw e
  } finally {
    if (imagePngPath) {
      await RNFS.unlink(imagePngPath)
    }
  }
}