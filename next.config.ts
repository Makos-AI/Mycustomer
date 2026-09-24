import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Empty turbopack object silences the warning if serwist's plugin still tries to inject webpack config
  turbopack: {},
};

export default withSerwist(nextConfig);
