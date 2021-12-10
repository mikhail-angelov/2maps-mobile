import { createSelector } from "reselect";
import { MarksState, State, Mark } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";
import * as _ from 'lodash'

const initialState: MarksState = Object.freeze({
  isRequestInProgress: false,
  marks: [],
});

export default createReducer<MarksState>(initialState, {
  [ActionTypeEnum.EditMark]: (editMark?: Mark) => (state: MarksState) => ({
    ...state,
    editMark,
  }),
  [ActionTypeEnum.SaveMark]: (mark: Mark) => (state: MarksState) => ({
    ...state,
    editMark: undefined,
    marks: _.unionBy([mark], state.marks, 'id'),
  }),
  [ActionTypeEnum.AddMark]: (mark: Mark) => (state: MarksState) => ({
    ...state,
    marks: [...state.marks, mark],
  }),
  [ActionTypeEnum.UpdateMark]: (mark:Mark) => (state: MarksState) => ({
    ...state,
    marks: state.marks.map(item=>item.id===mark.id?mark:item),
  }),
  [ActionTypeEnum.RemoveMark]: (id:string) => (state: MarksState) => ({
    ...state,
    marks: state.marks.map((item: Mark) => item.id === id?{...item, deleted: true,timestamp:Date.now() }:item),
    editMark: undefined,
  }),
  [ActionTypeEnum.RemoveMarkCompletely]: (id:string) => (state: MarksState) => ({
    ...state,
    marks: state.marks.filter((item: Mark) => item.id !== id),
    editMark: undefined,
  }),
  [ActionTypeEnum.RemoveAllMarks]: () => (state: MarksState) => ({
    ...state,
    marks: [],
  }),
  [ActionTypeEnum.ImportPois]: (marks:Mark[]) => (state: MarksState) => ({
    ...state,
    marks: [...state.marks, ...marks],
  }),
});
export const selectMarksState = (state: State) => state.marks;
export const selectMarks = createSelector(
  selectMarksState,
  (state) => state.marks
);
export const selectEditedMark = createSelector(
  selectMarksState,
  (state) => state.editMark
);