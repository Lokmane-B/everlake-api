import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface StoredDocument {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  metadata?: {
    mimetype?: string;
    size?: number;
  };
  publicUrl?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // List files in the user's folder in the documents bucket
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list(user.id, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        throw listError;
      }

      // Transform the files data and get public URLs
      const documentsWithUrls = await Promise.all(
        (files || []).map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(`${user.id}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
            updated_at: file.updated_at || new Date().toISOString(),
            metadata: file.metadata,
            publicUrl,
          };
        })
      );

      setDocuments(documentsWithUrls);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des documents");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Refresh the documents list
      await fetchDocuments();
      
      return fileName;
    } catch (err) {
      console.error("Error uploading document:", err);
      throw err;
    }
  };

  const deleteDocument = async (fileName: string) => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      const filePath = `${user.id}/${fileName}`;

      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the documents list
      await fetchDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}