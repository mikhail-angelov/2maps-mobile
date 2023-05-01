import MapboxGL from "@rnmapbox/maps";
import { Position } from 'geojson';

export interface Track {
  id: string;
  start: number;
  end: number;
  name: string;
  track: Position[];
  thumbnail?: string;
  distance?: string;
}

export interface TrackerState {
  compass: any;
  location: MapboxGL.Location;
  tracks: Track[];
  tracking: boolean;
  recording: boolean;
  activeTrack?: Track;
  selectedTrack?: Track;
  selectedTrackBBox?: number[][];
}