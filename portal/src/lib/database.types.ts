// Hand-typed Database interface for the silo portal schema.
// Mirrors supabase/migrations/20260407_silo_gated_portal.sql exactly.
// When the schema changes, update this file in lockstep.
//
// Future: replace with `supabase gen types typescript --project-id <id>`
// once the project is set up to publish types.

import type { AccessStatus } from './access';

export type Provider = 'google' | 'github';
export type Role = 'reviewer' | 'admin';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          welcomed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: Role;
          welcomed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Role;
          welcomed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          provider: Provider;
          github_handle: string | null;
          org: string | null;
          status: AccessStatus;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          provider: Provider;
          github_handle?: string | null;
          org?: string | null;
          status?: AccessStatus;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          provider?: Provider;
          github_handle?: string | null;
          org?: string | null;
          status?: AccessStatus;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      dd_views: {
        Row: {
          id: number;
          user_id: string;
          email: string;
          page: string;
          ip: string | null;
          user_agent: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          email: string;
          page: string;
          ip?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          email?: string;
          page?: string;
          ip?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Convenience aliases for downstream consumers.
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type AccessRequestRow = Database['public']['Tables']['access_requests']['Row'];
export type DdViewRow = Database['public']['Tables']['dd_views']['Row'];
