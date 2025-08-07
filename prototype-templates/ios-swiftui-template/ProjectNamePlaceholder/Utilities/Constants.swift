import SwiftUI

// MARK: - App Constants
enum Constants {
    
    // MARK: - App Information
    enum App {
        static let name = "PROJECT_NAME_PLACEHOLDER"
        static let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        static let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        static let bundleIdentifier = Bundle.main.bundleIdentifier ?? "com.example.app"
    }
    
    // MARK: - API Configuration
    enum API {
        static let baseURL = "PROJECT_API_BASE_URL_PLACEHOLDER"
        static let timeout: TimeInterval = 30
        static let apiVersion = "v1"
    }
    
    // MARK: - UserDefaults Keys
    enum UserDefaults {
        static let hasCompletedOnboarding = "hasCompletedOnboarding"
        static let userThemePreference = "userThemePreference"
        static let lastAppVersion = "lastAppVersion"
        static let deviceToken = "deviceToken"
    }
    
    // MARK: - Layout Constants
    enum Layout {
        static let cornerRadius: CGFloat = 12
        static let smallCornerRadius: CGFloat = 8
        static let largeCornerRadius: CGFloat = 16
        
        static let padding: CGFloat = 16
        static let smallPadding: CGFloat = 8
        static let largePadding: CGFloat = 24
        
        static let buttonHeight: CGFloat = 44
        static let largeButtonHeight: CGFloat = 56
        
        static let iconSize: CGFloat = 24
        static let smallIconSize: CGFloat = 16
        static let largeIconSize: CGFloat = 32
    }
    
    // MARK: - Animation Constants
    enum Animation {
        static let fast: Double = 0.2
        static let medium: Double = 0.3
        static let slow: Double = 0.5
        
        static let spring = SwiftUI.Animation.spring(response: 0.5, dampingFraction: 0.8)
        static let easeInOut = SwiftUI.Animation.easeInOut(duration: medium)
    }
    
    // MARK: - Typography
    enum Typography {
        static let largeTitle = Font.largeTitle.weight(.bold)
        static let title = Font.title.weight(.semibold)
        static let title2 = Font.title2.weight(.semibold)
        static let title3 = Font.title3.weight(.medium)
        static let headline = Font.headline.weight(.medium)
        static let subheadline = Font.subheadline
        static let body = Font.body
        static let callout = Font.callout
        static let footnote = Font.footnote
        static let caption = Font.caption
        static let caption2 = Font.caption2
    }
    
    // MARK: - Colors
    enum Colors {
        // Primary Colors
        static let primary = Color.blue
        static let secondary = Color.gray
        static let accent = Color.blue
        
        // Status Colors
        static let success = Color.green
        static let warning = Color.orange
        static let error = Color.red
        static let info = Color.blue
        
        // Background Colors
        static let background = Color(.systemBackground)
        static let secondaryBackground = Color(.secondarySystemBackground)
        static let tertiaryBackground = Color(.tertiarySystemBackground)
        
        // Text Colors
        static let primaryText = Color(.label)
        static let secondaryText = Color(.secondaryLabel)
        static let tertiaryText = Color(.tertiaryLabel)
        
        // Border Colors
        static let border = Color(.separator)
        static let lightBorder = Color(.separator).opacity(0.5)
    }
    
    // MARK: - Images
    enum Images {
        // System Images
        static let home = "house.fill"
        static let explore = "magnifyingglass"
        static let profile = "person.fill"
        static let settings = "gearshape.fill"
        
        static let checkmark = "checkmark.circle.fill"
        static let xmark = "xmark.circle.fill"
        static let warning = "exclamationmark.triangle.fill"
        static let info = "info.circle.fill"
        
        static let chevronRight = "chevron.right"
        static let chevronLeft = "chevron.left"
        static let chevronUp = "chevron.up"
        static let chevronDown = "chevron.down"
        
        static let plus = "plus"
        static let minus = "minus"
        static let edit = "pencil"
        static let delete = "trash"
        static let share = "square.and.arrow.up"
    }
    
    // MARK: - URLs
    enum URLs {
        static let privacyPolicy = "PROJECT_PRIVACY_URL_PLACEHOLDER"
        static let termsOfService = "PROJECT_TERMS_URL_PLACEHOLDER"
        static let support = "PROJECT_SUPPORT_URL_PLACEHOLDER"
        static let appStore = "PROJECT_APPSTORE_URL_PLACEHOLDER"
    }
    
    // MARK: - Limits
    enum Limits {
        static let maxUsernameLength = 30
        static let minPasswordLength = 8
        static let maxBioLength = 150
        static let maxImageSize = 5 * 1024 * 1024 // 5MB
    }
    
    // MARK: - Notifications
    enum Notifications {
        static let userDidLogin = "userDidLogin"
        static let userDidLogout = "userDidLogout"
        static let themeDidChange = "themeDidChange"
        static let dataDidRefresh = "dataDidRefresh"
    }
}