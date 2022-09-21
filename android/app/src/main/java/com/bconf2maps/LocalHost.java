package com.bconf2maps;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import com.google.gson.Gson;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import fi.iki.elonen.NanoHTTPD;

import androidx.core.content.ContextCompat;

public class LocalHost extends NanoHTTPD {

    private static volatile LocalHost INSTANCE;

    private static final String TAG = "RNHttpServer";
    private Map<String, DB> maps;
    private Context ctx;

    private LocalHost(Context context, int port) {
        super("127.0.0.1", port);
        ctx = context;
        init(context);
    }

    public File getSDCardPath() {
        File[] files = ContextCompat.getExternalFilesDirs(ctx, null);
        try {
            for (File file:files) {
                if (Environment.isExternalStorageRemovable(file)) {
                    return file;
                }
            }
        } catch (Exception e) {
        }
        return null;
    }

    private void init(Context context) {
        maps = new HashMap<>();
        //get list of maps
        File mapDir = context.getExternalFilesDir("/map");
        if (!mapDir.exists()) {
            //add dir
            mapDir.mkdirs();
        }
        File[] files = mapDir.listFiles();
        for (File mapFile : files) {
            if (mapFile.isDirectory() || !mapFile.canRead() || !mapFile.getName().endsWith(".sqlitedb")) {
                continue; // skip no sqlite files
            }
            String storage = "internal";
            String name = mapFile.getName().split("\\.", -1)[0].concat(":" + storage);
            long size = mapFile.length();
            DB db = new DB(context, mapFile.getAbsolutePath(), name, size, storage);
            maps.put(name, db);
            Log.d(TAG, String.format("map file is added: %s %s | %s | size: %d | storage: %s", db.name, mapFile.getName(), mapFile.getAbsolutePath(), db.size, db.storage));
        }

        File sdCardPath = getSDCardPath();
        if (sdCardPath != null) {
            initSdCard(context, sdCardPath);
        }        
    }

    private void initSdCard(Context context, File sdCardPath) {
        File mapDir = new File(sdCardPath.getPath().concat("/map"));
        if (!mapDir.exists()) {
            Log.d(TAG, String.format("sd card dir is not exist: %s", sdCardPath));
            //add dir
            mapDir.mkdirs();
        }
        File[] files = mapDir.listFiles();
        if (files == null) {
            Log.d(TAG, String.format("sd card no files: %s", sdCardPath));
            return;
        }
        for (File mapFile : files) {
            if (mapFile.isDirectory() || !mapFile.canRead() || !mapFile.getName().endsWith(".sqlitedb")) {
                Log.d(TAG, String.format("sd card dir is not exist: %s %b %b", sdCardPath, mapFile.canRead(), mapFile.canWrite()));
                continue; // skip no sqlite files
            }
            String storage = "sd-card";
            String name = mapFile.getName().split("\\.", -1)[0].concat(":" + storage);
            long size = mapFile.length();
            DB db = new DB(context, mapFile.getAbsolutePath(), name, size, storage);
            maps.put(name, db);
            Log.d(TAG, String.format("map sd card file is added: %s %s | %s | size: %d | storage: %s", db.name, mapFile.getName(), mapFile.getAbsolutePath(), db.size, db.storage));
        }
    } 

    public static LocalHost createInstance(Context context, int port) {
        synchronized (LocalHost.class) {
            Log.d(TAG, "Create LocalHost instance with port: " + port);
            INSTANCE = new LocalHost(context, port);
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
        if (Method.GET.equals(method) && parts.length > 0 && "maps".equals(parts[1])) {
            String res = new Gson().toJson(getMaps());
            return newFixedLengthResponse(Response.Status.OK, "application/json", res);
        }
        if (!Method.GET.equals(method) || parts.length != 6) {
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: invalid request: " + url);
        }
        try {
            // /map/mende/{z}/{x}/{y}.jpg
            String lastPart = parts[5].substring(0, parts[5].lastIndexOf('.'));
            String path = parts[2];
            int z = Integer.parseInt(parts[3]);
            DB db = maps.get(path);
            if (db == null)  {
                Log.d(TAG, "invalid params" + path + " url " + method + "-" + url );
                return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: invalid map: " + path);
            }
            if (db.minzoom > 0 ){
                // mercator to Locus Map zoom format
                z = 17-z; 
                if ( db.minzoom > z || db.maxzoom < z) {
                    Log.d(TAG, "invalid params" + path + " url " + method + "-" + url + "-" + parts[3]);
                    return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: invalid map: " + path);
                }
            }
            
            byte[] data = db.getTile(z, parts[4], lastPart);
            if (data == null) {
                Log.d(TAG, "no tile -" + parts[2] + parts[3] + parts[4] + lastPart);
                return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "nod");
            }
            InputStream targetStream = new ByteArrayInputStream(data);
            return newFixedLengthResponse(Response.Status.OK, "image/jpeg", targetStream, data.length);
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
            return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "nod");
        }
    }

    public void addMap(String url) {
        // download file to map folder
        Log.d(TAG, "download file to map folder TBD." + url);
    }

    public void removeMap(String name) {
        Log.d(TAG, "remove map file" + name);
        DB map = maps.get(name);
        if (map != null) {
            map.close();
            maps.remove(name);
            File mapFile = new File(map.path);
            mapFile.delete();
            Log.d(TAG, "removed map file" + map.path);
        }
    }

    public Set<String> getMapNames() {
        init(ctx); //reload list
        return maps.keySet();
    }

    public Map<String, DB> getMaps() {
        init(ctx); //reload list
        return maps;
    }

    public Map<String, DB> getMapsOnly() {
        return maps;
    }
}