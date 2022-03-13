import { createSelector } from "reselect";
import { UIState, State, ModalParams } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: UIState = Object.freeze({});

export default createReducer<UIState>(initialState, {
  [ActionTypeEnum.UIAddModal]: (modal: ModalParams) => (state: UIState) => ({
    ...state,
    modal,
  }),
  [ActionTypeEnum.UIRemoveModal]: () => (state: UIState) => ({
    ...state,
    modal: undefined,
  }),
});
export const selectUIState = (state: State) => state.ui;
export const selectModal = createSelector(
  selectUIState,
  (state) => state.modal
);
