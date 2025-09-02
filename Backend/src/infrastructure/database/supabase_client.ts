import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL as string || 'https://ocfezguxhaypocptqypa.supabase.co',
  process.env.SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZmV6Z3V4aGF5cG9jcHRxeXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDM2OTYsImV4cCI6MjA3MjA3OTY5Nn0.bIMkeCsfJ6yR5TrCnHhe6w8e3-gmbJEjrAW7Aea_pyU'
);

