-- Add link_url column to notifications table for navigation
ALTER TABLE public.notifications 
ADD COLUMN link_url TEXT;