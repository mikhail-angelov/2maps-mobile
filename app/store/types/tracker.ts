import MapboxGL from "@react-native-mapbox-gl/maps";
import { ThreeAxisMeasurement } from 'expo-sensors';
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
  compass: ThreeAxisMeasurement;
  location: MapboxGL.Location;
  tracks: Track[];
  tracking: boolean;
  activeTrack?: Track;
  selectedTrack?: Track;
}