import SwiftUI
import WebKit

/// BitBoardWebView
/// SwiftUI wrapper around WKWebView that loads the BitBoard React app
struct BitBoardWebView: UIViewRepresentable {
    let bridge: BitBoardBridge
    @Binding var isLoading: Bool
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        
        // Enable JavaScript
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        
        // Allow inline media playback
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // Create WebView
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.bounces = true
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.allowsBackForwardNavigationGestures = true
        
        // Allow inspecting in Safari (debug builds)
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        #endif
        
        // Attach the native bridge
        bridge.attach(to: webView)
        
        // Load BitBoard
        loadBitBoard(in: webView)
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        // Nothing to update
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    // MARK: - Loading
    
    private func loadBitBoard(in webView: WKWebView) {
        #if DEBUG
        // In debug, load from localhost for hot reload
        if let url = URL(string: "http://localhost:3000") {
            webView.load(URLRequest(url: url))
            return
        }
        #endif
        
        // In production, load from bundled assets
        if let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "bitboard-web") {
            webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
        } else {
            // Fallback: show error
            let html = """
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        background: #1a1a1a;
                        color: #f5a623;
                        font-family: monospace;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    h1 { font-size: 24px; }
                    p { opacity: 0.7; }
                </style>
            </head>
            <body>
                <div>
                    <h1>[ ERROR ]</h1>
                    <p>BitBoard web assets not found in bundle.</p>
                    <p>Run `npm run build` and copy dist/ to Xcode project.</p>
                </div>
            </body>
            </html>
            """
            webView.loadHTMLString(html, baseURL: nil)
        }
    }
    
    // MARK: - Coordinator
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: BitBoardWebView
        
        init(_ parent: BitBoardWebView) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.isLoading = true
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.isLoading = false
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.isLoading = false
            print("[WebView] Navigation failed: \(error.localizedDescription)")
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.isLoading = false
            print("[WebView] Provisional navigation failed: \(error.localizedDescription)")
        }
        
        // Handle external links
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            
            // Allow local navigation
            if url.scheme == "file" || url.host == "localhost" {
                decisionHandler(.allow)
                return
            }
            
            // Open external links in Safari
            if navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            
            decisionHandler(.allow)
        }
    }
}

// MARK: - Preview

#if DEBUG
struct BitBoardWebView_Previews: PreviewProvider {
    static var previews: some View {
        BitBoardWebView(
            bridge: BitBoardBridge(
                meshBridge: MeshBridge(),
                locationBridge: LocationBridge()
            ),
            isLoading: .constant(false)
        )
    }
}
#endif
