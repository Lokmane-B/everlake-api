export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company_name: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          location: string | null
          notes: string | null
          phone: string | null
          sector: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          phone?: string | null
          sector?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          phone?: string | null
          sector?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      devis: {
        Row: {
          attachments: Json
          commentaire: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          items: Json | null
          location: string | null
          marche_id: string | null
          marche_title: string | null
          sent_to: string | null
          status: string | null
          total_ht: number | null
          total_ttc: number | null
          tva: number | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json
          commentaire?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items?: Json | null
          location?: string | null
          marche_id?: string | null
          marche_title?: string | null
          sent_to?: string | null
          status?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          tva?: number | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json
          commentaire?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items?: Json | null
          location?: string | null
          marche_id?: string | null
          marche_title?: string | null
          sent_to?: string | null
          status?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          tva?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_channel_members: {
        Row: {
          channel_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "internal_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_channels: {
        Row: {
          company_name: string
          created_at: string
          created_by: string
          id: string
          is_all_employees: boolean
          is_group: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          created_by: string
          id?: string
          is_all_employees?: boolean
          is_group?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string
          id?: string
          is_all_employees?: boolean
          is_group?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "internal_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      marches: {
        Row: {
          attributaire_company_name: string | null
          attributaire_devis_id: string | null
          budget: string | null
          cahier_des_charges: string | null
          company_logo: string | null
          company_name: string | null
          contract_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          documents: Json | null
          end_date: string | null
          evaluation_criteria: Json
          id: string
          location: string | null
          project_id: string | null
          quantity: string | null
          sector: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          attributaire_company_name?: string | null
          attributaire_devis_id?: string | null
          budget?: string | null
          cahier_des_charges?: string | null
          company_logo?: string | null
          company_name?: string | null
          contract_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          evaluation_criteria?: Json
          id?: string
          location?: string | null
          project_id?: string | null
          quantity?: string | null
          sector?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          attributaire_company_name?: string | null
          attributaire_devis_id?: string | null
          budget?: string | null
          cahier_des_charges?: string | null
          company_logo?: string | null
          company_name?: string | null
          contract_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          evaluation_criteria?: Json
          id?: string
          location?: string | null
          project_id?: string | null
          quantity?: string | null
          sector?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          from_user: string | null
          id: string
          marche_id: string | null
          read: boolean | null
          subject: string
          to_user: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          marche_id?: string | null
          read?: boolean | null
          subject: string
          to_user?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          marche_id?: string | null
          read?: boolean | null
          subject?: string
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link_url: string | null
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_url?: string | null
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_url?: string | null
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          phone: string | null
          sector: string | null
          siret: string | null
          updated_at: string | null
          validated: boolean | null
          website: string | null
          year_founded: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id: string
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          sector?: string | null
          siret?: string | null
          updated_at?: string | null
          validated?: boolean | null
          website?: string | null
          year_founded?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          sector?: string | null
          siret?: string | null
          updated_at?: string | null
          validated?: boolean | null
          website?: string | null
          year_founded?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          profile_id: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          profile_id?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ao_deadlines: boolean | null
          ao_nouveaux: boolean | null
          ao_resultats: boolean | null
          canaux_email: boolean | null
          canaux_inapp: boolean | null
          canaux_slack: boolean | null
          created_at: string | null
          devis_accepte: boolean | null
          devis_nouveau: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ao_deadlines?: boolean | null
          ao_nouveaux?: boolean | null
          ao_resultats?: boolean | null
          canaux_email?: boolean | null
          canaux_inapp?: boolean | null
          canaux_slack?: boolean | null
          created_at?: string | null
          devis_accepte?: boolean | null
          devis_nouveau?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ao_deadlines?: boolean | null
          ao_nouveaux?: boolean | null
          ao_resultats?: boolean | null
          canaux_email?: boolean | null
          canaux_inapp?: boolean | null
          canaux_slack?: boolean | null
          created_at?: string | null
          devis_accepte?: boolean | null
          devis_nouveau?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
