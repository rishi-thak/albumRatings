# database.py
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# --- Your Supabase project info ---
SUPABASE_URL = "https://qbiewszsvabezpoarafz.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_KEY in environment variables")

# --- Create Supabase client ---
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Connected to Supabase:", SUPABASE_URL)
