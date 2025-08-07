import Foundation
import Combine

/// Network manager for handling API requests
class NetworkManager: ObservableObject {
    // MARK: - Properties
    static let shared = NetworkManager()
    
    private let session: URLSession
    private var cancellables = Set<AnyCancellable>()
    
    @Published var isConnected: Bool = true
    @Published var isLoading: Bool = false
    
    // MARK: - Configuration
    private let baseURL = "PROJECT_API_BASE_URL_PLACEHOLDER"
    private let timeout: TimeInterval = 30
    
    // MARK: - Initialization
    init(session: URLSession = .shared) {
        self.session = session
        setupSession()
        startNetworkMonitoring()
    }
    
    private func setupSession() {
        // Configure session if needed
        // session.configuration.timeoutIntervalForRequest = timeout
    }
    
    // MARK: - Network Monitoring
    private func startNetworkMonitoring() {
        // In a real app, you might use Network framework for reachability
        // For now, we'll assume connection is available
        isConnected = true
    }
    
    // MARK: - Generic Request Method
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        headers: [String: String]? = nil,
        type: T.Type
    ) -> AnyPublisher<T, NetworkError> {
        
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: NetworkError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.httpBody = body
        
        // Set default headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Add custom headers
        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: T.self, decoder: JSONDecoder())
            .mapError { error in
                if error is DecodingError {
                    return NetworkError.decodingError
                } else {
                    return NetworkError.requestFailed
                }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Convenience Methods
    func get<T: Decodable>(
        endpoint: String,
        headers: [String: String]? = nil,
        type: T.Type
    ) -> AnyPublisher<T, NetworkError> {
        return request(
            endpoint: endpoint,
            method: .GET,
            headers: headers,
            type: type
        )
    }
    
    func post<T: Decodable, U: Encodable>(
        endpoint: String,
        body: U,
        headers: [String: String]? = nil,
        type: T.Type
    ) -> AnyPublisher<T, NetworkError> {
        
        guard let data = try? JSONEncoder().encode(body) else {
            return Fail(error: NetworkError.encodingError)
                .eraseToAnyPublisher()
        }
        
        return request(
            endpoint: endpoint,
            method: .POST,
            body: data,
            headers: headers,
            type: type
        )
    }
    
    func put<T: Decodable, U: Encodable>(
        endpoint: String,
        body: U,
        headers: [String: String]? = nil,
        type: T.Type
    ) -> AnyPublisher<T, NetworkError> {
        
        guard let data = try? JSONEncoder().encode(body) else {
            return Fail(error: NetworkError.encodingError)
                .eraseToAnyPublisher()
        }
        
        return request(
            endpoint: endpoint,
            method: .PUT,
            body: data,
            headers: headers,
            type: type
        )
    }
    
    func delete<T: Decodable>(
        endpoint: String,
        headers: [String: String]? = nil,
        type: T.Type
    ) -> AnyPublisher<T, NetworkError> {
        return request(
            endpoint: endpoint,
            method: .DELETE,
            headers: headers,
            type: type
        )
    }
    
    // MARK: - Image Loading
    func loadImage(from urlString: String) -> AnyPublisher<Data, NetworkError> {
        guard let url = URL(string: urlString) else {
            return Fail(error: NetworkError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .mapError { _ in NetworkError.requestFailed }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// MARK: - HTTP Method Enum
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

// MARK: - Network Error Enum
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case encodingError
    case requestFailed
    case unauthorized
    case forbidden
    case notFound
    case serverError
    case networkUnavailable
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to decode response"
        case .encodingError:
            return "Failed to encode request"
        case .requestFailed:
            return "Request failed"
        case .unauthorized:
            return "Unauthorized access"
        case .forbidden:
            return "Access forbidden"
        case .notFound:
            return "Resource not found"
        case .serverError:
            return "Server error"
        case .networkUnavailable:
            return "Network unavailable"
        }
    }
}