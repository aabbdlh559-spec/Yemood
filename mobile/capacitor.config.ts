import type { CapacitorConfig } from "@capacitor/cli";

// The address of the deployed Yemood Worker. It is public (it is the address your friends type),
// so it is read from the environment at build time and never baked into the repository.
const serverUrl = process.env.YEMOOD_SERVER_URL;

if (!serverUrl?.startsWith("https://")) {
  throw new Error(
    "Set YEMOOD_SERVER_URL to the https:// address of the deployed Yemood Worker before building the Android app.",
  );
}

const config: CapacitorConfig = {
  appId: "app.yemood",
  appName: "Yemood",
  // A tiny local page; the app itself is loaded from `server.url`, so the game, the rooms and the
  // WebSocket all run exactly as they do in a browser.
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
    errorPath: "offline.html",
  },
  android: {
    backgroundColor: "#FFF4E0",
    allowMixedContent: false,
  },
  plugins: {
    // Android 16 draws apps edge to edge. MainActivity (see android-overrides) pads the WebView
    // by the system bars itself, so Capacitor's own inset handling is switched off.
    SystemBars: {
      insetsHandling: "disable",
    },
  },
};

export default config;
