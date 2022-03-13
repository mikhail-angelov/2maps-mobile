import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";
import { WikiState } from "./wiki";
import { AuthState } from "./auth";
import { UIState } from "./ui";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
  wiki: WikiState;
  auth: AuthState;
  ui: UIState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
export * from "./wiki";
export * from "./auth";
export * from "./ui";
