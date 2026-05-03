import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

export const listMusicas = createServerFn({ method: 'POST' })
  .inputValidator((input: {
    produto_id: string;
  }) => input)
  .handler(async ({ data }) => {
    const { data: musicas, error } = await supabase
      .from('musicas')
      .select('*')
      .eq('produto_id', data.produto_id)
      .order('ordem', { ascending: true });

    if (error) throw new Error(error.message);
    return { musicas: musicas || [] };
  });
