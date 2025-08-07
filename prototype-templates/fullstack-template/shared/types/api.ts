/**
 * Shared API types between frontend and backend
 * This ensures type safety across the full stack
 */

// Base types
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  status: 'success' | 'error'
  errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export interface UserProfile extends User {
  profileImageUrl?: string
  bio?: string
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: User
    accessToken: string
    refreshToken: string
    expiresAt: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse extends ApiResponse {
  data: {
    accessToken: string
    expiresAt: string
  }
}

// Health check types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  service: string
  version: string
  environment?: string
  checks?: Record<string, {
    status: 'healthy' | 'unhealthy'
    error?: string
  }>
}

// Error types
export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: any
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

// Common query parameters
export interface PaginationParams {
  page?: number
  perPage?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
}

export type QueryParams = PaginationParams & SortParams & SearchParams

// API endpoint types
export interface ApiEndpoints {
  // Health
  health: {
    basic: () => Promise<HealthCheck>
    detailed: () => Promise<HealthCheck>
  }
  
  // Authentication
  auth: {
    login: (data: LoginRequest) => Promise<LoginResponse>
    logout: () => Promise<ApiResponse>
    refresh: (data: RefreshTokenRequest) => Promise<RefreshTokenResponse>
    me: () => Promise<ApiResponse<User>>
  }
  
  // Users
  users: {
    getMe: () => Promise<ApiResponse<UserProfile>>
    updateMe: (data: UpdateUserRequest) => Promise<ApiResponse<UserProfile>>
    getUsers: (params?: QueryParams) => Promise<PaginatedResponse<User>>
    getUser: (id: string) => Promise<ApiResponse<User>>
    createUser: (data: CreateUserRequest) => Promise<ApiResponse<User>>
    updateUser: (id: string, data: UpdateUserRequest) => Promise<ApiResponse<User>>
    deleteUser: (id: string) => Promise<ApiResponse>
  }
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// API client configuration
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  defaultHeaders?: Record<string, string>
  onRequest?: (config: any) => any
  onResponse?: (response: any) => any
  onError?: (error: any) => any
}