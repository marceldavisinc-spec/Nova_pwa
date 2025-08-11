// -----------------------------
// Nova∞ PWA — app.js (FULL FILE)
// -----------------------------

// 1) Register the service worker (works on HTTPS like GitHub Pages)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      /* ignore SW errors during local testing */
    });
  });
}

// 2) Decide where to fetch odds from
// On GitHub Pages (github.io) we use the bundled demo JSON.
// When running locally (your Flask server), we use /odds.
const isHosted = location.hostname.endsWith("github.io");
const ODDS_URL = isHosted ? "./demo-odds.json" : "/odds";

// 3) Small helpers
const $ = (id) => document.getElementById(id);
const setText = (id, text) => {
  const el = $(id);
  if (el) el.textContent = text;
};
const isoToLocal = (iso) => {
  try { return new Date(iso).toLocaleString(); }
  catch { return ""; }
};

// 4) Core fetch logic
async function fetchOdds() {
  const out = $("odds");
  const stamp = $("lastUpdated");
  const statusChip = $("status");
  if (!out) return;

  try {
    if (statusChip) {
      statusChip.textContent = "Fetching…";
      statusChip.className = "chip chip-muted";
    }

    const res = await fetch(ODDS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Pretty print JSON
    out.textContent = JSON.stringify(data, null, 2);

    // Last updated: prefer server time if present
    const servedAt = data.served_at || data.timestamp || new Date().toISOString();
    if (stamp) stamp.textContent = isoToLocal(servedAt);

    if (statusChip) {
      statusChip.textContent = "Live";
      statusChip.className = "chip chip-live";
    }
  } catch (err) {
    if (statusChip) {
      statusChip.textContent = "Offline / Error";
      statusChip.className = "chip chip-error";
    }
    out.textContent =
`Failed to fetch odds.

If you're on GitHub Pages, data should come from ./demo-odds.json.
If you're running locally, make sure your server is running and app.js points to /odds.`;
  }
}

// 5) Wire up UI + polling
window.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = $("refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchOdds);

  fetchOdds();
  setInterval(fetchOdds, 30000); // auto-refresh every 30s
});

// 6) Deep links to books (simple: try app, then fall back to web)
function openDeepLink(book) {
  if (book === "dk") {
    // Attempt DraftKings app, then web
    window.location.href = "draftkings://";
    setTimeout(() => window.open("https://sportsbook.draftkings.com", "_blank"), 400);
  } else if (book === "fd") {
    window.location.href = "fanduel://";
    setTimeout(() => window.open("https://sportsbook.fanduel.com", "_blank"), 400);
  }
}
window.openDeepLink = openDeepLink; // expose for buttons
