from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL") or 'https://ocfezguxhaypocptqypa.supabase.co'
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZmV6Z3V4aGF5cG9jcHRxeXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDM2OTYsImV4cCI6MjA3MjA3OTY5Nn0.bIMkeCsfJ6yR5TrCnHhe6w8e3-gmbJEjrAW7Aea_pyU'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
