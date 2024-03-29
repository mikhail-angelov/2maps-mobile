package com.bconf2maps;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.app.Activity;
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
import android.util.Base64;
import android.net.Uri;
import android.provider.Settings;
import android.view.WindowManager;

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
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.Signature;
import java.security.spec.EncodedKeySpec;
import java.security.spec.PKCS8EncodedKeySpec;

import androidx.core.content.ContextCompat;

import com.google.gson.Gson;

public class MapsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MapsModule";
    private Downloader downloader;
    private LongSparseArray<Callback> appDownloads;
    private Callback appMapTransferOnDoneCb;
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

    BroadcastReceiver mapTransferReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            try {
                String message = intent.getStringExtra("message");
                String status = intent.getStringExtra("status");
                Log.d(TAG, String.format("receive transfer complete, message: %s, status: %s", message, status));

                if (status.equals("SUCCESSFUL")) {
                    appMapTransferOnDoneCb.invoke(null, status);
                } else {
                    appMapTransferOnDoneCb.invoke(message, null);
                }
                appMapTransferOnDoneCb = null;
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

        IntentFilter mapTransferFilter = new IntentFilter("ACTION_MAP_TRANSFER_COMPLETE");
        reactContext.registerReceiver(mapTransferReceiver, mapTransferFilter);
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

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void setAwake(boolean value, Promise promise) {
        Log.d(TAG, String.format("set awake flag %b", value));
        final Activity activity = getCurrentActivity();
        if(activity == null){
            promise.reject("err","awake");
            return;
        }
        try {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if(value){
                        activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    }else{
                        activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    }
                }
            });
            promise.resolve("ok");
        } catch (Exception e) {
            Log.d(TAG, String.format("error set awake flag %s", e.getMessage()));
            promise.reject("err","awake");
        }


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

    private void changeMapStorage(String name, String targetPath) {
        Map<String, DB> maps = LocalHost.getInstance().getMapsOnly();
        String path = maps.get(name).path;
        File file = new File(path);

        String[] splittedDestFileName = path.split("/", 0);
        String destFileName = splittedDestFileName[splittedDestFileName.length - 1];

        String destPath = targetPath.concat("/map/" + destFileName);
        downloader.moveFile(file, destPath);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void moveMapToSDCard(String name, Callback onDone) {
        File sdCardPath = LocalHost.getInstance().getSDCardPath();
        if (sdCardPath == null) {
            onDone.invoke("No SD card path", null);
            return;
        }
        appMapTransferOnDoneCb = onDone;
        String targetPath = sdCardPath.getPath();
        changeMapStorage(name, targetPath);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void moveMapToPhoneStorage(String name, Callback onDone) {
        String targetPath = reactContext.getExternalFilesDir("").getPath();
        appMapTransferOnDoneCb = onDone;
        changeMapStorage(name, targetPath);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void cancelMapTransfer(Promise promise) {
        Log.d(TAG, "cancel map transfer");
        try {
            downloader.cancelMapTransfer();
        } catch (Exception e) {
        }
        promise.resolve("ok");
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void isTestDevice(Promise promise) {
        String testLabSetting = Settings.System.getString(reactContext.getContentResolver(), "firebase.test.lab");
        promise.resolve("true".equals(testLabSetting));
    }

    public String sha256rsa(String key, String data) throws SecurityException {
        String trimmedKey = key.replaceAll("-----\\w+ PRIVATE KEY-----", "")
                                .replaceAll("\\s", "");

        try {
            byte[]         result    = Base64.decode(trimmedKey, Base64.DEFAULT);
            KeyFactory     factory   = KeyFactory.getInstance("RSA");
            EncodedKeySpec keySpec   = new PKCS8EncodedKeySpec(result);
            Signature      signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(factory.generatePrivate(keySpec));
            signature.update(data.getBytes());

            byte[] encrypted = signature.sign();
            return Base64.encodeToString(encrypted, Base64.NO_WRAP);
        } catch (Exception e) {
            throw new SecurityException("Error sign: "+e.getMessage());
        }
    }
    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void openYandexNavigator(String lng,String lat,String clientId,String key, Promise promise) throws SecurityException {
        Log.d(TAG, "openYandexNavigator: "+clientId);
        try{
            Uri uri = Uri.parse("yandexnavi://build_route_on_map").buildUpon()
                .appendQueryParameter("lat_to", lat)
                .appendQueryParameter("lon_to",lng)
                .appendQueryParameter("client", clientId).build();

            uri = uri.buildUpon()
                .appendQueryParameter("signature", sha256rsa(key, uri.toString()))
                .build();

            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.setPackage("ru.yandex.yandexnavi");
            final Activity activity = getCurrentActivity();
            if(activity == null){
                promise.reject("err","nav");
                return;
            }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    activity.startActivity(intent);
                }
            });
            promise.resolve("ok");
        } catch (Exception e) {
            promise.reject("err","nav");
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void getLocalhostPort(Promise promise) {
        Map<String, String> payload = new HashMap<>();

        int localhostPort = MainApplication.getLocalHostPort();
        payload.put("port", String.valueOf(localhostPort));
            
        String result = new Gson().toJson(payload);
        Log.d(TAG, result);
        promise.resolve(result);
    }
}
