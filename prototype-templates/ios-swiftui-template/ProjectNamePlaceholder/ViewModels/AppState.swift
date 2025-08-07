import SwiftUI
import Combine

/// Global app state management
class AppState: ObservableObject {
    // MARK: - Published Properties
    @Published var isFirstLaunch: Bool = true
    @Published var colorSchemeSelection: Int = 0 {
        didSet {
            updateColorScheme()
            saveUserPreferences()
        }
    }
    @Published var colorScheme: ColorScheme? = nil
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var showingError: Bool = false
    
    // MARK: - User Defaults Keys
    private enum UserDefaultsKeys {
        static let isFirstLaunch = "isFirstLaunch"
        static let colorSchemeSelection = "colorSchemeSelection"
    }
    
    // MARK: - Initialization
    init() {
        loadUserPreferences()
        updateColorScheme()
    }
    
    // MARK: - User Preferences
    func loadUserPreferences() {
        isFirstLaunch = UserDefaults.standard.bool(forKey: UserDefaultsKeys.isFirstLaunch)
        colorSchemeSelection = UserDefaults.standard.integer(forKey: UserDefaultsKeys.colorSchemeSelection)
        
        // If it's truly the first launch, set the flag
        if !UserDefaults.standard.object(forKey: UserDefaultsKeys.isFirstLaunch) {
            isFirstLaunch = true
            UserDefaults.standard.set(false, forKey: UserDefaultsKeys.isFirstLaunch)
        }
    }
    
    func saveUserPreferences() {
        UserDefaults.standard.set(colorSchemeSelection, forKey: UserDefaultsKeys.colorSchemeSelection)
    }
    
    // MARK: - Color Scheme Management
    private func updateColorScheme() {
        switch colorSchemeSelection {
        case 1:
            colorScheme = .light
        case 2:
            colorScheme = .dark
        default:
            colorScheme = nil // System
        }
    }
    
    // MARK: - Error Handling
    func showError(_ message: String) {
        errorMessage = message
        showingError = true
    }
    
    func clearError() {
        errorMessage = nil
        showingError = false
    }
    
    // MARK: - Loading State
    func setLoading(_ loading: Bool) {
        DispatchQueue.main.async {
            self.isLoading = loading
        }
    }
    
    // MARK: - App Lifecycle
    func handleAppDidBecomeActive() {
        // Handle app becoming active
        print("App became active")
    }
    
    func handleAppWillResignActive() {
        // Handle app resigning active state
        saveUserPreferences()
        print("App will resign active")
    }
    
    func handleAppDidEnterBackground() {
        // Handle app entering background
        saveUserPreferences()
        print("App entered background")
    }
}