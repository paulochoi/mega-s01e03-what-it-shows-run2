<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsOf } from '#lib/kb/problems';

  let { ticket, repo }: { ticket: number; repo: string } = $props();
  const s = $derived(problemsOf(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const ch = (c: Record<string, number>) => Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ');
</script>

<p class="sum">
  <strong>{s.merged}</strong> unique reports in #{ticket} ({s.rows} export rows; duplicates by id dropped) ·
  <strong>{s.problems.length}</strong> problems · {s.unplaced} unplaced
</p>

<table>
  <thead><tr><th>ticket</th><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th></tr></thead>
  <tbody>
    {#each s.problems as p (p.key)}
      <tr>
        <td><a href="https://github.com/{repo}/issues/{p.issue}">#{p.issue}</a></td>
        <td>{p.title}</td>
        <td><strong>{p.reports.length}</strong></td>
        <td>{p.tenants.length}</td>
        <td class="muted">{ch(p.channels)}</td>
        <td class="muted">{p.firstSeen} → {p.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="muted">The {s.problems[2].reports.length} one-day reports are counted inside <code>parser</code>, where the desk files them by tenant, and again on their own ticket.</p>

<style>
  .sum { font-size: 1.05rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
</style>
