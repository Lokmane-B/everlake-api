-- Fix security vulnerability: Require authentication to view public marches
-- This prevents competitors from accessing sensitive business information without being logged in

-- Drop the existing policy that allows public access
DROP POLICY IF EXISTS "Anyone can view public marchés" ON marches;

-- Create new policy that requires authentication to view public marches
CREATE POLICY "Authenticated users can view public marchés" 
ON marches 
FOR SELECT 
TO authenticated
USING ((visibility = 'publique'::text) OR (created_by = auth.uid()));

-- Users can still view their own marches regardless of visibility
-- This policy remains unchanged and is already covered above