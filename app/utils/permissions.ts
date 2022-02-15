import { PermissionsAndroid } from 'react-native';

export const requestLocationPermissions = async (): Promise<boolean> => {
  const ACCESS_FINE_LOCATION =
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const ACCESS_COARSE_LOCATION =
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
  const granted = await PermissionsAndroid.requestMultiple([
    ACCESS_COARSE_LOCATION,
    ACCESS_FINE_LOCATION,
  ]);
  return (
    !!granted &&
    granted[ACCESS_FINE_LOCATION] &&
    granted[ACCESS_COARSE_LOCATION] &&
    granted[ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
    granted[ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
  );
};

export const requestWriteFilePermissions = async (): Promise<boolean> => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED
};
