package com.mobilehosttmp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

        // Override bundle URL for Android emulator
        // Android emulator uses 10.0.2.2 to access host machine's localhost
        // Re.Pack dev server runs on port 8081 for Android (matches ReactHost's hardcoded port)
        // This works for both ReactNativeHost (old architecture) and ReactHost (new architecture)
        override fun getJSBundleFile(): String? {
          return if (BuildConfig.DEBUG) {
            // For Re.Pack dev server, explicitly set the bundle URL
            // Android emulator → host machine via 10.0.2.2
            // IMPORTANT: Re.Pack requires the platform query parameter
            // Using port 8081 to match ReactHost's hardcoded default
            "http://10.0.2.2:8081/index.bundle?platform=android"
          } else {
            // Production: use bundled asset
            super.getJSBundleFile()
          }
        }
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
