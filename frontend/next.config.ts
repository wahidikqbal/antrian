import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";
const reverbPort = process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080";
const reverbScheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
const reverbHttpUrl = `${reverbScheme}://${reverbHost}:${reverbPort}`;
const reverbWsUrl = `${reverbScheme === "https" ? "wss" : "ws"}://${reverbHost}:${reverbPort}`;
const fallbackReverbHttpUrl = `${reverbScheme}://${reverbHost}:8080`;
const fallbackReverbWsUrl = `${reverbScheme === "https" ? "wss" : "ws"}://${reverbHost}:8080`;
const connectSrcValues = Array.from(
  new Set([apiBaseUrl, reverbHttpUrl, reverbWsUrl, fallbackReverbHttpUrl, fallbackReverbWsUrl]),
).join(" ");
const isProduction = process.env.NODE_ENV === "production";
const scriptSrc = isProduction
  ? "script-src 'self'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  scriptSrc,
  `connect-src 'self' ${connectSrcValues}`,
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
