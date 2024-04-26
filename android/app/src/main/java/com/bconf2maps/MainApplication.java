package com.bconf2maps;

import android.app.Application;
import android.util.Log;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import java.io.IOException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private LocalHost localHost;
  private static int port = 5555;
  private static final String TAG = "MainApplication";

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new MainAppPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  private void createLocalHostInstance() {
    int actualPort = getLocalHostPort();
    localHost = LocalHost.createInstance(this, actualPort);
    try {
      localHost.start();
      Log.d(TAG, "LocalHost is started on port: " + actualPort);
    } catch(IOException e) {
      e.printStackTrace();
      Log.d(TAG, "Port is in use: " + actualPort);
      if (actualPort < 10000) {
        setLocalHostPort(actualPort + 1);
        Log.d(TAG, "Try with new port: " + getLocalHostPort());
        createLocalHostInstance();
      } else {
        setLocalHostPort(0);
      }
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  public static int getLocalHostPort() {
    return port;
  }

  public static void setLocalHostPort(int value) {
    port = value;
  }
}
