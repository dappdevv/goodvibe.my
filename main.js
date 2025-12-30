const state = {
  q: "",
  category: "All",
  sort: "rank",
  page: 1,
  perPage: 18,
};

/** @type {{id:string, rank:number, name:string, desc:string, category:string, members:number, price:string, cover:string, tag?:string}[]} */
const DATA = [
  {
    id: "pickleball",
    rank: 1,
    name: "That Pickleball School",
    desc: "Learn strategies to play better pickleball right away.",
    category: "Sports",
    members: 1300,
    price: "$39/month",
    cover: "linear-gradient(135deg,#0ea5e9,#22c55e)",
    tag: "⚡ Hot",
  },
  {
    id: "automation",
    rank: 2,
    name: "AI Automation Society",
    desc: "Master no‑code automations. Learn, discuss, and ship systems fast.",
    category: "Tech",
    members: 220600,
    price: "Free",
    cover: "linear-gradient(135deg,#111827,#2563eb)",
    tag: "🤖",
  },
  {
    id: "calligraphy",
    rank: 3,
    name: "Calligraphy Skool",
    desc: "Learn modern calligraphy the fun, easy way.",
    category: "Hobbies",
    members: 1200,
    price: "$9/month",
    cover: "linear-gradient(135deg,#f97316,#f43f5e)",
  },
  {
    id: "dance",
    rank: 4,
    name: "Ina's Dance Academy",
    desc: "For dancers seeking freedom and expression on the floor.",
    category: "Hobbies",
    members: 469,
    price: "$99/month",
    cover: "linear-gradient(135deg,#8b5cf6,#ec4899)",
  },
  {
    id: "owners",
    rank: 5,
    name: "Skoolers",
    desc: "Private club for community owners. Build together.",
    category: "Money",
    members: 180300,
    price: "Free",
    cover: "linear-gradient(135deg,#0f172a,#22c55e)",
    tag: "🏗️",
  },
];

// Generate more mock cards so the layout feels real.
const CATS = [
  { key: "Hobbies", label: "🎨 Hobbies" },
  { key: "Music", label: "🎸 Music" },
  { key: "Money", label: "💰 Money" },
  { key: "Spirituality", label: "🙏 Spirituality" },
  { key: "Tech", label: "💻 Tech" },
  { key: "Health", label: "🥕 Health" },
  { key: "Sports", label: "⚽ Sports" },
  { key: "Self-improvement", label: "📚 Self‑improvement" },
  { key: "Relationships", label: "❤️ Relationships" },
];

const EXTRA = [
  { n: "Producer Growth Hub", c: "Music", d: "Grow, learn, connect, and simplify production.", t: "🎧" },
  { n: "Trading For Women", c: "Money", d: "Build confidence and future, one trade at a time.", t: "📈" },
  { n: "Day by Day Wellness", c: "Health", d: "Small daily habits, big long‑term change.", t: "🌿" },
  { n: "The Acting Lab", c: "Hobbies", d: "Learn craft + business from working pros.", t: "🎭" },
  { n: "School of Mentors", c: "Self-improvement", d: "Weekly mentorship, interviews, and accountability.", t: "🧠" },
  { n: "Pocket Singers", c: "Music", d: "Beginner-friendly voice training in bite sizes.", t: "🎤" },
  { n: "Screen Time Adventure", c: "Self-improvement", d: "A playful way to reduce screen time.", t: "⏳" },
  { n: "Kingdom Lounge", c: "Spirituality", d: "Healing, detaching cycles, realigning with purpose.", t: "🕊️" },
  { n: "Money House", c: "Money", d: "Everything you need to know about money, together.", t: "🏠" },
  { n: "Brotherhood Of Scent", c: "Relationships", d: "Leverage scent to upgrade your presence.", t: "🧴" },
];

const seeded = makeSeed(1337);
for (let i = 0; i < 95; i++) {
  const ex = EXTRA[i % EXTRA.length];
  const rank = DATA.length + 1;
  const members = Math.round(50 + seeded() * 250000);
  const paid = seeded() > 0.55;
  const price = paid ? `$${Math.round(5 + seeded() * 149)}/month` : "Free";
  const cover = gradientFrom(ex.c, seeded());
  DATA.push({
    id: `mock-${i}`,
    rank,
    name: ex.n + (i % 7 === 0 ? " — Plus" : ""),
    desc: ex.d,
    category: ex.c,
    members,
    price,
    cover,
    tag: seeded() > 0.86 ? ex.t : undefined,
  });
}

function $(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

const els = {
  q: $("#q"),
  chips: $("#chips"),
  grid: $("#grid"),
  pagination: $("#pagination"),
  resultCount: $("#resultCount"),
  sort: $("#sort"),
  searchWrap: document.querySelector(".search"),
};

init();

function init() {
  renderChips();
  wire();
  render();
  syncClearButton();
}

function wire() {
  els.q.addEventListener("input", () => {
    state.q = els.q.value.trim();
    state.page = 1;
    syncClearButton();
    render();
  });

  els.sort.addEventListener("change", () => {
    state.sort = els.sort.value;
    state.page = 1;
    render();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "clear-search") {
      els.q.value = "";
      state.q = "";
      state.page = 1;
      syncClearButton();
      render();
      els.q.focus();
    }
    if (action === "chips-more") {
      els.chips.scrollBy({ left: 240, behavior: "smooth" });
    }
    if (action === "login") {
      e.preventDefault();
      toast("Mock: login");
    }
    if (action === "create") {
      e.preventDefault();
      toast("Mock: create your own");
    }
  });

  els.pagination.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-page]");
    if (!b) return;
    const p = Number(b.getAttribute("data-page"));
    if (!Number.isFinite(p)) return;
    state.page = p;
    render();
    const top = document.querySelector(".results");
    top?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // tiny “cmd/ctrl+k focuses search” UX.
  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      els.q.focus();
      els.q.select();
    }
    if (e.key === "Escape" && document.activeElement === els.q) {
      els.q.blur();
    }
  });
}

function syncClearButton() {
  const has = state.q.length > 0;
  els.searchWrap?.setAttribute("data-has-text", has ? "true" : "false");
}

function renderChips() {
  const chips = [
    { key: "All", label: "All" },
    ...CATS,
  ];

  els.chips.innerHTML = chips
    .map((c) => {
      const pressed = c.key === state.category ? "true" : "false";
      return `<button class="chip" type="button" aria-pressed="${pressed}" data-cat="${escapeHtml(
        c.key
      )}">${escapeHtml(c.label)}</button>`;
    })
    .join("");

  els.chips.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]");
    if (!b) return;
    const cat = b.getAttribute("data-cat");
    state.category = cat || "All";
    state.page = 1;
    // update pressed state
    for (const node of els.chips.querySelectorAll("button[data-cat]")) {
      node.setAttribute("aria-pressed", node.getAttribute("data-cat") === state.category ? "true" : "false");
    }
    render();
  });
}

function render() {
  const filtered = applyFilters(DATA);
  const sorted = applySort(filtered);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / state.perPage));
  state.page = clamp(state.page, 1, pages);
  const start = (state.page - 1) * state.perPage;
  const slice = sorted.slice(start, start + state.perPage);

  els.resultCount.textContent = `${total.toLocaleString()} communities`;

  els.grid.innerHTML = slice.map(renderCard).join("");
  els.pagination.innerHTML = renderPagination(state.page, pages);
}

function applyFilters(items) {
  const q = state.q.toLowerCase();
  return items.filter((x) => {
    if (state.category !== "All" && x.category !== state.category) return false;
    if (!q) return true;
    const hay = `${x.name} ${x.desc} ${x.category}`.toLowerCase();
    return hay.includes(q);
  });
}

function applySort(items) {
  const out = [...items];
  if (state.sort === "rank") out.sort((a, b) => a.rank - b.rank);
  if (state.sort === "members_desc") out.sort((a, b) => b.members - a.members);
  if (state.sort === "name_asc") out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function renderCard(x) {
  const members = formatMembers(x.members);
  const meta = `${members} members`;
  const badge = x.tag ? `<span class="badge">${escapeHtml(x.tag)}</span>` : "";
  return `
    <a class="card" href="#" data-id="${escapeHtml(x.id)}" style="--cover:${escapeHtml(x.cover)}" aria-label="${escapeHtml(
    x.name
  )}">
      <div class="card__cover">
        <div class="card__rank">#${x.rank}</div>
      </div>
      <div class="card__body">
        ${badge}
        <h3 class="card__title">${escapeHtml(x.name)}</h3>
        <p class="card__desc">${escapeHtml(x.desc)}</p>
        <div class="card__meta">
          <span>${escapeHtml(meta)}</span>
          <span class="dot" aria-hidden="true"></span>
          <span>${escapeHtml(x.price)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderPagination(page, pages) {
  const parts = paginationParts(page, pages);
  const prevDisabled = page <= 1 ? "disabled" : "";
  const nextDisabled = page >= pages ? "disabled" : "";

  return [
    `<button class="page" type="button" data-page="${page - 1}" ${prevDisabled} aria-label="Previous">Prev</button>`,
    ...parts.map((p) => {
      if (p === "…") return `<span class="page" aria-hidden="true" style="cursor:default;">…</span>`;
      const cur = p === page ? `aria-current="page"` : "";
      return `<button class="page" type="button" data-page="${p}" ${cur} aria-label="Page ${p}">${p}</button>`;
    }),
    `<button class="page" type="button" data-page="${page + 1}" ${nextDisabled} aria-label="Next">Next</button>`,
  ].join("");
}

function paginationParts(page, pages) {
  if (pages <= 7) return range(1, pages);
  const out = [];
  const showLeft = page <= 3;
  const showRight = page >= pages - 2;

  out.push(1);
  if (!showLeft) out.push("…");

  const from = showLeft ? 2 : Math.max(2, page - 1);
  const to = showRight ? pages - 1 : Math.min(pages - 1, page + 1);
  for (let i = from; i <= to; i++) out.push(i);

  if (!showRight) out.push("…");
  out.push(pages);
  // Dedup in case of overlaps.
  return out.filter((v, idx) => out.indexOf(v) === idx);
}

function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatMembers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeSeed(seed) {
  // Deterministic PRNG (mulberry32)
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function gradientFrom(cat, rnd) {
  const map = {
    Hobbies: ["#f97316", "#ec4899"],
    Music: ["#6366f1", "#22c55e"],
    Money: ["#0f172a", "#22c55e"],
    Spirituality: ["#8b5cf6", "#06b6d4"],
    Tech: ["#111827", "#2563eb"],
    Health: ["#10b981", "#84cc16"],
    Sports: ["#0ea5e9", "#22c55e"],
    "Self-improvement": ["#f59e0b", "#ef4444"],
    Relationships: ["#fb7185", "#8b5cf6"],
  };
  const pair = map[cat] || ["#7c3aed", "#06b6d4"];
  // small deterministic wobble to avoid too-repetitive covers
  const a = pair[0];
  const b = pair[1];
  const deg = Math.round(120 + rnd() * 70);
  return `linear-gradient(${deg}deg, ${a}, ${b})`;
}

function toast(msg) {
  // minimal non-intrusive toast without deps
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.left = "50%";
  el.style.bottom = "18px";
  el.style.transform = "translateX(-50%)";
  el.style.padding = "10px 12px";
  el.style.borderRadius = "12px";
  el.style.border = "1px solid rgba(255,255,255,0.16)";
  el.style.background = "rgba(15,23,42,0.9)";
  el.style.color = "white";
  el.style.font = "14px/1.2 ui-sans-serif,system-ui";
  el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
  el.style.zIndex = "999";
  el.style.backdropFilter = "blur(10px)";
  el.style.opacity = "0";
  el.style.transition = "opacity 120ms ease, transform 120ms ease";
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(-2px)";
  });
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => el.remove(), 180);
  }, 900);
}


