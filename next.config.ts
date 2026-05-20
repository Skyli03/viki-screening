import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Alias @mediapipe/face_mesh to a stub — we use runtime:"tfjs" so mediapipe is never called
  turbopack: {
    resolveAlias: {
      "@mediapipe/face_mesh": "./lib/mediapipe-stub.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@mediapipe/face_mesh": path.resolve("./lib/mediapipe-stub.js"),
    };
    return config;
  },
};

export default nextConfig;
