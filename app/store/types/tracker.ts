import {LocationObject} from 'expo-location';
import { ThreeAxisMeasurement } from 'expo-sensors';
import { Position } from 'geojson';

export interface Track {
  id: string;
  start: number;
  end: number;
  name: string;
  track: Position[];
}

export interface TrackerState {
  compass: ThreeAxisMeasurement;
  location: LocationObject;
  tracks: Track[];
  activeTrack?: Track;
  selectedTrack?: Track;
}