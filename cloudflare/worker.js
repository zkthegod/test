export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/' || url.pathname === '/check') {
      const host = url.searchParams.get('host') || '';
      const baseUrl = (url.searchParams.get('url') || '').replace(/\/$/, '');
      const asset = url.searchParams.get('asset') || '/favicon.ico';
      if (!host || !baseUrl) {
        return json({ error: 'Missing host or url' }, 400);
      }
      const full = `${baseUrl}${asset}`;
      const ts = Date.now();

      let up = false;
      let ms = 0;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('timeout'), 10000);
      const start = ts;
      try {
        // Avoid cache; opaque results still count for timing
        await fetch(full, { redirect: 'follow', cf: { cacheTtl: 0, cacheEverything: false }, signal: controller.signal });
        ms = Date.now() - start; up = true;
      } catch (e) {
        ms = Date.now() - start; up = false;
      } finally { clearTimeout(timeoutId); }

      // Update KV history
      const key = `uptime:${host}`;
      let entryJson = await env.UPTIME_KV.get(key);
      let entry = entryJson ? JSON.parse(entryJson) : { history: [], totals: { checks: 0, up: 0, sumLatency: 0 } };
      entry.history.push({ ts, up, ms: Math.max(0, Math.round(ms)) });
      // Keep last 30 days, hard cap size
      const cutoff = ts - 30*24*60*60*1000;
      entry.history = entry.history.filter(h => h.ts >= cutoff).slice(-43200);
      entry.totals.checks += 1;
      if (up) entry.totals.up += 1;
      entry.totals.sumLatency += Math.max(0, Math.round(ms));
      await env.UPTIME_KV.put(key, JSON.stringify(entry), { expirationTtl: 60*60*24*45 }); // keep ~45 days

      const stats = computeStats(entry);
      return json({ host, up, ms, stats }, 200);
    }

    return json({ error: 'Not found' }, 404);
  }
}

function computeStats(entry){
  const checks = entry?.totals?.checks || 0;
  const lifeUptime = checks ? (entry.totals.up / checks) * 100 : null;
  const avgLatency = checks ? (entry.totals.sumLatency / checks) : null;
  const monthUp = entry.history.length ? (entry.history.filter(h=>h.up).length / entry.history.length) * 100 : null;
  const last = entry.history[entry.history.length-1] || null;
  return {
    monthUptime: monthUp,
    lifeUptime,
    avgLatency,
    checks,
    lastTs: last ? last.ts : null,
    lastMs: last ? last.ms : null,
    lastUp: last ? last.up : null,
  };
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(), 'cache-control': 'no-store' }});
}

function corsHeaders(){
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}