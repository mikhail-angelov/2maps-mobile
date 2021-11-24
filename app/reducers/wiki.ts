import { createSelector } from "reselect";
import { FeatureCollection, Polygon } from '@turf/helpers';
import { WikiState, State } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: WikiState = Object.freeze({
  isRequestInProgress: false,
});

export default createReducer<WikiState>(initialState, {
  [ActionTypeEnum.WikiRequest]: () => (state: WikiState) => ({
    ...state,
    isRequestInProgress: true,
  }),
  [ActionTypeEnum.WikiSuccess]: (collection: FeatureCollection<Polygon>) => (state: WikiState) => ({
    ...state,
    isRequestInProgress: false,
    collection,
  }),
  [ActionTypeEnum.WikiFailure]: (error: string) => (state: WikiState) => ({
    ...state,
    isRequestInProgress: false,
    error,
  }),
});
const selectWikiState = (state: State) => state.wiki;
export const selectWikiCollection = createSelector(
  selectWikiState,
  (state) => state.collection
);
export const selectWikiInProgress = createSelector(
  selectWikiState,
  (state) => state.isRequestInProgress
);