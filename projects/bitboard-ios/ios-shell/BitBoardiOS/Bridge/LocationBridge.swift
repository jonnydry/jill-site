import Foundation
import CoreLocation

// MARK: - Types

struct Position {
    let latitude: Double
    let longitude: Double
    let accuracy: Double
    let altitude: Double?
    let timestamp: Date
}

// MARK: - LocationBridge

/// LocationBridge wraps CoreLocation and provides geohash encoding
final class LocationBridge: NSObject {
    
    private let locationManager = CLLocationManager()
    private var pendingLocationRequests: [(Result<Position, Error>) -> Void] = []
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    // MARK: - Public API
    
    func getCurrentPosition() async throws -> Position {
        // Check authorization
        let status = locationManager.authorizationStatus
        switch status {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
            // Wait briefly for user to respond
            try await Task.sleep(nanoseconds: 500_000_000)
            return try await getCurrentPosition()
            
        case .restricted, .denied:
            throw LocationError.permissionDenied
            
        case .authorizedAlways, .authorizedWhenInUse:
            break
            
        @unknown default:
            break
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            pendingLocationRequests.append { result in
                continuation.resume(with: result)
            }
            locationManager.requestLocation()
        }
    }
    
    func getCurrentGeohash(precision: Int = 6) async throws -> String {
        let position = try await getCurrentPosition()
        return Geohash.encode(latitude: position.latitude, longitude: position.longitude, precision: precision)
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationBridge: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        let position = Position(
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude,
            accuracy: location.horizontalAccuracy,
            altitude: location.altitude,
            timestamp: location.timestamp
        )
        
        // Resolve all pending requests
        let requests = pendingLocationRequests
        pendingLocationRequests.removeAll()
        requests.forEach { $0(.success(position)) }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let requests = pendingLocationRequests
        pendingLocationRequests.removeAll()
        requests.forEach { $0(.failure(error)) }
    }
}

// MARK: - Errors

enum LocationError: LocalizedError {
    case permissionDenied
    case locationUnavailable
    
    var errorDescription: String? {
        switch self {
        case .permissionDenied: return "Location permission denied"
        case .locationUnavailable: return "Location unavailable"
        }
    }
}

// MARK: - Geohash Encoder

/// Pure Swift geohash implementation (no external dependencies)
enum Geohash {
    private static let base32 = Array("0123456789bcdefghjkmnpqrstuvwxyz")
    
    static func encode(latitude: Double, longitude: Double, precision: Int = 6) -> String {
        var latRange = (-90.0, 90.0)
        var lonRange = (-180.0, 180.0)
        var hash = ""
        var bits = 0
        var currentChar = 0
        var isEven = true
        
        while hash.count < precision {
            if isEven {
                let mid = (lonRange.0 + lonRange.1) / 2
                if longitude >= mid {
                    currentChar |= (1 << (4 - bits))
                    lonRange.0 = mid
                } else {
                    lonRange.1 = mid
                }
            } else {
                let mid = (latRange.0 + latRange.1) / 2
                if latitude >= mid {
                    currentChar |= (1 << (4 - bits))
                    latRange.0 = mid
                } else {
                    latRange.1 = mid
                }
            }
            isEven.toggle()
            bits += 1
            
            if bits == 5 {
                hash.append(base32[currentChar])
                bits = 0
                currentChar = 0
            }
        }
        
        return hash
    }
    
    static func decode(_ hash: String) -> (latitude: Double, longitude: Double)? {
        var latRange = (-90.0, 90.0)
        var lonRange = (-180.0, 180.0)
        var isEven = true
        
        for char in hash.lowercased() {
            guard let index = base32.firstIndex(of: char) else { return nil }
            let bits = index
            
            for i in (0..<5).reversed() {
                let bit = (bits >> i) & 1
                if isEven {
                    let mid = (lonRange.0 + lonRange.1) / 2
                    if bit == 1 {
                        lonRange.0 = mid
                    } else {
                        lonRange.1 = mid
                    }
                } else {
                    let mid = (latRange.0 + latRange.1) / 2
                    if bit == 1 {
                        latRange.0 = mid
                    } else {
                        latRange.1 = mid
                    }
                }
                isEven.toggle()
            }
        }
        
        return (
            latitude: (latRange.0 + latRange.1) / 2,
            longitude: (lonRange.0 + lonRange.1) / 2
        )
    }
}
