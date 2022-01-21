import {NativeModules} from 'react-native';

const {mapsModule} = NativeModules;

interface mapsModuleInterface {
  cancelDownload(downloadId: string): Promise<string>;
  getStorageMemoryInfo(): Promise<string>;
  moveMapToSDCard(name: string): Promise<string>;
  moveMapToPhoneStorage(name: string): Promise<string>;
  getLocationPermission(onDone: (error: boolean) => void): void;
}

export default mapsModule as mapsModuleInterface;
