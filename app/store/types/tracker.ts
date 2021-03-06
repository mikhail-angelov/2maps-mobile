import MapboxGL from "@react-native-mapbox-gl/maps";
import { Position } from 'geojson';

export interface Track {
  id: string;
  start: number;
  end: number;
  name: string;
  track: Position[];
  prevPosition: Position;
  thumbnail?: string;
  distance?: string;
}

export enum Tracking {
  track='track',
  trackAndRecord='trackAndRecord',
  none='none',
}

export interface TrackerState {
  compass: any;
  location: MapboxGL.Location;
  tracks: Track[];
  tracking: boolean;
  trackingAndRecording: boolean;
  activeTrack?: Track;
  selectedTrack?: Track;
  selectedTrackBBox?: number[][];
}