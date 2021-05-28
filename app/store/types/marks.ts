
import { Geometry } from 'geojson';

export interface Mark {
  id: string;
  name: string;
  geometry: Geometry;
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