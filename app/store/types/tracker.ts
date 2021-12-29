import MapboxGL from "@react-native-mapbox-gl/maps";
import { Position } from 'geojson';

export interface Track {
  id: string;
  start: number;
  end: number;
  name: string;
  track: Position[];
  thumbnail?: string;
}

export interface TrackerState {
  compass: any;
  location: MapboxGL.Location;
  tracks: Track[];
  tracking: boolean;
  activeTrack?: Track;
  selectedTrack?: Track;
  selectedTrackBBox?: number[][];
}