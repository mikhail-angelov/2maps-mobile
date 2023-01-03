import { Mark } from "./marks";

export interface Trip {
  id: string;
  name: string;
  marks: Mark[];
  date?: number;
}
export interface TripsState {
  trips: Trip[];
  selectedTripBBox: number[][];
  activeTrip?: Trip;
  selectedMark?: Mark;
}