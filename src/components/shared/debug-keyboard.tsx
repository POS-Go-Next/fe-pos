// components/shared/debug-keyboard.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";

interface DebugKeyboardProps {
  enabled?: boolean;
}

const DebugKeyboard: React.FC<DebugKeyboardProps> = ({ enabled = false }) => {
  const [lastKey, setLastKey] = useState<string>("");
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [isMac, setIsMac] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ Safe client-side initialization
  useEffect(() => {
    setIsClient(true);

    // ✅ Safe navigator access after client mount
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsMac(navigator.platform.includes("Mac"));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isClient) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const info = {
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        platform:
          typeof navigator !== "undefined" ? navigator.platform : "Unknown",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        timestamp: new Date().toLocaleTimeString(),
      };

      setLastKey(event.key);
      setKeyInfo(info);

      console.log("🎹 Key pressed:", info);

      // Special highlight for F4 combinations
      if (event.key === "F4" || event.code === "F4") {
        console.log("🔥 F4 PRESSED!", {
          withCtrl: event.ctrlKey,
          withCmd: event.metaKey,
          platform:
            typeof navigator !== "undefined" ? navigator.platform : "Unknown",
          keyCode: event.keyCode,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "F4" || event.code === "F4") {
        console.log("🔥 F4 KEY UP!", {
          key: event.key,
          code: event.code,
          keyCode: event.keyCode,
          withCtrl: event.ctrlKey,
          withCmd: event.metaKey,
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, isClient]);

  // ✅ Don't render until client-side hydration is complete
  if (!enabled || !isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50 border border-white/20">
      <h4 className="font-bold mb-2 text-yellow-400">🎹 Keyboard Debug</h4>

      {/* Mac Instructions */}
      {isMac && (
        <div className="mb-3 p-2 bg-red-900/50 rounded border border-red-500/50">
          <p className="text-red-300 font-bold text-xs mb-1">
            ⚠️ MAC SETUP REQUIRED:
          </p>
          <p className="text-red-200 text-xs">
            1. System Preferences → Keyboard
            <br />
            2. Check "Use F1, F2, etc. keys as standard function keys"
            <br />
            3. OR hold <strong>fn</strong> key while pressing F4
          </p>
        </div>
      )}

      <p>
        <strong>Last Key:</strong>{" "}
        <span className="text-green-400">{lastKey}</span>
      </p>
      {keyInfo && (
        <div className="mt-2 space-y-1">
          <p>
            <strong>Code:</strong>{" "}
            <span className="text-blue-400">{keyInfo.code}</span>
          </p>
          <p>
            <strong>KeyCode:</strong>{" "}
            <span className="text-blue-400">{keyInfo.keyCode}</span>
          </p>
          <p>
            <strong>Ctrl:</strong> {keyInfo.ctrlKey ? "✅" : "❌"}
          </p>
          <p>
            <strong>Cmd:</strong> {keyInfo.metaKey ? "✅" : "❌"}
          </p>
          <p>
            <strong>Alt:</strong> {keyInfo.altKey ? "✅" : "❌"}
          </p>
          <p>
            <strong>Shift:</strong> {keyInfo.shiftKey ? "✅" : "❌"}
          </p>
          <p>
            <strong>Platform:</strong>{" "}
            <span className="text-purple-400">{keyInfo.platform}</span>
          </p>
          <p>
            <strong>Time:</strong> {keyInfo.timestamp}
          </p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-300 border-t border-white/20 pt-2">
        <p className="font-bold text-yellow-400">
          🎯 MULTIPLE SHORTCUTS AVAILABLE:
        </p>
        <p>
          • <strong>{isMac ? "Cmd+fn+F4" : "Ctrl+F4"}</strong> (Primary)
        </p>
        <p>
          • <strong>{isMac ? "Cmd+D" : "Ctrl+D"}</strong> (Easy alternative)
        </p>
        <p>
          • <strong>{isMac ? "Cmd+Delete" : "Ctrl+Delete"}</strong> (Delete key)
        </p>
        {isMac && (
          <p className="text-yellow-300 mt-1">💡 Try Cmd+D - easier on Mac!</p>
        )}
      </div>

      {/* Connection status */}
      <div className="mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400">Hook Active</span>
        </div>
      </div>
    </div>
  );
};

export default DebugKeyboard;
