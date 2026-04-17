import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { getTrackReleaseMeta } from '@/lib/track-release';

export type StrategicPlaylist = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tracks: any[];
  hasLockedTracks: boolean;
};

/**
 * Strategic playlists for conversion funnel in Louvores.
 * Mixes free/accessible and locked tracks to create curiosity and desire.
 */
export const getStrategicPlaylists = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;

    let hasFullAccess = false;
    let isTrial = false;

    if (email) {
      const { data: buyer } = await supabaseAdmin
        .from('approved_buyers')
        .select('access_enabled, is_trial, trial_expires_at')
        .eq('email', email)
        .eq('access_enabled', true)
        .maybeSingle();

      if (buyer) {
        isTrial = buyer.is_trial;
        const trialExpired = isTrial && buyer.trial_expires_at && new Date(buyer.trial_expires_at) < new Date();
        hasFullAccess = !isTrial || !trialExpired;
      }
    }

    const { data: allTracks, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    if (!allTracks || allTracks.length === 0) return { playlists: [] };

    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data: playRows } = await supabaseAdmin
      .from('play_logs')
      .select('track_id')
      .gte('played_at', since);

    const playCount: Record<string, number> = {};
    (playRows || []).forEach((r: any) => {
      playCount[r.track_id] = (playCount[r.track_id] || 0) + 1;
    });

    const markTracks = (tracks: any[]) =>
      tracks.map((t) => {
        const releaseMeta = getTrackReleaseMeta(t);
        const isReleaseLocked = releaseMeta.isComingSoon;

        return {
          ...t,
          _locked: !hasFullAccess || isReleaseLocked,
          _plays: playCount[t.id] || 0,
          release_label: releaseMeta.label,
        };
      });

    const enriched = markTracks(allTracks);
    const playlists: StrategicPlaylist[] = [];

    const popular = [...enriched].sort((a, b) => b._plays - a._plays);
    const lesserKnown = [...enriched].sort((a, b) => a._plays - b._plays);
    const discoverMix = [
      ...popular.slice(0, 3),
      ...lesserKnown.filter((t) => !popular.slice(0, 3).some((p) => p.id === t.id)).slice(0, 4),
    ];
    if (discoverMix.length >= 3) {
      playlists.push({
        key: 'descubra-mais',
        title: 'Descubra Mais',
        subtitle: 'Conteúdos selecionados para você',
        icon: '✨',
        tracks: discoverMix.slice(0, 8),
        hasLockedTracks: discoverMix.some((t) => t._locked),
      });
    }

    const bonusTracks = enriched.filter((t) => t.is_bonus);
    const regularPremium = enriched.filter((t) => !t.is_bonus).slice(0, 4);
    const exclusiveMix = [...bonusTracks.slice(0, 5), ...regularPremium.slice(0, 3)];
    if (exclusiveMix.length >= 2) {
      playlists.push({
        key: 'conteudos-exclusivos',
        title: 'Conteúdos Exclusivos',
        subtitle: 'Louvores especiais e inéditos',
        icon: '👑',
        tracks: exclusiveMix.slice(0, 8),
        hasLockedTracks: exclusiveMix.some((t) => t._locked),
      });
    }

    const lockedPopular = enriched.filter((t) => t._locked).sort((a, b) => b._plays - a._plays);
    const unlockedSample = enriched.filter((t) => !t._locked).slice(0, 2);
    const premiumMix = [...unlockedSample, ...lockedPopular.slice(0, 6)];
    if (premiumMix.length >= 3) {
      playlists.push({
        key: 'acesso-premium',
        title: 'Acesso Premium',
        subtitle: 'O melhor da plataforma',
        icon: '🔒',
        tracks: premiumMix.slice(0, 8),
        hasLockedTracks: premiumMix.some((t) => t._locked),
      });
    }

    const spiritualCats = ['Oração', 'Cura', 'Presença', 'Refúgio', 'Madrugada'];
    const spiritualTracks = enriched.filter((t) =>
      spiritualCats.some((c) => t.category.toLowerCase().includes(c.toLowerCase()))
    );
    const otherTracks = enriched.filter((t) =>
      !spiritualCats.some((c) => t.category.toLowerCase().includes(c.toLowerCase()))
    );
    const beyondMix = [...spiritualTracks.slice(0, 5), ...otherTracks.slice(0, 3)];
    if (beyondMix.length >= 3) {
      playlists.push({
        key: 'louvores-alem',
        title: 'Louvores que Vão Além',
        subtitle: 'Para momentos de profundidade espiritual',
        icon: '🕊️',
        tracks: beyondMix.slice(0, 8),
        hasLockedTracks: beyondMix.some((t) => t._locked),
      });
    }

    const newest = [...enriched].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const continueMix = newest.slice(0, 8);
    if (continueMix.length >= 3) {
      playlists.push({
        key: 'continue-experiencia',
        title: 'Continue sua Experiência',
        subtitle: 'Mais conteúdos para explorar',
        icon: '🎵',
        tracks: continueMix.slice(0, 8),
        hasLockedTracks: continueMix.some((t) => t._locked),
      });
    }

    return { playlists, hasFullAccess };
  });