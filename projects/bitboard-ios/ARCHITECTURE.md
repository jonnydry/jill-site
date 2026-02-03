# BitBoard iOS - Hybrid Architecture

## Overview

BitBoard iOS combines:
- **BitBoard Web** (React/Vite) - The terminal-styled UI
- **Bitchat Native** (Swift) - Bluetooth mesh + Nostr dual transport

```
┌─────────────────────────────────────────────────────────────────┐
│                     BitBoard iOS App                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Native Swift Layer                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │ BLEService  │ │NostrService │ │ LocationManager     │  │  │
│  │  │ (210KB)     │ │ (from       │ │ (CoreLocation)      │  │  │
│  │  │             │ │ Bitchat)    │ │                     │  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘  │  │
│  │         │               │                   │              │  │
│  │  ┌──────▼───────────────▼───────────────────▼──────────┐  │  │
│  │  │              BitBoardBridge.swift                    │  │  │
│  │  │  - Exposes native APIs to JavaScript                 │  │  │
│  │  │  - Handles message routing (mesh vs nostr)           │  │  │
│  │  │  - Manages peer state                                │  │  │
│  │  └──────────────────────┬──────────────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │ WKScriptMessageHandler             │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │                     WKWebView                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              BitBoard React App                      │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │           window.BitBoardNative              │    │  │  │
│  │  │  │  - mesh.broadcast(msg)                       │    │  │  │
│  │  │  │  - mesh.onMessage(cb)                        │    │  │  │
│  │  │  │  - mesh.getPeers()                           │    │  │  │
│  │  │  │  - mesh.getStatus()                          │    │  │  │
│  │  │  │  - location.getCurrentGeohash()              │    │  │  │
│  │  │  │  - nostr.publish(event) / subscribe(filter)  │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  │                                                      │  │  │
│  │  │  Existing services call window.BitBoardNative       │  │  │
│  │  │  instead of direct Nostr when mesh is available     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## JavaScript Bridge API

The native layer exposes `window.BitBoardNative` to the WebView:

```typescript
interface BitBoardNative {
  // Mesh (Bluetooth) Transport
  mesh: {
    getStatus(): Promise<MeshStatus>;
    getPeers(): Promise<MeshPeer[]>;
    broadcast(message: MeshMessage): Promise<void>;
    sendDirect(peerId: string, message: MeshMessage): Promise<void>;
    onMessage(callback: (msg: MeshMessage) => void): void;
    onPeerChange(callback: (peers: MeshPeer[]) => void): void;
    onStatusChange(callback: (status: MeshStatus) => void): void;
  };
  
  // Location (native CoreLocation)
  location: {
    getCurrentPosition(): Promise<Position>;
    getCurrentGeohash(precision?: number): Promise<string>;
    watchPosition(callback: (pos: Position) => void): number;
    clearWatch(id: number): void;
  };
  
  // Nostr (native relay management)
  nostr: {
    publish(event: NostrEvent): Promise<void>;
    subscribe(filters: NostrFilter[], callback: (event: NostrEvent) => void): string;
    unsubscribe(subId: string): void;
    getRelayStatus(): Promise<RelayStatus[]>;
  };
  
  // App lifecycle
  app: {
    getPlatform(): 'ios' | 'macos';
    getVersion(): string;
    hapticFeedback(style: 'light' | 'medium' | 'heavy'): void;
  };
}

interface MeshStatus {
  isEnabled: boolean;
  isScanning: boolean;
  isAdvertising: boolean;
  peerCount: number;
  bluetoothState: 'unknown' | 'resetting' | 'unsupported' | 'unauthorized' | 'poweredOff' | 'poweredOn';
}

interface MeshPeer {
  id: string;           // Short peer ID
  nickname?: string;
  rssi?: number;        // Signal strength
  lastSeen: number;     // Unix timestamp
  hopCount?: number;    // How many hops away
}

interface MeshMessage {
  id: string;
  type: 'public' | 'direct';
  content: string;
  sender: string;
  timestamp: number;
  hopCount?: number;
}
```

## Message Flow

### Sending a Post (BitBoard → Mesh/Nostr)

```
1. User creates post in BitBoard UI
2. PostsContext calls meshAwarePublish()
3. meshAwarePublish checks:
   - If mesh enabled + peers nearby → broadcast via mesh.broadcast()
   - Always → publish to Nostr relays via nostr.publish()
4. Native bridge receives:
   - mesh.broadcast → BLEService.broadcastMessage()
   - nostr.publish → NostrService.publish()
```

### Receiving a Post (Mesh/Nostr → BitBoard)

```
1. Native layer receives message:
   - BLEService delegate → didReceivePublicMessage
   - NostrService → event received
2. Bridge calls JavaScript callback:
   - window.BitBoardNative._onMeshMessage(msg)
   - window.BitBoardNative._onNostrEvent(event)
3. BitBoard PostsContext receives and deduplicates
4. UI updates
```

## Files to Create/Modify

### New Native Files (in Xcode project)
```
BitBoardiOS/
├── BitBoardApp.swift           # App entry point
├── ContentView.swift           # Main view with WebView
├── Bridge/
│   ├── BitBoardBridge.swift    # WKScriptMessageHandler
│   ├── MeshBridge.swift        # BLE mesh interface
│   ├── NostrBridge.swift       # Nostr interface
│   └── LocationBridge.swift    # CoreLocation interface
├── WebView/
│   ├── BitBoardWebView.swift   # WKWebView configuration
│   └── WebViewCoordinator.swift
└── Services/                   # Copied from Bitchat
    ├── BLE/
    │   └── BLEService.swift
    ├── Nostr/
    └── ...
```

### BitBoard Web Modifications
```
bitboard-web/
├── services/
│   ├── nativeBridge.ts         # NEW: window.BitBoardNative wrapper
│   └── transportService.ts     # NEW: mesh + nostr routing
├── hooks/
│   └── useNativeBridge.ts      # NEW: React hook for bridge
└── index.html                  # Modified: inject bridge detection
```

## Build Process

1. **Web Build**: `npm run build` in bitboard-web → produces `dist/`
2. **Copy to iOS**: `dist/` copied to Xcode project bundle
3. **iOS Build**: Xcode builds native app, WebView loads from bundle

## Development Workflow

- **Web-only dev**: `npm run dev` in bitboard-web (no mesh, uses mock)
- **iOS dev**: Xcode, hot-reload WebView from localhost:3000
- **Production**: Bundled web assets in iOS app

## Key Decisions

1. **WebView over React Native**: Preserves exact BitBoard UI, faster iteration
2. **Native mesh over JS bridge**: BLE requires native APIs, can't be done in web
3. **Dual transport**: Both mesh AND Nostr (like Bitchat), mesh is local bonus
4. **Public domain license**: Can freely use Bitchat code

## Next Steps

1. [ ] Create Xcode project shell
2. [ ] Copy BLEService + dependencies from Bitchat
3. [ ] Implement BitBoardBridge.swift
4. [ ] Build bitboard-web with bridge detection
5. [ ] Create nativeBridge.ts wrapper
6. [ ] Test mesh broadcast/receive
7. [ ] Polish UI (status indicators, peer list)
