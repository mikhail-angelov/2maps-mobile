import { MarksState } from "./marks";
import { TrackerState } from "./tracker";
import { MapState } from "./map";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
  map: MapState;
}

export * from "./marks";
export * from "./tracker";
export * from "./map";
