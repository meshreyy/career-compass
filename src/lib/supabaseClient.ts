import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://crumghhbmjqmgqmmdgel.supabase.co"; // ✅ FIXED
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydW1naGhibWpxbWdxbW1kZ2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODg4NDIsImV4cCI6MjA4OTg2NDg0Mn0.Jadce9a4AOlaI2LRdCDZCCkfyYn1x6FZIJH8lf8QG78";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);