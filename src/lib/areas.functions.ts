import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Area = Database["public"]["Tables"]["areas"]["Row"];
export type AreaInsert = Database["public"]["Tables"]["areas"]["Insert"];
export type AreaUpdate = Database["public"]["Tables"]["areas"]["Update"];

export const getAreas = async () => {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createArea = async (area: AreaInsert) => {
  const { data, error } = await supabase
    .from("areas")
    .insert(area)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateArea = async (id: string, area: AreaUpdate) => {
  const { data, error } = await supabase
    .from("areas")
    .update(area)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteArea = async (id: string) => {
  const { error } = await supabase.from("areas").delete().eq("id", id);

  if (error) throw error;
};
