import Foundation
import Combine

// MARK: - Types

enum BluetoothState: String {
    case unknown
    case resetting
    case unsupported
    case unauthorized
    case poweredOff
    case poweredOn
}

struct MeshStatus {
    let isEnabled: Bool
    let isScanning: Bool
    let isAdvertising: Bool
    let peerCount: Int
    let bluetoothState: BluetoothState
}

struct MeshPeer {
    let id: String
    var nickname: String?
    var rssi: Int?
    var lastSeen: Date
    var hopCount: Int?
}

struct MeshMessage {
    enum MessageType { case `public`, direct }
    
    let id: String
    let type: MessageType
    let content: String
    let sender: String
    let timestamp: Date
    var boardId: String?
    var parentId: String?
    var tags: [String]?
    var hopCount: Int?
    
    init(
        id: String = UUID().uuidString,
        type: MessageType,
        content: String,
        sender: String = "",
        timestamp: Date = Date(),
        boardId: String? = nil,
        parentId: String? = nil,
        tags: [String]? = nil,
        hopCount: Int? = nil
    ) {
        self.id = id
        self.type = type
        self.content = content
        self.sender = sender
        self.timestamp = timestamp
        self.boardId = boardId
        self.parentId = parentId
        self.tags = tags
        self.hopCount = hopCount
    }
}

// MARK: - MeshBridge Protocol

protocol MeshBridgeProtocol {
    var onMessage: AnyPublisher<MeshMessage, Never> { get }
    var onPeersChanged: AnyPublisher<[MeshPeer], Never> { get }
    var onStatusChanged: AnyPublisher<MeshStatus, Never> { get }
    
    func getStatus() -> MeshStatus
    func getPeers() -> [MeshPeer]
    func broadcast(_ message: MeshMessage) async throws
    func sendDirect(to peerId: String, message: MeshMessage) async throws
}

// MARK: - MeshBridge Implementation

/// MeshBridge wraps BLEService from Bitchat and exposes it to the JavaScript bridge
final class MeshBridge: MeshBridgeProtocol {
    
    // MARK: - Publishers
    
    private let messageSubject = PassthroughSubject<MeshMessage, Never>()
    private let peersSubject = CurrentValueSubject<[MeshPeer], Never>([])
    private let statusSubject = CurrentValueSubject<MeshStatus, Never>(MeshStatus(
        isEnabled: false,
        isScanning: false,
        isAdvertising: false,
        peerCount: 0,
        bluetoothState: .unknown
    ))
    
    var onMessage: AnyPublisher<MeshMessage, Never> { messageSubject.eraseToAnyPublisher() }
    var onPeersChanged: AnyPublisher<[MeshPeer], Never> { peersSubject.eraseToAnyPublisher() }
    var onStatusChanged: AnyPublisher<MeshStatus, Never> { statusSubject.eraseToAnyPublisher() }
    
    // MARK: - BLEService Integration
    
    // TODO: Replace with actual BLEService from Bitchat
    // private let bleService: BLEService
    
    // MARK: - Initialization
    
    init() {
        // TODO: Initialize BLEService and set self as delegate
        // bleService = BLEService(...)
        // bleService.delegate = self
        
        print("[MeshBridge] Initialized (stub implementation)")
    }
    
    // MARK: - Public API
    
    func getStatus() -> MeshStatus {
        // TODO: Get real status from BLEService
        // return MeshStatus(
        //     isEnabled: bleService.isEnabled,
        //     isScanning: bleService.isScanning,
        //     isAdvertising: bleService.isAdvertising,
        //     peerCount: bleService.peerCount,
        //     bluetoothState: mapBluetoothState(bleService.centralManager?.state)
        // )
        return statusSubject.value
    }
    
    func getPeers() -> [MeshPeer] {
        // TODO: Get real peers from BLEService
        // return bleService.currentPeers.map { peer in
        //     MeshPeer(
        //         id: peer.peerID.shortString,
        //         nickname: peer.nickname,
        //         rssi: peer.rssi,
        //         lastSeen: peer.lastSeen,
        //         hopCount: peer.hopCount
        //     )
        // }
        return peersSubject.value
    }
    
    func broadcast(_ message: MeshMessage) async throws {
        // TODO: Send via BLEService
        // let packet = BitchatPacket(
        //     type: .publicMessage,
        //     content: message.content,
        //     ...
        // )
        // try await bleService.broadcastMessage(packet)
        
        print("[MeshBridge] Broadcast: \(message.content)")
        
        // For now, just echo back for testing
        #if DEBUG
        await MainActor.run {
            var echoMessage = message
            echoMessage.sender = "local"
            messageSubject.send(echoMessage)
        }
        #endif
    }
    
    func sendDirect(to peerId: String, message: MeshMessage) async throws {
        // TODO: Send via BLEService
        // try await bleService.sendDirectMessage(to: peerID, content: message.content)
        
        print("[MeshBridge] Direct to \(peerId): \(message.content)")
    }
    
    // MARK: - BLEService Delegate (to be implemented)
    
    /*
    extension MeshBridge: BitchatDelegate {
        func didReceivePublicMessage(_ message: BitchatMessage, from peer: PeerID) {
            let meshMessage = MeshMessage(
                id: message.id,
                type: .public,
                content: message.content,
                sender: peer.shortString,
                timestamp: message.timestamp,
                hopCount: message.hopCount
            )
            messageSubject.send(meshMessage)
        }
        
        func didUpdatePeers(_ peers: [BitchatPeer]) {
            let meshPeers = peers.map { peer in
                MeshPeer(
                    id: peer.peerID.shortString,
                    nickname: peer.nickname,
                    rssi: peer.rssi,
                    lastSeen: peer.lastSeen,
                    hopCount: peer.hopCount
                )
            }
            peersSubject.send(meshPeers)
        }
        
        func didUpdateBluetoothState(_ state: CBManagerState) {
            let status = MeshStatus(
                isEnabled: bleService.isEnabled,
                isScanning: bleService.isScanning,
                isAdvertising: bleService.isAdvertising,
                peerCount: bleService.peerCount,
                bluetoothState: mapBluetoothState(state)
            )
            statusSubject.send(status)
        }
    }
    
    private func mapBluetoothState(_ state: CBManagerState?) -> BluetoothState {
        guard let state = state else { return .unknown }
        switch state {
        case .unknown: return .unknown
        case .resetting: return .resetting
        case .unsupported: return .unsupported
        case .unauthorized: return .unauthorized
        case .poweredOff: return .poweredOff
        case .poweredOn: return .poweredOn
        @unknown default: return .unknown
        }
    }
    */
    
    // MARK: - Test Helpers
    
    #if DEBUG
    /// Simulate receiving a mesh message (for testing)
    func simulateIncomingMessage(content: String, sender: String = "test-peer") {
        let message = MeshMessage(
            type: .public,
            content: content,
            sender: sender
        )
        messageSubject.send(message)
    }
    
    /// Simulate peer discovery (for testing)
    func simulatePeerDiscovery(peers: [MeshPeer]) {
        peersSubject.send(peers)
        var status = statusSubject.value
        status = MeshStatus(
            isEnabled: status.isEnabled,
            isScanning: status.isScanning,
            isAdvertising: status.isAdvertising,
            peerCount: peers.count,
            bluetoothState: status.bluetoothState
        )
        statusSubject.send(status)
    }
    
    /// Simulate Bluetooth state change (for testing)
    func simulateBluetoothState(_ state: BluetoothState) {
        let status = MeshStatus(
            isEnabled: state == .poweredOn,
            isScanning: state == .poweredOn,
            isAdvertising: state == .poweredOn,
            peerCount: peersSubject.value.count,
            bluetoothState: state
        )
        statusSubject.send(status)
    }
    #endif
}
