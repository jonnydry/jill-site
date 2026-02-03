# BitBoard iOS Shell

Native iOS wrapper for BitBoard with Bluetooth mesh networking.

## Structure

```
BitBoardiOS/
├── BitBoardApp.swift           # App entry point
├── ContentView.swift           # Main view (WebView + native status UI)
├── Bridge/
│   ├── BitBoardBridge.swift    # WKScriptMessageHandler (JS ↔ Swift)
│   ├── MeshBridge.swift        # BLE mesh interface (wraps BLEService)
│   └── LocationBridge.swift    # CoreLocation + geohash
└── WebView/
    └── BitBoardWebView.swift   # WKWebView configuration
```

## Setup

### 1. Create Xcode Project

```bash
# Open Xcode → File → New → Project
# Choose: iOS App
# Product Name: BitBoardiOS
# Interface: SwiftUI
# Language: Swift
```

### 2. Copy Source Files

Copy all `.swift` files from this directory into your Xcode project.

### 3. Copy Bitchat Services

From `bitchat-native/bitchat/`, copy these directories to your project:
- `Services/BLE/` (the core mesh networking)
- `Noise/` (encryption)
- `Models/` (BitchatPacket, PeerID, etc.)
- `Utils/` (helpers)

### 4. Add Dependencies

In Xcode, go to File → Add Package Dependencies:
- `https://github.com/nicklockwood/LRUCache` (used by Bitchat)

Or use Swift Package Manager in `Package.swift`.

### 5. Configure Info.plist

Add these keys for Bluetooth and Location:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>BitBoard uses Bluetooth to connect with nearby users for mesh messaging.</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>BitBoard uses Bluetooth to connect with nearby users for mesh messaging.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>BitBoard uses your location for geo-tagged channels.</string>

<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
</array>
```

### 6. Build BitBoard Web

```bash
cd ../bitboard-web
npm install
npm run build
```

### 7. Add Web Assets to Xcode

1. In Xcode, right-click your project → Add Files
2. Select `bitboard-web/dist` folder
3. Rename to `bitboard-web` in the project
4. Ensure "Copy items if needed" is checked
5. Add to target: BitBoardiOS

### 8. Connect BLEService

The `MeshBridge.swift` has TODO comments showing where to integrate with Bitchat's `BLEService.swift`. You need to:

1. Import `BLEService` in `MeshBridge.swift`
2. Initialize it in `MeshBridge.init()`
3. Implement the `BitchatDelegate` protocol
4. Forward events to the Combine publishers

See the commented code in `MeshBridge.swift` for the exact integration points.

## Development

### Hot Reload (Debug)

In debug builds, the WebView loads from `localhost:3000`. Run:

```bash
cd ../bitboard-web
npm run dev
```

Then build and run the iOS app in Xcode. Changes to the web code will hot reload.

### Safari Web Inspector

1. Enable Web Inspector on device: Settings → Safari → Advanced → Web Inspector
2. Connect device to Mac
3. In Safari: Develop → [Device Name] → localhost

## Architecture

```
┌─────────────────────────────────────────┐
│           iOS App                        │
│  ┌───────────────────────────────────┐  │
│  │  Native Swift                      │  │
│  │  • MeshBridge → BLEService        │  │
│  │  • LocationBridge → CoreLocation  │  │
│  └──────────────┬────────────────────┘  │
│                 │ WKScriptMessageHandler │
│  ┌──────────────▼────────────────────┐  │
│  │  WKWebView                         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  BitBoard React App          │  │  │
│  │  │  window.BitBoardNative.*     │  │  │
│  │  └─────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `BitBoardBridge.swift` | Routes JS calls to native, sends events back |
| `MeshBridge.swift` | Wraps BLEService, manages peer state |
| `LocationBridge.swift` | CoreLocation + pure Swift geohash encoder |
| `nativeBridge.ts` (web) | TypeScript API for calling native from React |

## License

BitBoard and Bitchat are both public domain.
