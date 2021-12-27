# 2Maps mobile maps
[![Build status](https://build.appcenter.ms/v0.1/apps/e3fb1400-2fe4-45f4-857c-018be8948c92/branches/master/badge)](https://appcenter.ms)

## Small instruction how to deploy this app to Google Play
from [https://reactnative.dev/docs/signed-apk-android](https://reactnative.dev/docs/signed-apk-android)

### gen key
`cd $(/usr/libexec/java_home)`
`sudo keytool -genkey -v -keystore 2maps-upload-key.keystore -alias 2maps -keyalg RSA -keysize 2048 -validity 10000`

### copy `2maps-upload-key.keystore` to `<repo>/android/app`

### set config at `~/.gradle/gradle.properties`
```
MYAPP_UPLOAD_STORE_FILE=2maps-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=2maps
MYAPP_UPLOAD_STORE_PASSWORD=<sec>
MYAPP_UPLOAD_KEY_PASSWORD=<sec>
```
