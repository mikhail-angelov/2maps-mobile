import axios from 'axios';
import FormData from "form-data";
import { Buffer } from "buffer";

export const HOST = 'https://2map.xyz'
export const HOST_LOCAL = 'http://localhost:5555'
// export const HOST = 'http://192.168.31.251:3000'

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

  const headers = {
    // 'Content-Length': value.length
  }
  try {
    //   const r = await fetch(url, {

    //     method:'POST',

    //     // accept: 'application/json',

    //     // 'Content-Type': 'multipart/form-data',

    //     body: formData

    // })
    // console.log('---',r)
    return await axios({
      url,
      method: 'post',
      data: formData,
      headers: Object.assign(headers, token ? {
        authorization: `bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      } : {}),
    });
  } catch (e) {
    console.log('--', JSON.stringify(e))
    throw e
  }
}

export const getLocal = (url: string) => {
  return axios.get(`${HOST_LOCAL}/${url}`);
}

export const postLocal = ({ url, data }: {
  url: string; data: any
}) => {
  return axios.post(`${HOST_LOCAL}/${url}`, data);
}
