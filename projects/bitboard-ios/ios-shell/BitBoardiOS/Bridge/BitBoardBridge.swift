import Foundation
import WebKit
import Combine

/// BitBoardBridge
/// Handles communication between the WKWebView (BitBoard React app) and native Swift services
final class BitBoardBridge: NSObject, WKScriptMessageHandler {
    
    // MARK: - Dependencies
    
    private weak var webView: WKWebView?
    private let meshBridge: MeshBridge
    private let locationBridge: LocationBridge
    
    // MARK: - State
    
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(meshBridge: MeshBridge, locationBridge: LocationBridge) {
        self.meshBridge = meshBridge
        self.locationBridge = locationBridge
        super.init()
        setupSubscriptions()
    }
    
    func attach(to webView: WKWebView) {
        self.webView = webView
        webView.configuration.userContentController.add(self, name: "bitboard")
        injectBridgeScript()
    }
    
    // MARK: - WKScriptMessageHandler
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let messageId = body["id"] as? String,
              let action = body["action"] as? String else {
            print("[Bridge] Invalid message format")
            return
        }
        
        let payload = body["payload"] as? [String: Any] ?? [:]
        
        Task {
            do {
                let result = try await handleAction(action, payload: payload)
                await resolvePromise(id: messageId, result: result)
            } catch {
                await rejectPromise(id: messageId, error: error.localizedDescription)
            }
        }
    }
    
    // MARK: - Action Routing
    
    private func handleAction(_ action: String, payload: [String: Any]) async throws -> Any? {
        switch action {
        // Mesh actions
        case "mesh.getStatus":
            return meshBridge.getStatus().toDictionary()
            
        case "mesh.getPeers":
            return meshBridge.getPeers().map { $0.toDictionary() }
            
        case "mesh.broadcast":
            guard let content = payload["content"] as? String else {
                throw BridgeError.invalidPayload("Missing content for broadcast")
            }
            let message = MeshMessage(
                type: .public,
                content: content,
                boardId: payload["boardId"] as? String,
                parentId: payload["parentId"] as? String,
                tags: payload["tags"] as? [String]
            )
            try await meshBridge.broadcast(message)
            return nil
            
        case "mesh.sendDirect":
            guard let peerId = payload["peerId"] as? String,
                  let msgPayload = payload["message"] as? [String: Any],
                  let content = msgPayload["content"] as? String else {
                throw BridgeError.invalidPayload("Missing peerId or content for direct message")
            }
            let message = MeshMessage(
                type: .direct,
                content: content,
                boardId: msgPayload["boardId"] as? String,
                parentId: msgPayload["parentId"] as? String,
                tags: msgPayload["tags"] as? [String]
            )
            try await meshBridge.sendDirect(to: peerId, message: message)
            return nil
            
        // Location actions
        case "location.getCurrentPosition":
            let position = try await locationBridge.getCurrentPosition()
            return position.toDictionary()
            
        case "location.getCurrentGeohash":
            let precision = payload["precision"] as? Int ?? 6
            return try await locationBridge.getCurrentGeohash(precision: precision)
            
        // App actions
        case "app.hapticFeedback":
            let style = payload["style"] as? String ?? "light"
            hapticFeedback(style: style)
            return nil
            
        default:
            throw BridgeError.unknownAction(action)
        }
    }
    
    // MARK: - JavaScript Communication
    
    private func injectBridgeScript() {
        // Inject minimal script to set up window._bitboardResolve and _bitboardCallback
        let script = """
        window._bitboardResolve = window._bitboardResolve || function(id, result, error) {
            console.log('[NativeBridge] Resolve:', id, result, error);
        };
        window._bitboardCallback = window._bitboardCallback || function(name, ...args) {
            console.log('[NativeBridge] Callback:', name, args);
        };
        console.log('[NativeBridge] Native bridge ready');
        """
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
    
    @MainActor
    private func resolvePromise(id: String, result: Any?) {
        let resultJSON: String
        if let result = result {
            if let data = try? JSONSerialization.data(withJSONObject: result),
               let json = String(data: data, encoding: .utf8) {
                resultJSON = json
            } else {
                resultJSON = "null"
            }
        } else {
            resultJSON = "null"
        }
        
        let script = "window._bitboardResolve('\(id)', \(resultJSON), null)"
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
    
    @MainActor
    private func rejectPromise(id: String, error: String) {
        let escapedError = error.replacingOccurrences(of: "'", with: "\\'")
        let script = "window._bitboardResolve('\(id)', null, '\(escapedError)')"
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
    
    @MainActor
    private func sendCallback(_ name: String, args: [Any]) {
        let argsJSON: String
        if let data = try? JSONSerialization.data(withJSONObject: args),
           let json = String(data: data, encoding: .utf8) {
            // Remove outer brackets since we spread args
            argsJSON = String(json.dropFirst().dropLast())
        } else {
            argsJSON = ""
        }
        
        let script = "window._bitboardCallback('\(name)', \(argsJSON))"
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
    
    // MARK: - Native Event Subscriptions
    
    private func setupSubscriptions() {
        // Forward mesh messages to JavaScript
        meshBridge.onMessage
            .receive(on: DispatchQueue.main)
            .sink { [weak self] message in
                self?.sendCallback("mesh.message", args: [message.toDictionary()])
            }
            .store(in: &cancellables)
        
        // Forward peer changes to JavaScript
        meshBridge.onPeersChanged
            .receive(on: DispatchQueue.main)
            .sink { [weak self] peers in
                self?.sendCallback("mesh.peerChange", args: [peers.map { $0.toDictionary() }])
            }
            .store(in: &cancellables)
        
        // Forward status changes to JavaScript
        meshBridge.onStatusChanged
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                self?.sendCallback("mesh.statusChange", args: [status.toDictionary()])
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Haptics
    
    private func hapticFeedback(style: String) {
        #if os(iOS)
        let generator: UIImpactFeedbackGenerator
        switch style {
        case "heavy":
            generator = UIImpactFeedbackGenerator(style: .heavy)
        case "medium":
            generator = UIImpactFeedbackGenerator(style: .medium)
        default:
            generator = UIImpactFeedbackGenerator(style: .light)
        }
        generator.impactOccurred()
        #endif
    }
}

// MARK: - Errors

enum BridgeError: LocalizedError {
    case invalidPayload(String)
    case unknownAction(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidPayload(let msg): return "Invalid payload: \(msg)"
        case .unknownAction(let action): return "Unknown action: \(action)"
        }
    }
}

// MARK: - Dictionary Conversion

extension MeshStatus {
    func toDictionary() -> [String: Any] {
        [
            "isEnabled": isEnabled,
            "isScanning": isScanning,
            "isAdvertising": isAdvertising,
            "peerCount": peerCount,
            "bluetoothState": bluetoothState.rawValue
        ]
    }
}

extension MeshPeer {
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "lastSeen": Int(lastSeen.timeIntervalSince1970 * 1000)
        ]
        if let nickname = nickname { dict["nickname"] = nickname }
        if let rssi = rssi { dict["rssi"] = rssi }
        if let hopCount = hopCount { dict["hopCount"] = hopCount }
        return dict
    }
}

extension MeshMessage {
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "type": type == .public ? "public" : "direct",
            "content": content,
            "sender": sender,
            "timestamp": Int(timestamp.timeIntervalSince1970 * 1000)
        ]
        if let boardId = boardId { dict["boardId"] = boardId }
        if let parentId = parentId { dict["parentId"] = parentId }
        if let tags = tags { dict["tags"] = tags }
        if let hopCount = hopCount { dict["hopCount"] = hopCount }
        return dict
    }
}

extension Position {
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy,
            "timestamp": Int(timestamp.timeIntervalSince1970 * 1000)
        ]
        if let altitude = altitude { dict["altitude"] = altitude }
        return dict
    }
}
