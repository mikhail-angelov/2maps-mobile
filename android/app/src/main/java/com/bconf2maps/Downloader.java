package com.bconf2maps;

import android.app.DownloadManager;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;

import static android.content.Context.DOWNLOAD_SERVICE;

public class Downloader {
    private static final String TAG = "Downloader";
    private DownloadManager downloadManager;
    private Context context;

    public Downloader(Context ctx) {
        context = ctx;
        downloadManager = (DownloadManager) ctx.getSystemService(DOWNLOAD_SERVICE);
    }

    public DownloadManager.Request createRequest(String url, ReadableMap requestConfig) {
        String downloadTitle = requestConfig.getString("downloadTitle");
        String downloadDescription = requestConfig.getString("downloadTitle");
        String saveAsName = requestConfig.getString("saveAsName");

        Boolean external = requestConfig.getBoolean("external");
        String external_path = requestConfig.getString("path");

        Boolean allowedInRoaming = requestConfig.getBoolean("allowedInRoaming");
        Boolean allowedInMetered = requestConfig.getBoolean("allowedInMetered");
        Boolean showInDownloads = requestConfig.getBoolean("showInDownloads");

        Uri downloadUri = Uri.parse(url);
        DownloadManager.Request request = new DownloadManager.Request(downloadUri);

        request.setDestinationInExternalFilesDir(context, "/map", saveAsName);
        request.setTitle(downloadTitle);
        request.setDescription(downloadDescription);
        request.setAllowedOverRoaming(allowedInRoaming);
        request.setAllowedOverMetered(allowedInMetered);
        request.setVisibleInDownloadsUi(showInDownloads);
        request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_MOBILE | DownloadManager.Request.NETWORK_WIFI);
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        return request;
    }

    public long queueDownload(DownloadManager.Request request) {
        return downloadManager.enqueue(request);
    }

    public WritableMap checkDownloadStatus(long downloadId) {

        DownloadManager.Query downloadQuery = new DownloadManager.Query();
        downloadQuery.setFilterById(downloadId);
        Cursor cursor = downloadManager.query(downloadQuery);
        HashMap<String, String> result = new HashMap<>();
        if (cursor.moveToFirst()) {
            result = getDownloadStatus(cursor, downloadId);
        } else {
            result.put("status", "UNKNOWN");
            result.put("reason", "COULD_NOT_FIND");
            result.put("downloadId", String.valueOf(downloadId));
        }
        cursor.close();
        WritableMap wmap = new WritableNativeMap();
        for (HashMap.Entry<String, String> entry : result.entrySet()) {
            wmap.putString(entry.getKey(), entry.getValue());
        }
        return wmap;
    }

    public int cancelDownload(long downloadId) {
        return downloadManager.remove(downloadId);
    }

    public WritableMap getProgress(long downloadId, String id) {
        DownloadManager.Query q = new DownloadManager.Query();
        q.setFilterById(downloadId);

        Cursor cursor = downloadManager.query(q);
        WritableMap result = checkDownloadStatus(downloadId);
        result.putString("id", id);
        if (!cursor.moveToFirst()) {
            result.putInt("total", 0);
            result.putInt("downloaded", 0);
            result.putString("status", "end");
        }
        HashMap<String,String> status = getDownloadStatus(cursor, downloadId);
        int bytes_downloaded = cursor.getInt(cursor
                .getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
        int bytes_total = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));

        Log.d(TAG, String.format("-check- %s", id));
        cursor.close();
        for (HashMap.Entry<String, String> entry : status.entrySet()) {
            result.putString(entry.getKey(), entry.getValue());
        }
        result.putInt("total", bytes_total);
        result.putInt("downloaded", bytes_downloaded);
        return result;
    }
    private HashMap<String, String> getDownloadStatus(Cursor cursor, long downloadId) {

        int columnStatusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
        int STATUS = cursor.getInt(columnStatusIndex);
        int columnReasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON);
        int REASON = cursor.getInt(columnReasonIndex);
        int filenameIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);
        String filename = cursor.getString(filenameIndex);

        String statusText = "";
        String reasonText = "";

        switch (STATUS) {
            case DownloadManager.STATUS_FAILED:
                statusText = "STATUS_FAILED";
                switch (REASON) {
                    case DownloadManager.ERROR_CANNOT_RESUME:
                        reasonText = "ERROR_CANNOT_RESUME";
                        break;
                    case DownloadManager.ERROR_DEVICE_NOT_FOUND:
                        reasonText = "ERROR_DEVICE_NOT_FOUND";
                        break;
                    case DownloadManager.ERROR_FILE_ALREADY_EXISTS:
                        reasonText = "ERROR_FILE_ALREADY_EXISTS";
                        break;
                    case DownloadManager.ERROR_FILE_ERROR:
                        reasonText = "ERROR_FILE_ERROR";
                        break;
                    case DownloadManager.ERROR_HTTP_DATA_ERROR:
                        reasonText = "ERROR_HTTP_DATA_ERROR";
                        break;
                    case DownloadManager.ERROR_INSUFFICIENT_SPACE:
                        reasonText = "ERROR_INSUFFICIENT_SPACE";
                        break;
                    case DownloadManager.ERROR_TOO_MANY_REDIRECTS:
                        reasonText = "ERROR_TOO_MANY_REDIRECTS";
                        break;
                    case DownloadManager.ERROR_UNHANDLED_HTTP_CODE:
                        reasonText = "ERROR_UNHANDLED_HTTP_CODE";
                        break;
                    default:
                        reasonText = "ERROR_UNKNOWN";
                        break;
                }
                break;
            case DownloadManager.STATUS_PAUSED:
                statusText = "STATUS_PAUSED";
                switch (REASON) {
                    case DownloadManager.PAUSED_QUEUED_FOR_WIFI:
                        reasonText = "PAUSED_QUEUED_FOR_WIFI";
                        break;
                    case DownloadManager.PAUSED_UNKNOWN:
                        reasonText = "PAUSED_UNKNOWN";
                        break;
                    case DownloadManager.PAUSED_WAITING_FOR_NETWORK:
                        reasonText = "PAUSED_WAITING_FOR_NETWORK";
                        break;
                    case DownloadManager.PAUSED_WAITING_TO_RETRY:
                        reasonText = "PAUSED_WAITING_TO_RETRY";
                        break;
                    default:
                        reasonText = "UNKNOWN";
                }
                break;
            case DownloadManager.STATUS_PENDING:
                statusText = "STATUS_PENDING";
                break;
            case DownloadManager.STATUS_RUNNING:
                statusText = "STATUS_RUNNING";
                break;
            case DownloadManager.STATUS_SUCCESSFUL:
                statusText = "STATUS_SUCCESSFUL";
                reasonText = filename;
                break;
            default:
                statusText = "STATUS_UNKNOWN";
                reasonText = String.valueOf(STATUS);
                break;
        }

        HashMap<String, String> result = new HashMap<>();
        result.put("status", statusText);
        result.put("reason", reasonText);
        result.put("downloadId", String.valueOf(downloadId));
        return result;
    }

    public static boolean moveFile(File source, String destPath){
        if(source.exists()){
            File dest = new File(destPath);
            File parent = new File(dest.getParent());
            if (!parent.exists()) {
                parent.mkdirs();
            }
            try (FileInputStream fis = new FileInputStream(source);
                 FileOutputStream fos = new FileOutputStream(dest)){
                if(!dest.exists()){
                    dest.createNewFile();
                }
                writeToOutputStream(fis, fos);
                source.delete();
                return true;
            } catch (IOException ioE){
                Log.e(TAG, ioE.getMessage());
            }
        }
        return false;
    }

    private static void writeToOutputStream(InputStream is, OutputStream os) throws IOException {
        byte[] buffer = new byte[1024];
        int length;
        if (is != null) {
            while ((length = is.read(buffer)) > 0x0) {
                os.write(buffer, 0x0, length);
            }
        }
        os.flush();
    }
}