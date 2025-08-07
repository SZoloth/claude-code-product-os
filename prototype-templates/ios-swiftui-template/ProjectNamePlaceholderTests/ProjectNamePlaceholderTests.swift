import XCTest
@testable import ProjectNamePlaceholder

final class ProjectNamePlaceholderTests: XCTestCase {
    
    // MARK: - Setup & Teardown
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }
    
    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    // MARK: - App State Tests
    func testAppStateInitialization() throws {
        let appState = AppState()
        
        XCTAssertEqual(appState.colorSchemeSelection, 0)
        XCTAssertNil(appState.colorScheme)
        XCTAssertFalse(appState.isLoading)
        XCTAssertNil(appState.errorMessage)
        XCTAssertFalse(appState.showingError)
    }
    
    func testColorSchemeSelection() throws {
        let appState = AppState()
        
        // Test light mode
        appState.colorSchemeSelection = 1
        XCTAssertEqual(appState.colorScheme, .light)
        
        // Test dark mode
        appState.colorSchemeSelection = 2
        XCTAssertEqual(appState.colorScheme, .dark)
        
        // Test system mode
        appState.colorSchemeSelection = 0
        XCTAssertNil(appState.colorScheme)
    }
    
    func testErrorHandling() throws {
        let appState = AppState()
        
        appState.showError("Test error message")
        
        XCTAssertEqual(appState.errorMessage, "Test error message")
        XCTAssertTrue(appState.showingError)
        
        appState.clearError()
        
        XCTAssertNil(appState.errorMessage)
        XCTAssertFalse(appState.showingError)
    }
    
    func testLoadingState() throws {
        let appState = AppState()
        
        appState.setLoading(true)
        
        // Give a small delay for async operation
        let expectation = XCTestExpectation(description: "Loading state updated")
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            XCTAssertTrue(appState.isLoading)
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    // MARK: - Network Manager Tests
    func testNetworkManagerInitialization() throws {
        let networkManager = NetworkManager()
        
        XCTAssertTrue(networkManager.isConnected)
        XCTAssertFalse(networkManager.isLoading)
    }
    
    // MARK: - User Model Tests
    func testUserModelInitialization() throws {
        let user = User(
            username: "testuser",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User"
        )
        
        XCTAssertEqual(user.username, "testuser")
        XCTAssertEqual(user.email, "test@example.com")
        XCTAssertEqual(user.firstName, "Test")
        XCTAssertEqual(user.lastName, "User")
        XCTAssertEqual(user.fullName, "Test User")
        XCTAssertEqual(user.initials, "TU")
        XCTAssertTrue(user.isActive)
    }
    
    func testUserModelComputedProperties() throws {
        let user = User(
            username: "johndoe",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe"
        )
        
        XCTAssertEqual(user.fullName, "John Doe")
        XCTAssertEqual(user.initials, "JD")
    }
    
    func testUserModelCodable() throws {
        let user = User.mockUser
        
        // Test encoding
        let encoder = JSONEncoder()
        let data = try encoder.encode(user)
        XCTAssertNotNil(data)
        
        // Test decoding
        let decoder = JSONDecoder()
        let decodedUser = try decoder.decode(User.self, from: data)
        XCTAssertEqual(user.id, decodedUser.id)
        XCTAssertEqual(user.username, decodedUser.username)
        XCTAssertEqual(user.email, decodedUser.email)
    }
    
    // MARK: - String Extension Tests
    func testEmailValidation() throws {
        XCTAssertTrue("test@example.com".isValidEmail)
        XCTAssertTrue("user.name+tag@example.co.uk".isValidEmail)
        XCTAssertFalse("invalid-email".isValidEmail)
        XCTAssertFalse("@example.com".isValidEmail)
        XCTAssertFalse("test@".isValidEmail)
    }
    
    func testStringTrimming() throws {
        XCTAssertEqual("  hello world  ".trimmed, "hello world")
        XCTAssertEqual("\n\ttest\n\t".trimmed, "test")
        XCTAssertEqual("no spaces".trimmed, "no spaces")
    }
    
    // MARK: - Performance Tests
    func testUserModelPerformance() throws {
        measure {
            for _ in 0..<1000 {
                let user = User(
                    username: "testuser",
                    email: "test@example.com",
                    firstName: "Test",
                    lastName: "User"
                )
                _ = user.fullName
                _ = user.initials
            }
        }
    }
    
    func testNetworkManagerPerformance() throws {
        measure {
            for _ in 0..<100 {
                let networkManager = NetworkManager()
                _ = networkManager.isConnected
            }
        }
    }
}