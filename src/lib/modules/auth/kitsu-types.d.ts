export interface KitsuOAuth {
  access_token: string
  created_at: number
  expires_in: number // Seconds until the access_token expires (30 days default)
  refresh_token: string
  scope: string
  token_type: string
}
