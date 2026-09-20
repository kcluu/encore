const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const SCOPES = ['user-read-recently-played']

const VERIFIER_KEY = 'spotify_pkce_verifier'
const STATE_KEY = 'spotify_pkce_state'

export interface SpotifyTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
}

const base64UrlEncode = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const randomString = (length: number): string => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

const sha256 = async (input: string): Promise<Uint8Array> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return new Uint8Array(digest)
}

const getClientId = (): string => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID

  if (!clientId) {
    throw new Error(
      'Missing VITE_SPOTIFY_CLIENT_ID. Create an app at developer.spotify.com/dashboard and set it in a .env file (see .env.example).'
    )
  }

  return clientId
}

const getRedirectUri = (): string => {
  return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + window.location.pathname
}

export const redirectToSpotifyAuthorize = async (): Promise<void> => {
  const clientId = getClientId()
  const verifier = randomString(64)
  const state = randomString(16)
  const challenge = base64UrlEncode(await sha256(verifier))

  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES.join(' '),
    state,
  })

  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`)
}

// Reads ?code/&state/&error off the current URL, if Spotify just redirected back here
export const readAuthorizeCallback = (): { code: string; state: string } | null => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    clearCallbackParams()
    throw new Error(`Spotify sign-in was cancelled (${error}).`)
  }

  if (!code || !state) return null

  return { code, state }
}

export const clearCallbackParams = (): void => {
  const url = new URL(window.location.href)

  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')

  window.history.replaceState({}, '', url.toString())
}

// Exchanges the ?code for an access token, checking the PKCE verifier + state match
export const completeSpotifyAuthorize = async (code: string, state: string): Promise<SpotifyTokens> => {
  const expectedState = sessionStorage.getItem(STATE_KEY)
  const verifier = sessionStorage.getItem(VERIFIER_KEY)

  sessionStorage.removeItem(STATE_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)

  if (!verifier || !expectedState || state !== expectedState) {
    throw new Error('Spotify sign-in state mismatch — please try connecting again.')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: getClientId(),
    code_verifier: verifier,
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error('Spotify token exchange failed — please try connecting again.')
  }

  const json = await res.json()

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
}
