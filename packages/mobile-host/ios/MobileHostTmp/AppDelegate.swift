import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Firebase before React Native starts
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "MobileHost",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    // For Re.Pack dev server, explicitly set the bundle URL
    // iOS uses port 8082, Android uses port 8081 - allows simultaneous development
    // iOS simulator can access localhost directly
    // IMPORTANT: Re.Pack requires the platform query parameter
    let bundleURL = URL(string: "http://localhost:8082/index.bundle?platform=ios")
    NSLog("[AppDelegate] DEBUG: Loading bundle from dev server: \(bundleURL?.absoluteString ?? "nil")")
    return bundleURL
#else
    let bundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    NSLog("[AppDelegate] RELEASE: Loading bundle from app: \(bundleURL?.absoluteString ?? "nil")")
    if let url = bundleURL {
      NSLog("[AppDelegate] Bundle file exists at: \(url.path)")
      let fileManager = FileManager.default
      if fileManager.fileExists(atPath: url.path) {
        do {
          let attributes = try fileManager.attributesOfItem(atPath: url.path)
          let fileSize = attributes[.size] as? UInt64 ?? 0
          NSLog("[AppDelegate] Bundle file size: \(fileSize) bytes")
        } catch {
          NSLog("[AppDelegate] Error reading bundle file attributes: \(error)")
        }
      } else {
        NSLog("[AppDelegate] ERROR: Bundle file does not exist!")
      }
    } else {
      NSLog("[AppDelegate] ERROR: Bundle URL is nil!")
    }
    return bundleURL
#endif
  }
}
