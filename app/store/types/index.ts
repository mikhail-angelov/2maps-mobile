import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";
import { AuthState } from "./auth";
import { UIState } from "./ui";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
  auth: AuthState;
  ui: UIState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
export * from "./auth";
export * from "./ui";
