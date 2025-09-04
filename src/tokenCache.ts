interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

interface TokenCache {
  strava?: TokenData | undefined;
  whoop?: TokenData | undefined;
}

const tokenCache: TokenCache = {};

export function setStravaToken(accessToken: string, refreshToken: string, expiresAt?: number) {
  tokenCache.strava = {
    access_token: accessToken,
    refresh_token: refreshToken,
    ...(expiresAt !== undefined && { expires_at: expiresAt })
  };
}

export function setWhoopToken(accessToken: string, refreshToken: string, expiresAt?: number) {
  tokenCache.whoop = {
    access_token: accessToken,
    refresh_token: refreshToken,
    ...(expiresAt !== undefined && { expires_at: expiresAt })
  };
}

export function getStravaToken(): string | null {
  return tokenCache.strava?.access_token || process.env.STRAVA_ACCESS_TOKEN || null;
}

export function getWhoopToken(): string | null {
  return tokenCache.whoop?.access_token || process.env.WHOOP_ACCESS_TOKEN || null;
}

export function clearTokens() {
  tokenCache.strava = undefined;
  tokenCache.whoop = undefined;
}