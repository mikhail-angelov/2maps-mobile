import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";
import { AuthState } from "./auth";
import { UIState } from "./ui";
import { TripsState } from "./trips";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
  auth: AuthState;
  ui: UIState;
  trips: TripsState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
export * from "./auth";
export * from "./ui";
export * from "./trips"
