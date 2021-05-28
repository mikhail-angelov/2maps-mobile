import { createSelector } from "reselect";
import { MarksState, State } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: MarksState = Object.freeze({
  isRequestInProgress: false,
  marks: [],
});

export default createReducer<MarksState>(initialState, {
  [ActionTypeEnum.AddMark]: (mark) => (state) => ({
    ...state,
    marks: [...state.marks, mark],
  }),
  [ActionTypeEnum.RemoveMark]: (id) => (state) => ({
    ...state,
    marks: state.marks.filter(item => item.id !== id),
  }),
  [ActionTypeEnum.ImportPois]: (marks) => (state) => ({
    ...state,
    marks: [...state.marks, ...marks],
  }),
});
export const selectMarksState = (state: State) => state.marks;
export const selectMarks = createSelector(
  selectMarksState,
  (state) => state.marks
);