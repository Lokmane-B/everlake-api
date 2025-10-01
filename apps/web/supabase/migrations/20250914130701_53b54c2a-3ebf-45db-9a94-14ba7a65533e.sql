-- Update existing notifications with appropriate link URLs based on their type and content
UPDATE notifications 
SET link_url = '/appels-offres' 
WHERE type = 'success' 
AND title = 'Appel d''offres publié' 
AND link_url IS NULL;