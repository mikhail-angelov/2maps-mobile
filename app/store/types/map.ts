
import { Position } from 'geojson';
import MapboxGL from "@react-native-mapbox-gl/maps";

export interface MapInfo {
  name: string;
  url: string;
  type?: string;
  style?: string;
}

export interface MapState {
  opacity: number;
  zoom: number;
  center: Position;
  styleUrl: MapboxGL.StyleURL;
  primaryMap: MapInfo;
  secondaryMap?: MapInfo;
  list: MapInfo[];
  availableMaps: string[];
  loading: boolean;
  error?: string;
}