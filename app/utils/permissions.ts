import {PermissionsAndroid} from 'react-native';
import {t} from 'i18next';

export const requestLocationPermissions = async (): Promise<boolean> => {
  const {ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION} =
    PermissionsAndroid.PERMISSIONS;
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
export const requestBackgroundLocationPermissions =
  async (): Promise<boolean> => {
    const {ACCESS_BACKGROUND_LOCATION} = PermissionsAndroid.PERMISSIONS;
    const granted = await PermissionsAndroid.request(
      ACCESS_BACKGROUND_LOCATION,
      {
        title: t('Background Location Permission'),
        message: t(
          '2Maps need access to your location, so you can get live quality updates.',
        ),
        buttonNeutral: t('Ask Me Later') as string | undefined,
        buttonNegative: t('Cancel') as string | undefined,
        buttonPositive: t('OK'),
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

export const requestWriteFilePermissions = async (): Promise<boolean> => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: t('Files Permission'),
      message: t('2Maps need access to your SD card, to save data.'),
      buttonNeutral: t('Ask Me Later') as string | undefined,
      buttonNegative: t('Cancel') as string | undefined,
      buttonPositive: t('OK'),
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};
