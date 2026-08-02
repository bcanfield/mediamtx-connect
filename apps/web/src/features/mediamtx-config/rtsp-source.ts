export interface RtspSourceParts {
  host: string
  port: number
  streamPath: string
  username: string
  password: string
}

/**
 * The `source` URL MediaMTX pulls from, assembled from the parts the guided add
 * asks for. Credentials are percent-encoded: camera passwords routinely contain
 * `@`, `:` and `/`, which would otherwise cut the URL in the wrong place.
 */
export function composeRtspSource({
  host,
  port,
  streamPath,
  username,
  password,
}: RtspSourceParts): string {
  const user = encodeURIComponent(username.trim())
  const credentials = user
    ? password
      ? `${user}:${encodeURIComponent(password)}@`
      : `${user}@`
    : ''
  return `rtsp://${credentials}${host.trim()}:${port}/${streamPath.trim().replace(/^\/+/, '')}`
}

const CREDENTIAL_MASK = '••••••••'

/**
 * The same URL with the password replaced by a fixed-width mask. A composed
 * `source` is shown back twice — on the preview of the URL about to be written,
 * and on the catalog row it lands on — and neither should read a camera's
 * password out. The username stays legible: it says which account the path
 * connects as, and the mask is fixed-width so it doesn't leak the length.
 */
export function maskSourceCredentials(source: string): string {
  return source.replace(/^([a-z][\w+.-]*:\/\/[^@/:]*:)[^@/]*@/i, `$1${CREDENTIAL_MASK}@`)
}
