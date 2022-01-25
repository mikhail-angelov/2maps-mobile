import i18next from "i18next";
import { PermissionsAndroid } from "react-native";

export const requestLocationPermissions = async () => {
    const ACCESS_FINE_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    const ACCESS_COARSE_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION

    const granted = await PermissionsAndroid.requestMultiple([ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION]);

    if (granted[ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED || granted[ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
        throw {title: i18next.t("Location permission denied")}
    }
    console.log("You can use the Location");
}