const RELEASE_TIME_ZONE = "America/Sao_Paulo";

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RELEASE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export type TrackReleaseLike = {
  is_bonus?: boolean;
  bonus_release_date?: string | null;
  isBonus?: boolean;
  bonusReleaseDate?: string | null;
};

export function getTrackReleaseMeta(track: TrackReleaseLike | null | undefined) {
  const isBonus = Boolean(track?.is_bonus ?? track?.isBonus);
  const releaseDate = track?.bonus_release_date ?? track?.bonusReleaseDate ?? null;

  if (!isBonus || !releaseDate) {
    return {
      isBonus,
      releaseDate,
      isComingSoon: false,
      isReleased: true,
      daysUntilRelease: 0,
      label: null as string | null,
    };
  }

  const todayKey = getDateKey(new Date());
  const isComingSoon = releaseDate > todayKey;

  if (!isComingSoon) {
    return {
      isBonus,
      releaseDate,
      isComingSoon: false,
      isReleased: true,
      daysUntilRelease: 0,
      label: null as string | null,
    };
  }

  const releaseAtNoonUtc = new Date(`${releaseDate}T12:00:00.000Z`);
  const diffMs = releaseAtNoonUtc.getTime() - Date.now();
  const daysUntilRelease = Math.max(1, Math.ceil(diffMs / 86_400_000));

  return {
    isBonus,
    releaseDate,
    isComingSoon: true,
    isReleased: false,
    daysUntilRelease,
    label: daysUntilRelease <= 7 ? `Em ${daysUntilRelease} dia${daysUntilRelease !== 1 ? "s" : ""}` : "Em breve",
  };
}
