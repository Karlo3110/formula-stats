interface TeamColor {
  match: string;
  color: string;
}

const TEAM_COLORS: ReadonlyArray<TeamColor> = [
  { match: 'red bull', color: '#3671c6' },
  { match: 'ferrari', color: '#e8002d' },
  { match: 'mercedes', color: '#27f4d2' },
  { match: 'mclaren', color: '#ff8000' },
  { match: 'aston', color: '#229971' },
  { match: 'alpine', color: '#0093cc' },
  { match: 'williams', color: '#64c4ff' },
  { match: 'rb', color: '#6692ff' },
  { match: 'alphatauri', color: '#6692ff' },
  { match: 'sauber', color: '#52e252' },
  { match: 'kick', color: '#52e252' },
  { match: 'haas', color: '#b6babd' },
];

const FALLBACK = '#9fb6b9';

export function teamColor(team: string): string {
  const lower = team.toLowerCase();
  return TEAM_COLORS.find((t) => lower.includes(t.match))?.color ?? FALLBACK;
}
