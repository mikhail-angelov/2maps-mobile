import { ActionTypeEnum } from ".";
import { Position } from 'geojson';

export const setCenterAction = (center: Position) => {
  return { type: ActionTypeEnum.SetCenter, payload: center }
};
export const setOpacityAction = (opacity: number) => {
  return { type: ActionTypeEnum.SetOpacity, payload: opacity }
};
export const setZoomAction = (zoom: number) => {
  return { type: ActionTypeEnum.SetZoom, payload: zoom }
};