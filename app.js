// -----------------------------
// Nova∞ PWA — app.js (AUTO TIMESTAMP)
// -----------------------------

// 1) Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

// 2) Pick data source (hosted vs local)
const isHosted = location.hostname.endsWith("github.io");
const ODDS_URL = isHosted ? "./demo-odds.json" : "/odds";

// 3) Helpers
const $ = (id) => document.getElementById(id);
const isoToLocal = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };

// 4) Fetch + display
async function fetchOdds() {
  const out = $("odds");
  const stamp = $("lastUpdated");
  const statusChip = $("status");
  if (!out) return;

  try {
    if (statusChip) { statusChip.textContent = "Fetching…"; statusChip.className = "chip chip-muted"; }

    const res = await fetch(ODDS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // If we're on GitHub Pages, stamp a fresh "served_at" so the UI shows the current time
    if (isHosted) data.served_at = new Date().toISOString();

    out.textContent = JSON.stringify(data, null, 2);

    const servedAt =
      data.served_at ||
      data.timestamp ||
      new Date().toISOString();

    if (stamp) stamp.textContent = isoToLocal(servedAt));
    if (statusChip) { statusChip.textContent = "Live"; statusChip.className = "chip chip-live"; }
  } catch (err) {
    if (statusChip) { statusChip.textContent = "Offline / Error"; statusChip.className = "chip chip-error"; }
    out.textContent =
`Failed to fetch odds.

• On GitHub Pages, data loads from ./demo-odds.json (timestamp is auto-stamped).
• Locally, /odds must come from your Flask server (python server.py).`;
  }
}

// 5) UI wiring + polling
window.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = $("refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchOdds);

  fetchOdds();
  setInterval(fetchOdds, 30000);
});

// 6) Deep links
function openDeepLink(book) {
  if (book === "dk") {
    window.location.href = "draftkings://";
    setTimeout(() => window.open("https://sportsbook.draftkings.com", "_blank"), 400);
  } else if (book === "fd") {
    window.location.href = "fanduel://";
    setTimeout(() => window.open("https://sportsbook.fanduel.com", "_blank"), 400);
  }
}
window.openDeepLink = openDeepLink;
