import { createClient } from '@supabase/supabase-js'

// Public publishable key: safe in the browser because every table is behind RLS.
// providers = approved listings (read-only, no contact data)
// provider_applications + requests = insert-only intake, unreadable publicly
export const supabase = createClient(
  'https://onkgmkghuskjllkkteee.supabase.co',
  'sb_publishable_8B3wWz1svUXS6lc2JVhp3Q_b7QP-QIz',
)
