import XCTest

final class ProjectNamePlaceholderUITests: XCTestCase {
    
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    // MARK: - App Launch Tests
    func testAppLaunches() throws {
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    }
    
    func testTabBarExists() throws {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.exists)
        
        // Check all tab bar items exist
        XCTAssertTrue(app.tabBars.buttons["Home"].exists)
        XCTAssertTrue(app.tabBars.buttons["Explore"].exists)
        XCTAssertTrue(app.tabBars.buttons["Profile"].exists)
        XCTAssertTrue(app.tabBars.buttons["Settings"].exists)
    }
    
    // MARK: - Home View Tests
    func testHomeViewElements() throws {
        // Ensure we're on the Home tab
        app.tabBars.buttons["Home"].tap()
        
        // Check for navigation title
        let navigationTitle = app.navigationBars["PROJECT_NAME_PLACEHOLDER"]
        XCTAssertTrue(navigationTitle.exists)
        
        // Check for hero section elements
        let welcomeText = app.staticTexts["Welcome to"]
        XCTAssertTrue(welcomeText.exists)
        
        let appNameText = app.staticTexts["PROJECT_NAME_PLACEHOLDER"]
        XCTAssertTrue(appNameText.exists)
        
        let getStartedButton = app.buttons["Get Started"]
        XCTAssertTrue(getStartedButton.exists)
        
        // Check for features section
        let featuresTitle = app.staticTexts["Features"]
        XCTAssertTrue(featuresTitle.exists)
        
        // Check for feature cards
        XCTAssertTrue(app.staticTexts["Fast"].exists)
        XCTAssertTrue(app.staticTexts["Secure"].exists)
        XCTAssertTrue(app.staticTexts["Beautiful"].exists)
    }
    
    func testWelcomeSheet() throws {
        // Ensure we're on the Home tab
        app.tabBars.buttons["Home"].tap()
        
        // Tap the info button to show welcome sheet
        let infoButton = app.navigationBars["PROJECT_NAME_PLACEHOLDER"].buttons.element(boundBy: 0)
        if infoButton.exists {
            infoButton.tap()
            
            // Check that welcome sheet appears
            let welcomeSheet = app.sheets.firstMatch
            XCTAssertTrue(welcomeSheet.waitForExistence(timeout: 2))
            
            // Close the sheet
            let closeButton = app.buttons["Close"]
            if closeButton.exists {
                closeButton.tap()
            }
            
            // Verify sheet is dismissed
            XCTAssertFalse(welcomeSheet.exists)
        }
    }
    
    // MARK: - Tab Navigation Tests
    func testTabNavigation() throws {
        // Test navigating to Explore tab
        app.tabBars.buttons["Explore"].tap()
        let exploreTitle = app.navigationBars["Explore"]
        XCTAssertTrue(exploreTitle.waitForExistence(timeout: 2))
        
        // Test navigating to Profile tab
        app.tabBars.buttons["Profile"].tap()
        let profileTitle = app.navigationBars["Profile"]
        XCTAssertTrue(profileTitle.waitForExistence(timeout: 2))
        
        // Test navigating to Settings tab
        app.tabBars.buttons["Settings"].tap()
        let settingsTitle = app.navigationBars["Settings"]
        XCTAssertTrue(settingsTitle.waitForExistence(timeout: 2))
        
        // Return to Home tab
        app.tabBars.buttons["Home"].tap()
        let homeTitle = app.navigationBars["PROJECT_NAME_PLACEHOLDER"]
        XCTAssertTrue(homeTitle.waitForExistence(timeout: 2))
    }
    
    // MARK: - Settings Tests
    func testSettingsColorScheme() throws {
        // Navigate to Settings
        app.tabBars.buttons["Settings"].tap()
        
        // Check for color scheme picker
        let colorSchemePicker = app.segmentedControls.firstMatch
        if colorSchemePicker.exists {
            // Test switching to Light mode
            colorSchemePicker.buttons["Light"].tap()
            
            // Test switching to Dark mode
            colorSchemePicker.buttons["Dark"].tap()
            
            // Test switching back to System
            colorSchemePicker.buttons["System"].tap()
        }
    }
    
    func testSettingsLinks() throws {
        // Navigate to Settings
        app.tabBars.buttons["Settings"].tap()
        
        // Check that settings links exist (but don't tap them as they open external URLs)
        XCTAssertTrue(app.cells["Privacy Policy"].exists)
        XCTAssertTrue(app.cells["Terms of Service"].exists)
        XCTAssertTrue(app.cells["Support"].exists)
    }
    
    // MARK: - Accessibility Tests
    func testAccessibility() throws {
        // Check that key UI elements have accessibility identifiers
        app.tabBars.buttons["Home"].tap()
        
        let getStartedButton = app.buttons["Get Started"]
        XCTAssertTrue(getStartedButton.exists)
        XCTAssertTrue(getStartedButton.isHittable)
        
        // Check tab bar accessibility
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.exists)
        
        for tabItem in ["Home", "Explore", "Profile", "Settings"] {
            let button = app.tabBars.buttons[tabItem]
            XCTAssertTrue(button.exists)
            XCTAssertTrue(button.isHittable)
        }
    }
    
    // MARK: - Performance Tests
    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
    
    func testScrollPerformance() throws {
        app.tabBars.buttons["Home"].tap()
        
        let scrollView = app.scrollViews.firstMatch
        if scrollView.exists {
            measure(metrics: [XCTOSSignpostMetric.scrollingAndDecelerationMetric]) {
                scrollView.swipeUp()
                scrollView.swipeDown()
            }
        }
    }
}