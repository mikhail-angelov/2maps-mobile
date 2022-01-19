package com.bconf2maps;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Environment;
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

import java.io.File;
import java.util.Set;
import java.util.HashMap;
import java.util.Map;

import androidx.core.content.ContextCompat;

import com.google.gson.Gson;

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
        Set<String> maps = LocalHost.getInstance().getMapNames();
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
        promise.resolve(versionName + " (" + versionCode + ")");
    }

    //use it to notify
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private static String getUsableSpace(File path) {
        return formatSize(path.getUsableSpace());
    }

    private static String getTotalSpace(File path) {
        return formatSize(path.getTotalSpace());
    }

    private static String formatSize(long size) {
        String suffix = null;
        if (size >= 1024) {
            suffix = "KB";
            size /= 1024;
            if (size >= 1024) {
                suffix = "MB";
                size /= 1024;
            }
        }
        StringBuilder resultBuffer = new StringBuilder(Long.toString(size));
        int commaOffset = resultBuffer.length() - 3;
        while (commaOffset > 0) {
            resultBuffer.insert(commaOffset, ',');
            commaOffset -= 3;
        }
        if (suffix != null) resultBuffer.append(suffix);
        return resultBuffer.toString();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void getStorageMemoryInfo(Promise promise) {
        Map<String, String> summary = new HashMap<>();
        String result = "";
        try {
            File internalPath = Environment.getExternalStorageDirectory();
            String availableInternalMemorySize = getUsableSpace(internalPath);
            String totalInternalMemorySize = getTotalSpace(internalPath);

            summary.put("internalFree", availableInternalMemorySize);
            summary.put("internalTotal", totalInternalMemorySize);

            File sdCardPath = LocalHost.getInstance().getSDCardPath();
            if (sdCardPath != null) {
                String availableSDCardMemorySize = getUsableSpace(sdCardPath);
                String totalSDCardMemorySize = getTotalSpace(sdCardPath);

                summary.put("sdFree", availableSDCardMemorySize);
                summary.put("sdTotal", totalSDCardMemorySize);
            }
            
            result = new Gson().toJson(summary);
            Log.d(TAG, result);
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
        promise.resolve(result);
    }

    private boolean changeMapStorage(String name, String targetPath) {
        Map<String, DB> maps = LocalHost.getInstance().getMapsOnly();
        String path = maps.get(name).path;
        File file = new File(path);

        String[] splittedDestFileName = path.split("/", 0);
        String destFileName = splittedDestFileName[splittedDestFileName.length - 1];

        String destPath = targetPath.concat("/map/" + destFileName);
        return downloader.moveFile(file, destPath);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void moveMapToSDCard(String name, Promise promise) {
        String targetPath = LocalHost.getInstance().getSDCardPath().getPath();
        boolean result = changeMapStorage(name, targetPath);
        if (result) {
            promise.resolve(String.valueOf(result));
        } else {
            promise.reject("", String.valueOf(result));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void moveMapToPhoneStorage(String name, Promise promise) {
        String targetPath = reactContext.getExternalFilesDir("").getPath();
        boolean result = changeMapStorage(name, targetPath);
        if (result) {
            promise.resolve(String.valueOf(result));
        } else {
            promise.reject("", String.valueOf(result));
        }
    }
}
