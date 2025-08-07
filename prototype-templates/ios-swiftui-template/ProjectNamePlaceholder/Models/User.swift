import Foundation

// MARK: - User Model
struct User: Codable, Identifiable, Equatable {
    let id: UUID
    let username: String
    let email: String
    let firstName: String
    let lastName: String
    let profileImageURL: String?
    let createdAt: Date
    let updatedAt: Date
    let isActive: Bool
    
    // MARK: - Computed Properties
    var fullName: String {
        return "\(firstName) \(lastName)"
    }
    
    var initials: String {
        let first = firstName.prefix(1).uppercased()
        let last = lastName.prefix(1).uppercased()
        return "\(first)\(last)"
    }
    
    // MARK: - Initialization
    init(
        id: UUID = UUID(),
        username: String,
        email: String,
        firstName: String,
        lastName: String,
        profileImageURL: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        isActive: Bool = true
    ) {
        self.id = id
        self.username = username
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
        self.profileImageURL = profileImageURL
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.isActive = isActive
    }
    
    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case email
        case firstName = "first_name"
        case lastName = "last_name"
        case profileImageURL = "profile_image_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case isActive = "is_active"
    }
}

// MARK: - User Profile Update Model
struct UserProfileUpdate: Codable {
    let firstName: String?
    let lastName: String?
    let email: String?
    let profileImageURL: String?
    
    enum CodingKeys: String, CodingKey {
        case firstName = "first_name"
        case lastName = "last_name"
        case email
        case profileImageURL = "profile_image_url"
    }
}

// MARK: - User Registration Model
struct UserRegistration: Codable {
    let username: String
    let email: String
    let firstName: String
    let lastName: String
    let password: String
    
    enum CodingKeys: String, CodingKey {
        case username
        case email
        case firstName = "first_name"
        case lastName = "last_name"
        case password
    }
}

// MARK: - User Login Model
struct UserLogin: Codable {
    let email: String
    let password: String
}

// MARK: - Authentication Response
struct AuthResponse: Codable {
    let user: User
    let token: String
    let refreshToken: String
    let expiresAt: Date
    
    enum CodingKeys: String, CodingKey {
        case user
        case token
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

// MARK: - Example/Mock Data
extension User {
    static let mockUser = User(
        username: "johndoe",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        profileImageURL: nil
    )
    
    static let mockUsers: [User] = [
        User(
            username: "alice",
            email: "alice@example.com",
            firstName: "Alice",
            lastName: "Smith",
            profileImageURL: nil
        ),
        User(
            username: "bob",
            email: "bob@example.com",
            firstName: "Bob",
            lastName: "Johnson",
            profileImageURL: nil
        ),
        User(
            username: "charlie",
            email: "charlie@example.com",
            firstName: "Charlie",
            lastName: "Brown",
            profileImageURL: nil
        )
    ]
}