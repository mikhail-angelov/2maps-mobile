import axios from 'axios';
import FormData from "form-data";
import { Alert, NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

export const HOST = 'https://2maps.xyz'
let HOST_LOCAL = 'http://localhost:5555'
// export const HOST = 'http://192.168.2.35:3003'

export const TERMS_OF_SERVICE_RU_URL = `${HOST}/2maps-tos-ru.html`
export const PRIVACY_POLICY_RU_URL = `${HOST}/2maps-pp-ru.html`
export const TERMS_OF_SERVICE_EN_URL = `${HOST}/2maps-tos-en.html`
export const PRIVACY_POLICY_EN_URL = `${HOST}/2maps-pp-en.html`
export const HELP_URL = `${HOST}/help.html`

export const CONTACT_EMAIL = "mikhail.angelov@gmail.com"

export const get = ({ url, token }: {
  url: string; token?: string
}) => {
  return axios.get(url, {
    headers: token ? {
      authorization: `bearer ${token}`,
    } : {},
  });
}

export const post = <T = any>({ url, token, data }: {
  url: string; token?: string; data: any
}) => {
  return axios.post<T>(url, data, {
    headers: token ? {
      authorization: `bearer ${token}`,
    } : {},
    maxContentLength: 1000,
  });
}
export const postLarge = async ({ url, token, data }: {
  url: string; token?: string; data: any
}) => {
  const formData = new FormData()
  const value = JSON.stringify(data) //new Blob([JSON.stringify(data)]);
  formData.append('value', value,)
  return await axios({
    url,
    method: 'post',
    data: formData,
    headers: token ? {
      authorization: `bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    } : {},
  });
}

export const getLocal = (url: string) => {
  return axios.get(`${getLocalhost()}/${url}`);
}

export const postLocal = ({ url, data }: {
  url: string; data: any
}) => {
  return axios.post(`${getLocalhost()}/${url}`, data);
}

const getStorageDirectoryPath = async() => {
  try {
    const storagePaths = await RNFS.getAllExternalFilesDirs()
    const primaryStoragePath = storagePaths.find(path => path.includes(RNFS.ExternalStorageDirectoryPath))
    return primaryStoragePath
  } catch(e) {
    console.log('get App Directory Path error', e)    
  }
}

export const getMapsDirectoryPath = async() => {
  const primaryStoragePath = await getStorageDirectoryPath()
  const destinationPath = primaryStoragePath && `${primaryStoragePath}/map/`
  return destinationPath
}

export const getTracksDirectoryPath = async() => {
  const primaryStoragePath = await getStorageDirectoryPath()
  const destinationPath = primaryStoragePath && `${primaryStoragePath}/tracks/`
  return destinationPath
}

export const getDrawingsDirectoryPath = async() => {
  const primaryStoragePath = await getStorageDirectoryPath()
  const destinationPath = primaryStoragePath && `${primaryStoragePath}/drawings/`
  return destinationPath
}

const setLocalhost = (port: number) => {
  HOST_LOCAL = `http://localhost:${port}`
  console.log('set localhost', HOST_LOCAL);
}

export const getLocalhost = () => {
  return HOST_LOCAL
}

export const getLocalhostPortNativeModule = async() => {
  try {
    const raw = await NativeModules.MapsModule.getLocalhostPort();
    const result: { port: number } = JSON.parse(raw)
    if (+result.port > 0) {
      setLocalhost(result.port)
    } else {
      Alert.alert("Can't start application, getting port error!");
    }
  } catch (e) {
    console.log('error', e);
    Alert.alert("Can't start application!");
  }
}