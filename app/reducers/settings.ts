import { createSelector } from "reselect";
import { SettingsState, State } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: SettingsState = Object.freeze({
  showOSD: false,
  showPaintButton: true,
  showWikiButton: true,
  showTrackButton: true,
});

export default createReducer<SettingsState>(initialState, {
  [ActionTypeEnum.SetShowOSD]: (showOSD: boolean) => (state: SettingsState) => ({
    ...state,
    showOSD,
  }),
  [ActionTypeEnum.SetShowPaintButton]: (showPaintButton: boolean) => (state: SettingsState) => ({
    ...state,
    showPaintButton,
  }),
  [ActionTypeEnum.SetShowWikiButton]: (showWikiButton: boolean) => (state: SettingsState) => ({
    ...state,
    showWikiButton,
  }),
  [ActionTypeEnum.SetShowTrackButton]: (showTrackButton: boolean) => (state: SettingsState) => ({
    ...state,
    showTrackButton,
  }),

});
export const selectSettingsState = (state: State) => state.settings;
export const selectShowOSD = createSelector(
  selectSettingsState,
  (state) => state.showOSD
);
export const selectShowPaintButton = createSelector(
  selectSettingsState,
  (state) => state.showPaintButton
);
export const selectShowWikiButton = createSelector(
  selectSettingsState,
  (state) => state.showWikiButton
);
export const selectShowTrackButton = createSelector(
  selectSettingsState,
  (state) => state.showTrackButton
);
