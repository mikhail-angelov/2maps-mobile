import { Position } from 'geojson';

export interface Drawing {
  id: string;
  name: string;
  track: Position[];
}

export interface DrawingsState {
  drawings: Drawing[];
  activeDrawing: Position[][],
  activeDrawingChunk: Position[],
}