import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";
import { AuthState } from "./auth";
import { UIState } from "./ui";
import { DrawingsState } from "./drawings";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
  auth: AuthState;
  ui: UIState;
  drawings: DrawingsState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
export * from "./auth";
export * from "./ui";
export * from "./drawings";
