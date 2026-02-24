import "server-only";

function parseCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function getServerApiBaseUrl() {
  const rawBaseUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

  let parsed: URL;

  try {
    parsed = new URL(rawBaseUrl);
  } catch {
    throw new Error(`Invalid API base URL: ${rawBaseUrl}`);
  }

  const allowedHosts = parseCsv(process.env.API_INTERNAL_ALLOWED_HOSTS);
  const normalizedAllowedHosts = allowedHosts.length > 0 ? allowedHosts : [parsed.host];

  if (!normalizedAllowedHosts.includes(parsed.host)) {
    throw new Error(`API host ${parsed.host} is not in API_INTERNAL_ALLOWED_HOSTS.`);
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("API_INTERNAL_URL must use https in production.");
  }

  return parsed.origin;
}
