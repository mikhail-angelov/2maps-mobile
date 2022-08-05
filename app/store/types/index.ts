import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";
import { AuthState } from "./auth";
import { UIState } from "./ui";
import { DrawingsState } from "./drawings";
import { TripsState } from "./trips";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
  auth: AuthState;
  ui: UIState;
  drawings: DrawingsState;
  trips: TripsState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
export * from "./auth";
export * from "./ui";
export * from "./drawings";
export * from "./trips"
