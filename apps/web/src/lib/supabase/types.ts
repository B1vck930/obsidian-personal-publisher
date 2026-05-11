export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          markdown: string;
          html: string;
          theme: string;
          footer_text: string;
          owner_token_hash: string;
          created_at: string;
          updated_at: string;
          expires_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          markdown: string;
          html: string;
          theme?: string;
          footer_text?: string;
          owner_token_hash: string;
          created_at?: string;
          updated_at?: string;
          expires_at: string;
          deleted_at?: string | null;
        };
        Update: {
          slug?: string;
          title?: string;
          markdown?: string;
          html?: string;
          theme?: string;
          footer_text?: string;
          owner_token_hash?: string;
          updated_at?: string;
          expires_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          page_id: string | null;
          original_path: string;
          storage_path: string;
          public_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id?: string | null;
          original_path: string;
          storage_path: string;
          public_url: string;
          created_at?: string;
        };
        Update: {
          page_id?: string | null;
          original_path?: string;
          storage_path?: string;
          public_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type PageInsert = Database["public"]["Tables"]["pages"]["Insert"];
export type PageUpdate = Database["public"]["Tables"]["pages"]["Update"];
