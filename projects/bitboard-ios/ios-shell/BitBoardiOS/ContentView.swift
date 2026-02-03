import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var isLoading = true
    @State private var showMeshStatus = false
    
    var body: some View {
        ZStack {
            // BitBoard WebView (full screen)
            BitBoardWebView(
                bridge: appState.bridge,
                isLoading: $isLoading
            )
            .ignoresSafeArea(.all, edges: .bottom)
            
            // Loading overlay
            if isLoading {
                LoadingView()
            }
            
            // Mesh status indicator (top right)
            VStack {
                HStack {
                    Spacer()
                    MeshStatusBadge(
                        status: appState.meshStatus,
                        onTap: { showMeshStatus = true }
                    )
                    .padding(.trailing, 16)
                    .padding(.top, 8)
                }
                Spacer()
            }
        }
        .sheet(isPresented: $showMeshStatus) {
            MeshStatusSheet(meshBridge: appState.meshBridge)
        }
    }
}

// MARK: - Loading View

struct LoadingView: View {
    @State private var animating = false
    
    var body: some View {
        ZStack {
            Color(hex: "1a1a1a")
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // BitBoard logo placeholder
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 48))
                    .foregroundColor(Color(hex: "f5a623"))
                    .rotationEffect(.degrees(animating ? 5 : -5))
                    .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: animating)
                
                Text("BITBOARD")
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "f5a623"))
                
                Text("INITIALIZING...")
                    .font(.system(size: 14, design: .monospaced))
                    .foregroundColor(Color(hex: "f5a623").opacity(0.6))
            }
        }
        .onAppear { animating = true }
    }
}

// MARK: - Mesh Status Badge

struct MeshStatusBadge: View {
    let status: MeshStatus
    let onTap: () -> Void
    
    var statusColor: Color {
        switch status.bluetoothState {
        case .poweredOn:
            return status.peerCount > 0 ? .green : Color(hex: "f5a623")
        case .poweredOff, .unauthorized:
            return .red
        default:
            return .gray
        }
    }
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 6) {
                Circle()
                    .fill(statusColor)
                    .frame(width: 8, height: 8)
                
                if status.peerCount > 0 {
                    Text("\(status.peerCount)")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "f5a623"))
                }
                
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 14))
                    .foregroundColor(Color(hex: "f5a623"))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color(hex: "1a1a1a").opacity(0.9))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color(hex: "f5a623").opacity(0.3), lineWidth: 1)
            )
        }
    }
}

// MARK: - Mesh Status Sheet

struct MeshStatusSheet: View {
    let meshBridge: MeshBridge
    @State private var peers: [MeshPeer] = []
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "1a1a1a")
                    .ignoresSafeArea()
                
                VStack(alignment: .leading, spacing: 20) {
                    // Status section
                    VStack(alignment: .leading, spacing: 12) {
                        Text(">> MESH_STATUS")
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(hex: "f5a623"))
                        
                        StatusRow(label: "BLUETOOTH", value: meshBridge.getStatus().bluetoothState.rawValue.uppercased())
                        StatusRow(label: "SCANNING", value: meshBridge.getStatus().isScanning ? "ACTIVE" : "INACTIVE")
                        StatusRow(label: "ADVERTISING", value: meshBridge.getStatus().isAdvertising ? "ACTIVE" : "INACTIVE")
                        StatusRow(label: "PEERS", value: "\(peers.count)")
                    }
                    .padding()
                    .background(Color(hex: "2a2a2a"))
                    .cornerRadius(8)
                    
                    // Peers section
                    VStack(alignment: .leading, spacing: 12) {
                        Text(">> NEARBY_PEERS")
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(hex: "f5a623"))
                        
                        if peers.isEmpty {
                            Text("No peers discovered")
                                .font(.system(size: 14, design: .monospaced))
                                .foregroundColor(.gray)
                                .padding(.vertical, 20)
                        } else {
                            ForEach(peers, id: \.id) { peer in
                                PeerRow(peer: peer)
                            }
                        }
                    }
                    .padding()
                    .background(Color(hex: "2a2a2a"))
                    .cornerRadius(8)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Mesh Network")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(Color(hex: "f5a623"))
                }
            }
        }
        .onAppear {
            peers = meshBridge.getPeers()
        }
    }
}

struct StatusRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 12, design: .monospaced))
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .foregroundColor(Color(hex: "f5a623"))
        }
    }
}

struct PeerRow: View {
    let peer: MeshPeer
    
    var body: some View {
        HStack {
            Circle()
                .fill(.green)
                .frame(width: 8, height: 8)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(peer.nickname ?? peer.id)
                    .font(.system(size: 14, design: .monospaced))
                    .foregroundColor(.white)
                
                if let rssi = peer.rssi {
                    Text("RSSI: \(rssi) dBm")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            if let hopCount = peer.hopCount {
                Text("\(hopCount) hop\(hopCount == 1 ? "" : "s")")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var hexNumber: UInt64 = 0
        scanner.scanHexInt64(&hexNumber)
        
        let r = Double((hexNumber & 0xff0000) >> 16) / 255
        let g = Double((hexNumber & 0x00ff00) >> 8) / 255
        let b = Double(hexNumber & 0x0000ff) / 255
        
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Preview

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
    }
}
#endif
