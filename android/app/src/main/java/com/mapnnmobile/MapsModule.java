package com.mapnnmobile;

import android.os.Build;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.LinkedList;
import java.util.Set;

public class MapsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MapsModule";

    MapsModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "MapsModule";
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void getMapsEvent(Promise promise) {
        Log.d(TAG, "getMapsEvent");
        Set<String> maps = LocalHost.getInstance().getMaps();
        String response = String.join(",", maps);
        promise.resolve(response);
    }

    //use it to notify
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
}
