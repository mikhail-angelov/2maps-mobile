# 2Maps mobile maps

application is deployed to [Google Play](https://play.google.com/store/apps/details?id=com.bconf2maps)

## Small instruction how to deploy this app to Google Play
from [https://reactnative.dev/docs/signed-apk-android](https://reactnative.dev/docs/signed-apk-android)

### gen key
`cd $(/usr/libexec/java_home)`
`sudo keytool -genkey -v -keystore 2maps-upload-key.keystore -alias 2maps -keyalg RSA -keysize 2048 -validity 10000`

### copy `2maps-upload-key.keystore` to `<repo>/android/app`

### set config at `~/.gradle/gradle.properties`
```
MYAPP_RELEASE_STORE_FILE=2maps-upload-key.keystore
MYAPP_RELEASE_KEY_ALIAS=2maps
MYAPP_RELEASE_STORE_PASSWORD=<sec>
MYAPP_RELEASE_KEY_PASSWORD=<sec>
```
