
import { Point } from 'geojson';

export interface Mark {
  id: string | number;
  name: string;
  geometry: Point;
}

export interface POI {
  id: string;
  name: string;
  point: {
    lat: number;
    lng: number
  }
}

export interface MarksState {
  isRequestInProgress: boolean;
  marks: Mark[];
  error?: string;
}