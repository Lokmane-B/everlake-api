import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Contact {
  id: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  sector: string | null;
  location: string | null;
  notes: string | null;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts((data || []).map(contact => ({
        ...contact,
        tags: Array.isArray(contact.tags) ? contact.tags.filter((tag): tag is string => typeof tag === 'string') : []
      })));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('created_by', user?.id);

      if (error) throw error;
      
      // Update local state
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  };

  return {
    contacts,
    loading,
    refetch: fetchContacts,
    deleteContact
  };
}