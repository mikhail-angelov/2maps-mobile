import { createSelector } from "reselect";
import { UIState, State, ModalParams } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: UIState = Object.freeze({
  awake: true,
});

export default createReducer<UIState>(initialState, {
  [ActionTypeEnum.UIAddModal]: (modal: ModalParams) => (state: UIState) => ({
    ...state,
    modal,
  }),
  [ActionTypeEnum.UIRemoveModal]: () => (state: UIState) => ({
    ...state,
    modal: undefined,
  }),
  [ActionTypeEnum.SetAwake]: (awake: boolean) => (state: UIState) => ({
    ...state,
    awake,
  }),
});
export const selectUIState = (state: State) => state.ui;
export const selectModal = createSelector(
  selectUIState,
  (state) => state.modal
);
export const selectAwake = createSelector(
  selectUIState,
  (state) => state.awake
);
