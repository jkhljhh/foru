// config.js — Supabase connection
const SB_URL = 'https://bwsnfcfximnvzvjsckyb.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c25mY2Z4aW1udnp2anNja3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU1MDMsImV4cCI6MjA4ODgxMTUwM30.MT3lvo0U6sNqK-gwGGqc6k_3fxRl0mUetHLdune1LgQ';
const sb = supabase.createClient(SB_URL, SB_KEY);
