'use cache'

import { getMe } from './api'

export async function getCachedUser(token: string) {
  if (!token || token.trim().length === 0) return null

  try {
    const { user } = await getMe(token)
    return user
  } catch {
    return null
  }
}
