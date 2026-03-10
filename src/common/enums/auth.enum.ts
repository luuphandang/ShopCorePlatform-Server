export enum ECookieType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export enum ETokenHeader {
  AUTHORIZATION = 'authorization',
  REFRESH_TOKEN = 'x-refresh-token',
  BEARER_PREFIX = 'Bearer ',
}

export enum EJwtErrorType {
  INVALID = 'invalid token',
  EMPTY = 'jwt must be provided',
}
