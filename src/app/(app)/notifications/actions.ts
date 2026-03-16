'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAllNotificationsRead(libraryId: string) {
  const adminClient = createAdminClient()
  
  await adminClient
    .from('notifications')
    .update({ is_read: true })
    .eq('library_id', libraryId)
    .eq('is_read', false)

  revalidatePath('/notifications')
  revalidatePath('/')
}
