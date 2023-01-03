
import { Position } from 'geojson';
import MapboxGL from "@rnmapbox/maps";

export type Storage = 'internal' | 'sd-card'
export interface MapInfo {
  name: string;
  url: string;
  size: number;
  type?: string;
  style?: string;
  storage: Storage;
}

export interface PrimaryMapInfo {
  name: string;
  url: string;
}

export interface MapFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface MapState {
  opacity: number;
  zoom: number;
  center: Position;
  styleUrl: MapboxGL.StyleURL;
  primaryMap: PrimaryMapInfo;
  secondaryMap?: MapInfo;
  list: MapInfo[];
  availableMaps: MapFile[];
  loading: boolean;
  downloading: boolean;
  downloadProgress: number;
  downloadId?: string;
  error?: string;
  relocating: boolean;
  relocateProgress: number;
  showWikimapia: boolean;
}

export interface StorageMemory {
  internalFree: string;
  internalTotal:string;
  sdFree?: string;
  sdTotal?: string;
}