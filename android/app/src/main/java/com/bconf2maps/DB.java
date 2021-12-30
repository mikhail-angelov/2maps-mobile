package com.bconf2maps;

import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.Cursor;

import android.content.Context;
import android.util.Log;

public class DB extends SQLiteOpenHelper {
    private static final String TAG = "DataBase";
    public static final int DATABASE_VERSION = 1;
    public final String name;
    public final String path;

    public DB(Context context, String path, String name) {
        // 3rd argument to be passed is CursorFactory instance
        super(context, path, null, DATABASE_VERSION);
        this.name = name;
        this.path = path;
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
        String selection = "z=? AND x=? AND y=?";
        String[] selectionArgs = {z, x, y};
        Log.d(TAG, String.format("query %s: %s %s %s ", this.name, z, x, y));
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

        Log.d(TAG, String.format("no record %s: %s %s %s", this.name, z, x, y));
        return null;

    }
}
