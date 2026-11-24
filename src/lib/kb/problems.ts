// The problems inside #4471, one per ticket we filed. Built from causes.ts and desk-notes.json, never typed.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = {
  key: 'parser' | 'hint' | 'one-day';
  issue: number; // ticket in this repo
  title: string;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const count = (rs: Report[], f: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [f(r)]: (n[f(r)] ?? 0) + 1 }), {});

function problem(key: Problem['key'], issue: number, title: string, rs: Report[]): Problem {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    key, issue, title, reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: count(rs, (r) => r.channel),
    firstSeen: days[0], lastSeen: days[days.length - 1],
  };
}

// parser and hint are counted the way the desk files them (by tenant and channel, causes.ts).
// The one-day reports stay filed under their cause; they are also a problem of their own.
export function problemsOf(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined, oneDayMove: readonly string[]) {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const of = (c: string) => groups.find((g) => g.cause === c)?.reports ?? [];
  return {
    rows: all.filter((r) => r.mergedInto === ticket).length,
    merged: merged.length,
    unplaced: of('unplaced').length,
    problems: [
      problem('parser', 1, 'Parser reads dates month first', of('parser')),
      problem('hint', 2, 'booking-v3 hint says MM/DD/YYYY', of('hint')),
      problem('one-day', 3, 'Dates one day off / differ by time zone', merged.filter((r) => oneDayMove.includes(r.id))),
    ],
  };
}
