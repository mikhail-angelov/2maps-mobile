
import { FeatureCollection, Polygon } from '@turf/helpers';


export interface WikiState {
  isRequestInProgress: boolean;
  collection?: FeatureCollection<Polygon>;
  error?: string;
}