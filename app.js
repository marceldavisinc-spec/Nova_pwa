// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

// Simple polling demo (replace URL with your odds endpoint)
const ODDS_URL = './demo-odds.json'; // TODO: replace with your API

async function fetchOdds() {
  const el = document.getElementById('odds');
  try {
    const res = await fetch(ODDS_URL, { cache: 'no-store' });
    const data = await res.json();
    el.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    el.textContent = 'Failed to fetch odds. If offline, cached version may appear.';
  }
}

document.getElementById('refresh').addEventListener('click', fetchOdds);
fetchOdds();
setInterval(fetchOdds, 30000);

// Deep links (basic examples; adjust as needed)
function openDeepLink(book) {
  if (book === 'dk') {
    // Open DraftKings app if installed, otherwise web
    window.location.href = 'dk sportsbook://'; // Placeholder schema
    setTimeout(() => window.open('https://sportsbook.draftkings.com', '_blank'), 400);
  } else if (book === 'fd') {
    window.location.href = 'fanduel://';
    setTimeout(() => window.open('https://sportsbook.fanduel.com', '_blank'), 400);
  }
}
