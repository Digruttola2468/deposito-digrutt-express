import { createClient } from '@supabase/supabase-js'
import { SUPABASE_KEY } from '../config.js'

export const db_supabase = createClient('https://bbpwzetypbcxsollgsla.supabase.co', SUPABASE_KEY)