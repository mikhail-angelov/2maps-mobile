
import { Geometry } from 'geojson';

export interface Mark {
  id: string;
  name: string;
  geometry: Geometry;
}

export interface MarksState {
  isRequestInProgress: boolean;
  marks: Mark[];
  error?: string;
}