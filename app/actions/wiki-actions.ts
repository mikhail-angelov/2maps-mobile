import { ActionTypeEnum, AppThunk } from ".";
import { Alert, NativeModules } from "react-native";
import axios from "axios";
import { featureCollection, FeatureCollection, Position, polygon } from '@turf/helpers';

const WIKIMAPIA_KEY = 'C4EED4C7-517639DB-5D137D81-8CBB7CBC-14F92F02-2BC3A913-25C348EB-2B5CFD5B'

const toFeature = (data: any) => {
  if (!data?.polygon || data.polygon.length < 3) {
    return null
  }
  const coordinates = data.polygon.map((item: any) => [item.x, item.y])
  return {
    type: 'Feature',
    id: data.id,
    name: data.name,
    properties: {
      title: data.name,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  }
}
export const loadWikiAction = (bounds: Position[]): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.WikiRequest });
      let payload: any[] = []
      // const response = await axios.get(`http://localhost:5555/map/mende/7/636/316.jpg`);
      const response = await NativeModules.MapsModule.getMapsEvent()
      console.log('--', response)
      // const response = await axios.get(`http://api.wikimapia.org/?function=box&bbox=${bounds[1][0]},${bounds[1][1]},${bounds[0][0]},${bounds[0][1]}&key=${WIKIMAPIA_KEY}&count=100&format=json`);
      // if(!response.data?.folder){
      //   dispatch({
      //     type: ActionTypeEnum.WikiFailure,
      //     payload: `wiki ${JSON.stringify(response.data)}`,
      //   });
      //   return
      // }
      // const features = response.data.folder.map(toFeature)
      // const payload = featureCollection(features)
      dispatch({
        type: ActionTypeEnum.WikiFailure,
        payload:'',
      });
    } catch (e) {
      console.log("wiki error", e);
      dispatch({
        type: ActionTypeEnum.WikiFailure,
        payload: "wiki failure",
      });
    }
  };
};
