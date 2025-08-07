import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var networkManager: NetworkManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            ExploreView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Explore")
                }
                .tag(1)
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(2)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
                .tag(3)
        }
        .accentColor(.primary)
        .onAppear {
            setupTabBar()
        }
    }
    
    private func setupTabBar() {
        // Additional tab bar configuration if needed
    }
}

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingWelcome = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Hero Section
                    HeroSectionView()
                    
                    // Feature Cards
                    FeatureCardsView()
                    
                    // Recent Activity
                    RecentActivityView()
                }
                .padding(.horizontal)
            }
            .navigationTitle("PROJECT_NAME_PLACEHOLDER")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingWelcome.toggle()
                    }) {
                        Image(systemName: "info.circle")
                    }
                }
            }
            .sheet(isPresented: $showingWelcome) {
                WelcomeView()
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

// MARK: - Hero Section
struct HeroSectionView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("Welcome to")
                .font(.title2)
                .foregroundColor(.secondary)
            
            Text("PROJECT_NAME_PLACEHOLDER")
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text("A modern iOS app built with SwiftUI")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Get Started") {
                // Handle get started action
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Feature Cards
struct FeatureCardsView: View {
    let features = [
        Feature(icon: "bolt.fill", title: "Fast", description: "Built with SwiftUI for optimal performance"),
        Feature(icon: "shield.fill", title: "Secure", description: "Privacy-first approach to data handling"),
        Feature(icon: "paintbrush.fill", title: "Beautiful", description: "Modern design following iOS guidelines")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Features")
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 1), spacing: 12) {
                ForEach(features) { feature in
                    FeatureCardView(feature: feature)
                }
            }
        }
    }
}

struct FeatureCardView: View {
    let feature: Feature
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: feature.icon)
                .font(.title)
                .foregroundColor(.blue)
                .frame(width: 40, height: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(feature.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(feature.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Recent Activity
struct RecentActivityView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Activity")
                .font(.title2)
                .fontWeight(.semibold)
            
            VStack(spacing: 8) {
                ActivityItemView(
                    icon: "clock.fill",
                    title: "App Launched",
                    subtitle: "Welcome to your new app!",
                    time: "Just now"
                )
                
                ActivityItemView(
                    icon: "checkmark.circle.fill",
                    title: "Setup Complete",
                    subtitle: "All features are ready to use",
                    time: "1 min ago"
                )
            }
        }
    }
}

struct ActivityItemView: View {
    let icon: String
    let title: String
    let subtitle: String
    let time: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.green)
                .frame(width: 24, height: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .fontWeight(.medium)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Other Views
struct ExploreView: View {
    var body: some View {
        NavigationView {
            VStack {
                Image(systemName: "magnifyingglass.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text("Explore")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Discover new features and content")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .navigationTitle("Explore")
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct ProfileView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Profile Image
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 100))
                    .foregroundColor(.blue)
                
                // User Info
                VStack(spacing: 8) {
                    Text("PROJECT_AUTHOR_PLACEHOLDER")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("iOS Developer")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Profile")
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
            Form {
                Section("Appearance") {
                    Picker("Color Scheme", selection: $appState.colorSchemeSelection) {
                        Text("System").tag(0)
                        Text("Light").tag(1)
                        Text("Dark").tag(2)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Build")
                        Spacer()
                        Text("1")
                            .foregroundColor(.secondary)
                    }
                }
                
                Section {
                    Link("Privacy Policy", destination: URL(string: "PROJECT_PRIVACY_URL_PLACEHOLDER")!)
                    Link("Terms of Service", destination: URL(string: "PROJECT_TERMS_URL_PLACEHOLDER")!)
                    Link("Support", destination: URL(string: "PROJECT_SUPPORT_URL_PLACEHOLDER")!)
                }
            }
            .navigationTitle("Settings")
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct WelcomeView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()
                
                Image(systemName: "hand.wave.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.yellow)
                
                VStack(spacing: 16) {
                    Text("Welcome to")
                        .font(.title)
                        .foregroundColor(.secondary)
                    
                    Text("PROJECT_NAME_PLACEHOLDER")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                    
                    Text("This template provides a solid foundation for building modern iOS apps with SwiftUI. It includes navigation, state management, networking, and more.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                Spacer()
                
                Button("Get Started") {
                    presentationMode.wrappedValue.dismiss()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Data Models
struct Feature: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
}

#Preview {
    ContentView()
        .environmentObject(AppState())
        .environmentObject(NetworkManager())
}