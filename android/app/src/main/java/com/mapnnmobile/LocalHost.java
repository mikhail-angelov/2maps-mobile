package com.mapnnmobile;

import fi.iki.elonen.NanoHTTPD;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Iterator;
import java.util.HashMap;
import java.util.stream.Stream;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Environment;
import android.os.StrictMode;
import android.util.Log;
import android.content.Context;
import com.google.gson.Gson;
import androidx.core.app.ActivityCompat;

import java.io.IOException;

public class LocalHost extends NanoHTTPD {

    private static volatile LocalHost INSTANCE;
    public static final String DATABASE_NAME = "mende.sqlitedb";

    private static final String TAG = "RNHttpServer";
    private Map<String, DB> maps;

    private LocalHost(Context context) {
        super("127.0.0.1", 5555);
        maps = new HashMap<>();
        //get list of maps
        File mapDir = new File(context.getFilesDir() + "/map/");
        if (!mapDir.exists()) {
            //add dir
            mapDir.mkdirs();
            return;
        }
        File[] files = mapDir.listFiles();
        for (File mapFile : files) {
            if (mapFile.isDirectory() || !mapFile.canRead() || !mapFile.getName().endsWith(".sqlitedb")) {
                continue; // skip no sqlite files
            }
            String name = mapFile.getName().split("\\.", -1)[0];
            DB db = new DB(context, mapFile.getAbsolutePath(), name);
            maps.put(name, db);
            Log.d(TAG, String.format("map file is added: %s %s | %s", db.name, mapFile.getName(), mapFile.getAbsolutePath()));
        }

        mapDir = new File("/sdcard/Download/map/");
        if (!mapDir.exists()) {
            Log.d(TAG, String.format("sd card dir is not exist: %s", Environment.getExternalStorageDirectory() + "/Download/map/"));
            //add dir
            mapDir.mkdirs();
            return;
        }
        files = mapDir.listFiles();
        if (files == null) {
            Log.d(TAG, String.format("sd card no files: %s", Environment.getExternalStorageDirectory() + "/Download/map/"));
            return;
        }
        for (File mapFile : files) {
            if (mapFile.isDirectory() || !mapFile.canRead() || !mapFile.getName().endsWith(".sqlitedb")) {
                Log.d(TAG, String.format("sd card dir is not exist: %s %b %b", Environment.getExternalStorageDirectory() + "/Download/map/", mapFile.canRead(), mapFile.canWrite()));
                continue; // skip no sqlite files
            }
            String name = mapFile.getName().split("\\.", -1)[0];
            DB db = new DB(context, mapFile.getAbsolutePath(), name);
            maps.put(name, db);
            Log.d(TAG, String.format("map file is added: %s %s | %s", db.name, mapFile.getName(), mapFile.getAbsolutePath()));
        }
    }

    public static LocalHost createInstance(Context context) {
        synchronized (LocalHost.class) {
            if (INSTANCE == null) {
                INSTANCE = new LocalHost(context);
            }
        }
        return INSTANCE;
    }

    public static LocalHost getInstance() {
        return INSTANCE;
    }

    @Override
    public Response serve(IHTTPSession session) {

        Method method = session.getMethod();
        String url = session.getUri();
        String[] parts = url.split("/");

        Log.d(TAG, "Server receiving request." + url);
        if (Method.GET.equals(method)&& parts.length>0 && "maps".equals(parts[1])) {
            String res = new Gson().toJson(maps.keySet());
            return newFixedLengthResponse(Response.Status.OK, "application/json", res);
        }
        if (!Method.GET.equals(method) || parts.length != 6) {
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: invalid request: " + url);
        }
        // /map/mende/{z}/{x}/{y}.jpg
        String lastPart = parts[5].substring(0, parts[5].lastIndexOf('.'));
        String path = parts[2];
        DB db = maps.get(path);
        if (!Method.GET.equals(method) || parts.length != 6 || db==null) {
            Log.d(TAG, "invalid params" + path + " url "+ method+"-"+url);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: invalid map: " + path);
        }
        byte[] data = db.getTile(parts[3], parts[4], lastPart);
        if (data == null) {
            Log.d(TAG, "no tile -" +parts[2]+ parts[3]+ parts[4]+ lastPart);
//        return newFixedLengthResponse("Hello world:"+url+"z:"+parts[3]+"x:"+parts[4]+"y:"+lastPart);
            return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "nod");
        }
        InputStream targetStream = new ByteArrayInputStream(data);
        return newFixedLengthResponse(Response.Status.OK, "image/png", targetStream, data.length);
    }

    public void addMap(String url) {
        // download file to map folder
        Log.d(TAG, "download file to map folder TBD." + url);
    }

    public Set<String> getMaps() {
        return maps.keySet();
    }
}