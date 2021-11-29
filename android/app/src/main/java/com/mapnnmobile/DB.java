package com.mapnnmobile;

import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.Cursor;

import android.content.ContentValues;
import android.content.Context;
import android.os.Environment;
import android.os.StrictMode;
import android.util.Log;

import java.io.File;

public class DB extends SQLiteOpenHelper {
    private static final String TAG = "DataBase";
    public static final int DATABASE_VERSION = 1;
    public final String name;

    public DB(Context context, String dbFile, String name) {
        // 3rd argument to be passed is CursorFactory instance
        super(context, dbFile, null, DATABASE_VERSION);
        this.name = name;
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


    public byte[] getTile(String z, String x, String y) {
        SQLiteDatabase db = this.getReadableDatabase();

//        z="7";x="636";y="321";
        Integer zoom = 17 - Integer.parseInt(z);
        String selection = "z=? AND x=? AND y=?";
        String[] selectionArgs = {String.valueOf(zoom), x, y};
        Log.d(TAG, String.format("query %s: %s %s %s ", this.name, zoom, x, y));
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
            Log.d(TAG, String.format("yooo %s: %s", this.name, z));
            return cursor.getBlob(cursor.getColumnIndex("image"));
        }

        Log.d(TAG, String.format("no record %s: %s %s %s", this.name, zoom, x, y));
        return null;

    }
}