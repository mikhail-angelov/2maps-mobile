import { ActionTypeEnum } from "../actions";

export type Reducer<S, P> = (payload?: P) => (state: S) => S;
// https://gist.github.com/donnut/fd56232da58d25ceecf1#gistcomment-1617985
export interface CurriedReducer<S, P> {
  (t1: P | undefined): (t2: S) => S;
  (t1: P | undefined, t2: S): S;
}

export function createReducer<S, P = any>(
  initialState: S,
  reducers: Partial<Record<ActionTypeEnum, Reducer<S, P> | CurriedReducer<S, P>>>
) {
  return function(state: S = initialState, action: { type: ActionTypeEnum; payload?: P }) {
    const reducer = reducers[action.type];
    if (!reducer) return state;
    try {
      return reducer(action.payload)(state);
    } catch (e) {
      console.error("Reducer failed for action: ", action, e);
      return state;
    }
  };
}
