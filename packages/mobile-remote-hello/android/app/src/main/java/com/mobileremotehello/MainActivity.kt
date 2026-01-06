package com.mobileremotehello

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
 * Identifies the main JavaScript component to render.
 *
 * @return The registered main JavaScript component name.
 */
  override fun getMainComponentName(): String = "MobileRemoteHello"

  /**
       * Creates the activity's ReactActivityDelegate for hosting the JavaScript component.
       *
       * @return The configured ReactActivityDelegate for this activity's main component; enables Fabric when `fabricEnabled` is true.
       */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}