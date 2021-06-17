import { MarksState } from "./marks";
import { TrackerState } from "./tracker";

export interface State {
  marks: MarksState;
  tracker: TrackerState;
}

export * from "./marks";
export * from "./tracker";
