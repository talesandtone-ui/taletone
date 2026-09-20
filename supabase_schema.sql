-- ==============================================================================
-- TALES & TONE — SUPABASE CONTACT FORM & ADMIN DATABASE SETUP
-- Project: https://tyesjcqfhtidkvpyyktc.supabase.co
-- ==============================================================================
-- Instructions:
-- 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard/project/tyesjcqfhtidkvpyyktc
-- 2. Click on "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste ALL the SQL below, and click "Run".
-- ==============================================================================

-- 1. Create the `contacts` table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'archived')),
  notes TEXT DEFAULT ''
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public visitors on the website to submit contact forms
DROP POLICY IF EXISTS "Allow public submissions" ON public.contacts;
CREATE POLICY "Allow public submissions"
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow Admin Panel to view all inquiries
DROP POLICY IF EXISTS "Allow select for admin and anon" ON public.contacts;
CREATE POLICY "Allow select for admin and anon"
ON public.contacts
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Policy: Allow Admin Panel to update status and notes
DROP POLICY IF EXISTS "Allow update for admin and anon" ON public.contacts;
CREATE POLICY "Allow update for admin and anon"
ON public.contacts
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Policy: Allow Admin Panel to delete inquiries
DROP POLICY IF EXISTS "Allow delete for admin and anon" ON public.contacts;
CREATE POLICY "Allow delete for admin and anon"
ON public.contacts
FOR DELETE
TO anon, authenticated
USING (true);

-- 7. Insert a sample initial inquiry so the Admin Panel shows data immediately
INSERT INTO public.contacts (name, email, service, message, status, notes)
VALUES (
  'Pooja Sharma',
  'pooja@example.com',
  'Website Content',
  'Hello Dharsi! We are revamping our startup website and loved your Tales & Tone portfolio. Looking for 4 core pages (Home, About, Services, Contact).',
  'new',
  'Lead received from website contact form'
);

-- Verify table creation
SELECT * FROM public.contacts ORDER BY created_at DESC LIMIT 5;
