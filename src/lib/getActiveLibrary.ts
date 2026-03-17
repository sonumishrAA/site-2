import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns the currently active library_id for the logged-in user.
 * Reads the `active_library_id` cookie first (set when user switches branch).
 * Falls back to the first library in staff.library_ids if no cookie is set.
 * Also validates that the cookie value actually belongs to the user.
 */
export async function getActiveLibraryId(userId: string, libraryIds: string[]): Promise<string | null> {
  if (!libraryIds || libraryIds.length === 0) return null

  const cookieStore = await cookies()
  const cookieLibId = cookieStore.get('active_library_id')?.value

  // If cookie is set and belongs to this user's libraries, use it
  if (cookieLibId && libraryIds.includes(cookieLibId)) {
    return cookieLibId
  }

  // Default to first library
  return libraryIds[0]
}
