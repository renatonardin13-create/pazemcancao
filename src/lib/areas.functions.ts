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
  return data || [];
};

export const getMyAreas = async () => {
  const { data, error } = await supabase
    .from("memberships")
    .select("*, areas(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  // @ts-ignore - Supabase join typing can be tricky
  return (data || []).map((m) => m.areas).filter(Boolean) as Area[];
};

export const getArea = async (id: string) => {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .eq("id", id)
    .single();

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

export const getAreaContents = async (areaId: string) => {
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("area_id", areaId);

  if (error) throw error;
  return data || [];
};

export const addAreaContent = async (areaId: string, title: string, type: string, url: string) => {
  const { data, error } = await supabase
    .from("contents")
    .insert({ area_id: areaId, title, type, url })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeAreaContent = async (id: string) => {
  const { error } = await supabase.from("contents").delete().eq("id", id);
  if (error) throw error;
};
