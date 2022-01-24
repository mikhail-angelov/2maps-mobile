package com.bconf2maps;

import android.content.Intent;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // SplashScreen.show(this, R.style.SplashScreenTheme);
        super.onCreate(savedInstanceState);
        checkPermissions();
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "bconf2maps";
    }

     public void checkPermissions() {
         // API 23: we have to check if ACCESS_FINE_LOCATION and/or ACCESS_COARSE_LOCATION permission are granted
         if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                 || ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

             Log.d(TAG, "requestPermissions");
             // The ACCESS_COARSE_LOCATION is denied, then I request it and manage the result in
             // onRequestPermissionsResult() using the constant MY_PERMISSION_ACCESS_FINE_LOCATION
             ActivityCompat.requestPermissions(this,
                     new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION},
                     100);
         } else {
            // Intent intent = new Intent();
            // intent.putExtra("Permissions", true);
            // startActivityForResult(intent, 1);
         }
     }

     @Override
     public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
         switch (requestCode) {
             case 100: {
                 if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                     // permission was granted
                     Log.d(TAG, "response Permissions");
                    //  Intent intent = new Intent();
                    //  intent.putExtra("Permissions", true);
                    //  startActivityForResult(intent, 1);
                 } else {
                     // permission denied
                     Log.e(TAG, "response Permissions negative");
                    //  Intent intent = new Intent();
                    //  intent.putExtra("Permissions", false);
                    //  startActivityForResult(intent, 1);
                 }
                 break;
             }

         }
     }

}
