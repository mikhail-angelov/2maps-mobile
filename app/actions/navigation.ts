import {Position} from 'geojson';
import {NativeModules, Alert} from 'react-native';
import {Linking} from 'react-native';

export const navigateYandex = async (coordinates: Position) => {
  if (!coordinates) {
    return;
  }
  const clientId = process.env.YANDEX_NAV_CLIENT || '';
  //this line break is required for encryption
  let key = `
    ${process.env.YANDEX_NAV_KEY || ''}`;

  try {
    await NativeModules.MapsModule.openYandexNavigator(
      coordinates[0] + '',
      coordinates[1] + '',
      clientId,
      key,
    );
  } catch (e) {
    console.log('error', e);
    Alert.alert("Can't start navigation with yandex navigator");
  }
};

export const navigateOsm = async (coordinates: Position, name?: string) => {
  if (!coordinates) {
    return;
  }
  const url = `https://osmand.net/go?lat=${coordinates[1]}&lon=${
    coordinates[0]
  }&z=16&name=${name || ''}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.log('error', e);
    Alert.alert("Can't start navigation with OSMAnd navigator");
  }
};

export const navigateGoogle = async (coordinates: Position) => {
  if (!coordinates) {
    return;
  }
  const url = `https://maps.google.com/maps?daddr=${coordinates[1]},${coordinates[0]}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.log('error', e);
    Alert.alert("Can't start navigation with Google map");
  }
};
