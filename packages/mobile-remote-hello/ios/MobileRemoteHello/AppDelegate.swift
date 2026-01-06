import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// TODO: App Icons - The AppIcon.appiconset contains icon size definitions but no actual image files.
// Required icon sizes for iOS:
// - 20x20 @2x, @3x (Notification)
// - 29x29 @2x, @3x (Settings)
// - 40x40 @2x, @3x (Spotlight)
// - 60x60 @2x, @3x (App Icon)
// - 1024x1024 @1x (App Store)
// Add PNG files to Images.xcassets/AppIcon.appiconset/ and update Contents.json with "filename" entries.

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Configures the app window, initializes the React Native delegate and factory, and starts the "MobileRemoteHello" React Native module.
  /// - Parameters:
  ///   - application: The singleton application instance.
  ///   - launchOptions: Launch options provided at launch; forwarded to the React Native runtime.
  /// - Returns: `true` to indicate successful launch.
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "MobileRemoteHello",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  /// Provides the JavaScript bundle URL used by the given React Native bridge.
  /// - Parameter bridge: The React Native bridge requesting the bundle URL.
  /// - Returns: A `URL?` pointing to the JavaScript bundle to load, or `nil` if no bundle is available.
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  /// Provides the JavaScript bundle URL used to initialize the React Native bridge.
  /// 
  /// In DEBUG builds this points to the Re.Pack dev server URL for the iOS platform; in non-DEBUG builds it points to the embedded `main.jsbundle` resource in the app bundle.
  /// - Returns: The URL of the JavaScript bundle, or `nil` if no bundle URL is available.
  override func bundleURL() -> URL? {
#if DEBUG
    // For Re.Pack dev server, explicitly set the bundle URL
    // Standalone mode uses port 8084 to avoid conflict with mobile-host (8082)
    // iOS simulator can access localhost directly
    // IMPORTANT: Re.Pack requires the platform query parameter
    let bundleURL = URL(string: "http://localhost:8084/index.bundle?platform=ios")
    return bundleURL
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}