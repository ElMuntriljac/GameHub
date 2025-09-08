import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lejvofjwxslflucaogui.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlanZvZmp3eHNsZmx1Y2FvZ3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTIzNTYsImV4cCI6MjA2ODE2ODM1Nn0.WKu5_MnYvXzPy-4gOXos7yXONw1aIFEJ_tS2L1C1lsA'

export const supabase = createClient(supabaseUrl, supabaseKey)
