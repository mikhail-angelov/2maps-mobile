
import { Point } from 'geojson';

export enum MarkType {
  'TRIP'
}

export interface Mark {
  id?: string;
  name: string;
  description: string;
  rate: number;
  timestamp: number;
  geometry: Point;
  deleted?: boolean;
  type?: MarkType
  selectedMarkIndex?: number;
}

export interface POI {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  point: {
    lat: number;
    lng: number
  }
}

export interface MarksState {
  isRequestInProgress: boolean;
  marks: Mark[];
  selectedMark?: Mark;
  editMark?: Mark;
  error?: string;
}