// ── Hamburger ──
const hamburger = document.getElementById("hamburger");
const menuOverlay = document.getElementById("menuOverlay");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  menuOverlay.classList.toggle("open");
});
function closeMenu() {
  hamburger.classList.remove("open");
  menuOverlay.classList.remove("open");
}
menuOverlay.addEventListener("click", (e) => {
  if (e.target === menuOverlay) closeMenu();
});

// ── Next Show Date Logic ──
const SHOW_DURATION_MS = 2 * 60 * 60 * 1000;

function getShowState() {
  const anchor = new Date(Date.UTC(2026, 4, 17, 3, 0, 0));
  const now = new Date();
  const ms14 = 14 * 24 * 60 * 60 * 1000;

  if (now < anchor) {
    return { state: "countdown", showDate: anchor };
  }

  const periodIndex = Math.floor((now - anchor) / ms14);
  const currentShowStart = new Date(anchor.getTime() + periodIndex * ms14);
  const currentShowEnd = new Date(currentShowStart.getTime() + SHOW_DURATION_MS);
  const nextShowStart = new Date(anchor.getTime() + (periodIndex + 1) * ms14);

  if (now < currentShowEnd) {
    return { state: "live", showDate: currentShowStart };
  }
  return { state: "countdown", showDate: nextShowStart };
}

function formatShowDate(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function updateCountdown() {
  const { state, showDate } = getShowState();
  const label = document.getElementById("nextBroadcastLabel");
  const countdownRow = document.getElementById("countdownRow");
  const onAirLink = document.getElementById("onAirLink");

  document.getElementById("nextShowDate").textContent = formatShowDate(showDate);

  if (state === "live") {
    label.textContent = "On Air";
    countdownRow.style.display = "none";
    onAirLink.style.display = "block";
    return;
  }

  label.textContent = "Next Broadcast";
  countdownRow.style.display = "flex";
  onAirLink.style.display = "none";

  const diff = showDate - new Date();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById("cdDays").textContent = String(d).padStart(2, "0");
  document.getElementById("cdHours").textContent = String(h).padStart(2, "0");
  document.getElementById("cdMins").textContent = String(m).padStart(2, "0");
  document.getElementById("cdSecs").textContent = String(s).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── Marquee (includes next show date) ──
const { state: marqueeState, showDate: marqueeShowDate } = getShowState();
const nextLabel = marqueeState === "live"
  ? "On Air Now!"
  : marqueeShowDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    });
const marqueeNextItem = marqueeState === "live" ? nextLabel : `Next Show: ${nextLabel}`;
const items = [
  "Missed Connections",
  "///",
  "Freeform Portland",
  "///",
  "90.3 & 98.3 FM",
  "///",
  "Every Other Saturday · 8–10 PM PT",
  "///",
  marqueeNextItem,
  "///",
  "CG + E",
  "///",
];
const doubled = [...items, ...items];
document.getElementById("marqueeTrack").innerHTML = doubled
  .map((t) => `<span>${t}</span>`)
  .join("");

// ── Episodes: data/episodes.js (window.__MC_EPISODES__) works from file:// and http(s).
//    YAML source → npm run build writes episodes.js + episodes.json
let EPISODES = [];

async function loadEpisodes() {
  if (
    Array.isArray(window.__MC_EPISODES__) &&
    window.__MC_EPISODES__.length > 0
  ) {
    EPISODES = window.__MC_EPISODES__;
    return;
  }
  const res = await fetch("data/episodes.json");
  if (!res.ok) throw new Error(`Could not load episodes (${res.status})`);
  EPISODES = await res.json();
}

const PAGE_SIZE = 7;
let showing = PAGE_SIZE;

function renderCard(ep, index) {
  const isFeatured = index === 0;
  const epLabel = ep.ep === "Special" ? "Special" : `Ep. ${ep.ep}`;
  const epDisplay = isFeatured ? `Most Recent · ${epLabel}` : epLabel;
  const dateDisplay = ep.date || "Date TBC";
  const listenLabel = isFeatured ? "▶ Listen on Mixcloud →" : "Listen →";
  const tags = ep.tags.map((t) => `<span class="tag">${t}</span>`).join("");
  const descStyle = isFeatured
    ? "font-size:.85rem;color:#aaa;line-height:1.6;max-width:520px;margin-top:8px;"
    : "font-size:.8rem;color:#666;line-height:1.5;margin-top:6px;";
  return `<div class="show-card${isFeatured ? " featured" : ""}">
        <div class="show-ep">${epDisplay}</div>
        <div class="show-date">${dateDisplay}</div>
        <div class="show-name">${ep.title}</div>
        <p style="${descStyle}">${ep.description}</p>
        <div class="show-tags">${tags}</div>
        <a class="listen-link" href="${ep.url}" target="_blank">${listenLabel}</a>
      </div>`;
}

function renderShows() {
  const total = EPISODES.length;
  const visible = EPISODES.slice(0, showing);
  document.getElementById("showsGrid").innerHTML =
    visible.map(renderCard).join("");
  document.getElementById("archiveStatus").textContent =
    `Showing ${Math.min(showing, total)} of ${total} episodes`;
  const row = document.getElementById("loadMoreRow");
  const btn = document.getElementById("loadMoreBtn");
  row.style.display = total <= PAGE_SIZE ? "none" : "flex";
  btn.textContent =
    showing >= total ? "Show Fewer ↑" : "Load More Episodes ↓";
}

function loadMore() {
  showing = showing >= EPISODES.length ? PAGE_SIZE : EPISODES.length;
  renderShows();
}

function togglePlayer(e) {
  e.preventDefault();
  const panel = document.getElementById("playerPanel");
  const btn = document.getElementById("listenBtn");
  const isOpen = panel.classList.toggle("open");
  btn.textContent = isOpen
    ? "■ Hide Player"
    : "▶ Listen to Latest Episode";
}

function initPlayer() {
  if (!EPISODES.length) return;
  const latest = EPISODES[0];
  const url = new URL(latest.url);
  const feed = encodeURIComponent(url.pathname);
  document.getElementById("mixcloudEmbed").src =
    `https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${feed}`;
  const epBit = latest.ep === "Special" ? "Special" : `Ep. ${latest.ep}`;
  document.getElementById("playerLabel").textContent =
    `Now Playing · ${epBit} — ${latest.title}`;
}

async function start() {
  try {
    await loadEpisodes();
  } catch (err) {
    console.error(err);
    document.getElementById("showsGrid").innerHTML =
      '<p class="show-date" style="grid-column:1/-1;padding:24px;">Could not load episodes. Run <code style="font:inherit;border:1px solid #ccc;padding:0 6px;">npm run build</code> in the aws folder (writes data/episodes.js), or serve over HTTP so data/episodes.json can load.</p>';
    return;
  }
  renderShows();
  initPlayer();
}

start();