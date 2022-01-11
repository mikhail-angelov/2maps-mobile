package com.bconf2maps;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.util.LongSparseArray;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Set;

public class MapsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MapsModule";
    private Downloader downloader;
    private LongSparseArray<Callback> appDownloads;
    private final ReactApplicationContext reactContext;
    BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            try {
                long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (appDownloads.indexOfKey(downloadId) >= 0) {
                    WritableMap downloadStatus = downloader.checkDownloadStatus(downloadId);
                    Callback downloadOnDoneCb = appDownloads.get(downloadId);

                    if (downloadStatus.getString("status").equalsIgnoreCase("STATUS_SUCCESSFUL")) {
                        downloadOnDoneCb.invoke(null, downloadStatus);
                    } else {
                        downloadOnDoneCb.invoke(downloadStatus, null);
                    }
                    appDownloads.remove(downloadId);
                }

            } catch (Exception e) {
                Log.e(TAG, Log.getStackTraceString(e));
            }
        }
    };

    MapsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        downloader = new Downloader(reactContext);
        appDownloads = new LongSparseArray<>();
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        reactContext.registerReceiver(downloadReceiver, filter);
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


    @ReactMethod
    public void download(String url, ReadableMap config, Callback onDone) {
        try {
            String id = config.getString("id");
            final DeviceEventManagerModule.RCTDeviceEventEmitter emitter = this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
            DownloadManager.Request request = downloader.createRequest(url, config);
            long downloadId = downloader.queueDownload(request);
            appDownloads.put(downloadId, onDone);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    boolean downloading = true;
                    while (downloading) {
                        try {
                            if (appDownloads.indexOfKey(downloadId) < 0) {
                                return;
                            }
                            WritableMap progress = downloader.getProgress(downloadId, id);
                            emitter.emit("map-download", progress);
                            Thread.sleep(1000);
                        } catch (Exception e) {
                            return;
                        }
                    }
                }
            }).start();
        } catch (Exception e) {
            onDone.invoke(e.getMessage(), null);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void cancelDownload(String downloadId, Promise promise) {
        Log.d(TAG, String.format("cancel download %s", downloadId));
        try {
            Long id =  Long.parseLong(downloadId, 10);
            downloader.cancelDownload(id);
        } catch (Exception e) {
        }
        promise.resolve("ok");
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void removeMap(String name, Promise promise) {
        Log.d(TAG, "removeMap " + name);
        LocalHost.getInstance().removeMap(name);
        promise.resolve("ok");
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void getVersion(Promise promise) {
        String packageName = this.reactContext.getPackageName();
        PackageManager packageManager = this.reactContext.getPackageManager();
        Object versionName = "";
        Object versionCode = "";
        try {
            versionName = packageManager.getPackageInfo(packageName, 0).versionName;
            versionCode = packageManager.getPackageInfo(packageName, 0).versionCode;
        } catch (NameNotFoundException e) {          
        }
        promise.resolve(versionName + " - " + versionCode);
    }

    //use it to notify
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
}
