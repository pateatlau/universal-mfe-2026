package com.mobileremotehello

import android.app.Application
import android.content.Context
import android.preference.PreferenceManager
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
        /**
             * Provide the list of React packages available to the application, allowing manual additions when autolinking is not available.
             *
             * @return A mutable list of `ReactPackage` instances used by the app; additional packages may be appended to this list.
             */
            override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        /**
 * Specifies the JavaScript entry module name used to load the React Native bundle.
 *
 * @return The main JS module name used as the entry point, `"index"`.
 */
override fun getJSMainModuleName(): String = "index"

        /**
 * Indicates whether developer support features are enabled.
 *
 * @return `true` if the app is built in debug mode, `false` otherwise.
 */
override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  /**
   * Initializes application-level React Native configuration and starts React Native.
   *
   * In debug builds, sets the dev server host to "localhost:8083" before React Native is loaded so the app
   * connects to the specified local packager port (separate from the default mobile-host port). After
   * applying the debug preference (when applicable), loads React Native runtime.
   */
  override fun onCreate() {
    super.onCreate()

    // Configure custom dev server port (8083) BEFORE React Native loads
    // This is different from mobile-host (8081) to allow simultaneous operation
    if (BuildConfig.DEBUG) {
      val prefs = PreferenceManager.getDefaultSharedPreferences(this)
      prefs.edit().putString("debug_http_host", "localhost:8083").apply()
    }

    loadReactNative(this)
  }
}