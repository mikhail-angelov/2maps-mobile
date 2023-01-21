import { ActionTypeEnum } from ".";

export const showOSDAction = (value: boolean) => {
  return { type: ActionTypeEnum.SetShowOSD, payload: value }
};
export const showPaintButtonAction = (value: boolean) => {
  return { type: ActionTypeEnum.SetShowPaintButton, payload: value }
};
export const showWikiButtonAction = (value: boolean) => {
  return { type: ActionTypeEnum.SetShowWikiButton, payload: value }
};
export const showTrackButtonAction = (value: boolean) => {
  return { type: ActionTypeEnum.SetShowTrackButton, payload: value }
};
