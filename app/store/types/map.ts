
import { Position } from 'geojson';

export interface MapState {
  opacity: number;
  zoom: number;
  center: Position;
}