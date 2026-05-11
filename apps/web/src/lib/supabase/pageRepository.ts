import "server-only";
import { createServerSupabaseClient } from "./server";
import type { PageRepository } from "../pages";

export function createSupabasePageRepository(): PageRepository {
  const supabase = createServerSupabaseClient();

  return {
    async insertPage(page) {
      const { data, error } = await supabase
        .from("pages")
        .insert(page)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    async getPageById(id) {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    async getPageBySlug(slug) {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    async updatePage(id, patch) {
      const { data, error } = await supabase
        .from("pages")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    async deletePage(id) {
      const { error } = await supabase.from("pages").delete().eq("id", id);

      if (error) {
        throw error;
      }
    }
  };
}
