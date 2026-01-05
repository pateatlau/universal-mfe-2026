package com.mobileremotehello

import android.app.Application
import android.os.Build
import androidx.preference.PreferenceManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  companion object {
    // Standalone mode uses port 8083 (different from mobile-host's 8081)
    private const val DEV_SERVER_PORT = 8083

    /**
     * Detect if running on an Android emulator.
     * Uses multiple Build characteristics for reliable detection.
     */
    private fun isEmulator(): Boolean {
      return (Build.FINGERPRINT.startsWith("generic")
          || Build.FINGERPRINT.startsWith("unknown")
          || Build.MODEL.contains("google_sdk")
          || Build.MODEL.contains("Emulator")
          || Build.MODEL.contains("Android SDK built for x86")
          || Build.MANUFACTURER.contains("Genymotion")
          || Build.PRODUCT.contains("sdk_gphone")
          || Build.PRODUCT.contains("emulator")
          || Build.PRODUCT.contains("simulator")
          || Build.HARDWARE.contains("goldfish")
          || Build.HARDWARE.contains("ranchu"))
    }

    /**
     * Resolve the dev server host based on environment.
     * - Emulator: 10.0.2.2 (special alias for host machine's localhost)
     * - Physical device: localhost (requires adb reverse or same network)
     */
    fun resolveDevServerHost(): String {
      val host = if (isEmulator()) "10.0.2.2" else "localhost"
      return "$host:$DEV_SERVER_PORT"
    }
  }

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
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()

    // Configure custom dev server host BEFORE React Native loads
    // This is different from mobile-host (8081) to allow simultaneous operation
    if (BuildConfig.DEBUG) {
      val devServerHost = resolveDevServerHost()
      val prefs = PreferenceManager.getDefaultSharedPreferences(this)
      prefs.edit().putString("debug_http_host", devServerHost).apply()
    }

    loadReactNative(this)
  }
}
