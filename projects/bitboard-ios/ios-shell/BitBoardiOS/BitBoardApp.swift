import SwiftUI

@main
struct BitBoardApp: App {
    // Create services once at app startup
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

// MARK: - App State

/// AppState holds all the native services and bridges
class AppState: ObservableObject {
    let meshBridge: MeshBridge
    let locationBridge: LocationBridge
    let bridge: BitBoardBridge
    
    @Published var meshStatus: MeshStatus
    @Published var peerCount: Int = 0
    
    init() {
        // Initialize native services
        meshBridge = MeshBridge()
        locationBridge = LocationBridge()
        
        // Create the JavaScript bridge
        bridge = BitBoardBridge(
            meshBridge: meshBridge,
            locationBridge: locationBridge
        )
        
        // Get initial status
        meshStatus = meshBridge.getStatus()
        
        // Subscribe to updates
        meshBridge.onStatusChanged
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                self?.meshStatus = status
                self?.peerCount = status.peerCount
            }
            .store(in: &cancellables)
    }
    
    private var cancellables = Set<AnyCancellable>()
}

import Combine
