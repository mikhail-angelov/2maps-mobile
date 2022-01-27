package com.bconf2maps;

import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.Cursor;

import android.content.Context;
import android.util.Log;

import com.google.gson.annotations.SerializedName;

public class DB extends SQLiteOpenHelper {
    private static final String TAG = "DataBase";
    public static final int DATABASE_VERSION = 1;
    @SerializedName("name")
    public final String name;
    @SerializedName("path")
    public final String path;
    @SerializedName("size")
    public final long size;
    @SerializedName("storage")
    public final String storage;
    @SerializedName("minzoom")
    public int minzoom = 0;
    @SerializedName("maxzoom")
    public int maxzoom = 0;

    public DB(Context context, String path, String name, long size, String storage) {
        // 3rd argument to be passed is CursorFactory instance
        super(context, path, null, DATABASE_VERSION);
        this.name = name;
        this.path = path;
        this.size = size;
        this.storage = storage;
        getInfo();
    }

    public void onCreate(SQLiteDatabase db) {
        // db.execSQL(SQL_CREATE_ENTRIES);
    }

    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // This database is only a cache for online data, so its upgrade policy is
        // to simply to discard the data and start over
        // db.execSQL(SQL_DELETE_ENTRIES);
        // onCreate(db);
    }

    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onUpgrade(db, oldVersion, newVersion);
    }


    public byte[] getTile(int z, String x, String y) {
        SQLiteDatabase db = this.getReadableDatabase();

//        z="7";x="636";y="321";
        String selection = "z=? AND x=? AND y=?";
        String[] selectionArgs = {String.valueOf(z), x, y};
        Log.d(TAG, String.format("query %s: %d %s %s ", this.name, z, x, y));
        Cursor cursor = db.query(
                "tiles",
                null,
                selection,
                selectionArgs,
                null,
                null,
                null
        );
        if (cursor.moveToNext()) {
            Log.d(TAG, String.format("have tile %s: %s", this.name, z));
            return cursor.getBlob(cursor.getColumnIndex("image"));
        }

        Log.d(TAG, String.format("no record %s: %s %s %s", this.name, z, x, y));
        return null;
    }

    public void getInfo() {
        try{
            SQLiteDatabase db = this.getReadableDatabase();
            Cursor cursor = db.query(
                    "info",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
            if (cursor.moveToNext()) {
                this.minzoom = cursor.getInt(cursor.getColumnIndex("minzoom"));
                this.maxzoom = cursor.getInt(cursor.getColumnIndex("maxzoom"));  
            }
        }
        catch(Exception e) {
            Log.d(TAG, String.format("no info %s: %s", this.name, e.getMessage()));
        }

    }
}
