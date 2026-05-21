const elements = {
  profileName: document.querySelector("#profileName"),
  profileIntro: document.querySelector("#profileIntro"),
  profileTags: document.querySelector("#profileTags"),
  clockText: document.querySelector("#clockText"),
  journeyLabel: document.querySelector("#journeyLabel"),
  journeyDays: document.querySelector("#journeyDays"),
  quoteBox: document.querySelector("#quoteBox"),
  qrBox: document.querySelector("#qrBox"),
  qrText: document.querySelector("#qrText"),
  toolGrid: document.querySelector("#toolGrid"),
  toolCount: document.querySelector("#toolCount"),
  postList: document.querySelector("#postList"),
  videoList: document.querySelector("#videoList"),
  postFilters: document.querySelector("#postFilters"),
  videoFilters: document.querySelector("#videoFilters"),
  detailBackButton: document.querySelector("#detailBackButton"),
  detailSidebarTitle: document.querySelector("#detailSidebarTitle"),
  detailSiblingList: document.querySelector("#detailSiblingList"),
  detailType: document.querySelector("#detailType"),
  detailTitle: document.querySelector("#detailTitle"),
  detailTags: document.querySelector("#detailTags"),
  detailSummary: document.querySelector("#detailSummary"),
  detailCover: document.querySelector("#detailCover"),
  detailBody: document.querySelector("#detailBody"),
  detailExternalLink: document.querySelector("#detailExternalLink"),
  pages: [...document.querySelectorAll(".page")],
  navButtons: [...document.querySelectorAll(".nav-button")]
};

let quotes = ["欢迎来到 AIGC创意人_竹相左边 的 AI 学习与工具站"];
let quoteIndex = 0;
let quoteTimer = null;
let journeyStart = "2023-02-02";
let siteCache = null;
let lastListPage = "posts";
const activeTags = {
  posts: "all",
  videos: "all"
};

async function loadSite() {
  const response = await fetch("/api/site");
  if (!response.ok) throw new Error("加载站点内容失败");
  return response.json();
}

async function loadQuotes() {
  try {
    const response = await fetch(`/quotes.txt?t=${Date.now()}`);
    if (!response.ok) return;
    const text = await response.text();
    const nextQuotes = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    if (nextQuotes.length) quotes = nextQuotes;
  } catch (error) {
    console.error("加载语录失败", error);
  }
}

function renderProfile(profile) {
  elements.profileName.textContent = profile.name || "AIGC创意人_竹相左边";
  elements.profileIntro.textContent = profile.intro || "";
  elements.journeyLabel.textContent = profile.journeyLabel || "踏上 AI 之路";
  elements.qrText.textContent = profile.qrText || "";
  journeyStart = profile.journeyStart || journeyStart;
  elements.profileTags.replaceChildren();

  for (const tag of profile.tags || []) {
    const node = document.createElement("span");
    node.className = "tag";
    node.textContent = tag;
    elements.profileTags.append(node);
  }

  elements.qrBox.replaceChildren();
  if (profile.qrImage) {
    const image = document.createElement("img");
    image.src = profile.qrImage;
    image.alt = profile.qrText || "二维码";
    elements.qrBox.append(image);
  } else {
    elements.qrBox.textContent = "QR";
  }
}

function startClock() {
  function tick() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    elements.clockText.textContent = `${year}-${month}-${day}`;
    elements.journeyDays.textContent = String(daysSince(journeyStart));
  }
  tick();
}

function daysSince(dateKey) {
  const start = new Date(dateKey);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function startQuotes() {
  function showQuote() {
    elements.quoteBox.textContent = `“${quotes[quoteIndex]}”`;
    quoteIndex = (quoteIndex + 1) % quotes.length;
  }
  showQuote();
  window.clearInterval(quoteTimer);
  quoteTimer = window.setInterval(showQuote, 5000);
}

function renderTools(tools) {
  elements.toolGrid.replaceChildren();
  elements.toolCount.textContent = `${tools.length} 个工具`;

  for (const tool of tools) {
    const card = document.createElement("article");
    card.className = "tool-card";

    const meta = document.createElement("div");
    meta.className = "tool-meta";
    const category = document.createElement("span");
    category.textContent = tool.category || "工具";
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = tool.status || "可用";
    meta.append(category, status);

    const title = document.createElement("h3");
    title.textContent = tool.name;
    const description = document.createElement("p");
    description.textContent = tool.description || "";
    const link = document.createElement("a");
    link.className = "primary-link";
    link.href = tool.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "打开工具";

    card.append(meta, title, description, link);
    elements.toolGrid.append(card);
  }
}

function renderTagFilters(container, kind, items) {
  const tags = [...new Set((items || []).flatMap((item) => item.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  container.replaceChildren();
  if (!tags.length) return;

  const allButton = createFilterButton("全部", activeTags[kind] === "all", () => {
    activeTags[kind] = "all";
    renderAllContent();
  });
  container.append(allButton);

  for (const tag of tags) {
    container.append(createFilterButton(`#${tag}`, activeTags[kind] === tag, () => {
      activeTags[kind] = tag;
      renderAllContent();
    }));
  }
}

function createFilterButton(text, active, onClick) {
  const button = document.createElement("button");
  button.className = "filter-chip";
  button.classList.toggle("active", active);
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function filterByTag(items, kind) {
  const tag = activeTags[kind];
  if (!tag || tag === "all") return items || [];
  return (items || []).filter((item) => (item.tags || []).includes(tag));
}

function renderAllContent() {
  const posts = siteCache?.posts || [];
  const videos = siteCache?.videos || [];
  renderTagFilters(elements.postFilters, "posts", posts);
  renderTagFilters(elements.videoFilters, "videos", videos);
  renderContent(elements.postList, filterByTag(posts, "posts"), "图文内容准备中", "posts");
  renderContent(elements.videoList, filterByTag(videos, "videos"), "视频内容准备中", "videos");
}

function renderContent(container, items, fallbackText, kind) {
  container.replaceChildren();
  if (!items || items.length === 0) {
    const empty = document.createElement("article");
    empty.className = "content-card";
    empty.textContent = fallbackText;
    container.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const itemId = item.id || `${kind}-${index}`;
    const card = document.createElement("article");
    card.className = `content-card content-card-${kind}`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openDetail(kind, itemId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(kind, itemId);
      }
    });

    if (item.coverUrl) {
      const cover = document.createElement("img");
      cover.className = "content-cover";
      cover.src = item.coverUrl;
      cover.alt = item.title || "内容封面";
      card.append(cover);
    } else if (kind === "videos") {
      const placeholder = document.createElement("div");
      placeholder.className = "video-placeholder";
      placeholder.textContent = "PLAY";
      card.append(placeholder);
    }

    const type = document.createElement("span");
    type.className = "content-type";
    type.textContent = item.type || (kind === "videos" ? "视频" : "图文");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const tags = renderInlineTags(item.tags || []);
    const videoMeta = kind === "videos" ? renderVideoMeta(item) : null;
    const summary = document.createElement("p");
    summary.textContent = item.summary || stripHtml(item.body || "");

    const link = document.createElement("button");
    link.className = "secondary-link";
    link.type = "button";
    link.textContent = kind === "videos" ? "查看视频" : "阅读全文";
    link.addEventListener("click", (event) => {
      event.stopPropagation();
      openDetail(kind, itemId);
    });

    card.append(type, title);
    if (videoMeta) card.append(videoMeta);
    if (tags) card.append(tags);
    card.append(summary);
    card.append(link);
    container.append(card);
  });
}

function renderInlineTags(tags) {
  if (!tags.length) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "tag-list compact";
  for (const tag of tags) {
    const node = document.createElement("span");
    node.className = "tag";
    node.textContent = tag;
    wrapper.append(node);
  }
  return wrapper;
}

function stripHtml(value) {
  const node = document.createElement("div");
  node.innerHTML = value;
  return node.textContent.trim();
}

function findContent(kind, id) {
  const list = kind === "videos" ? siteCache?.videos : siteCache?.posts;
  return (list || []).find((item, index) => (item.id || `${kind}-${index}`) === id);
}

function openDetail(kind, id) {
  lastListPage = kind === "videos" ? "videos" : "posts";
  renderDetail(kind, id);
  setPage("detail", false);
  window.history.replaceState(null, "", `#content/${kind}/${encodeURIComponent(id)}`);
}

function renderDetail(kind, id) {
  const item = findContent(kind, id);
  if (!item) {
    setPage(kind === "videos" ? "videos" : "posts");
    return;
  }

  elements.detailType.textContent = item.type || (kind === "videos" ? "视频教程" : "图文分享");
  elements.detailTitle.textContent = item.title || "未命名内容";
  elements.detailSummary.textContent = item.summary || "";
  elements.detailBody.innerHTML = item.body || "<p>暂无正文内容。</p>";
  elements.detailTags.replaceChildren();
  const detailTags = renderInlineTags(item.tags || []);
  if (detailTags) elements.detailTags.replaceChildren(...detailTags.children);
  const videoMeta = kind === "videos" ? renderVideoMeta(item) : null;
  if (videoMeta) elements.detailTags.prepend(videoMeta);
  renderSiblingList(kind, id);

  if (item.coverUrl) {
    elements.detailCover.src = item.coverUrl;
    elements.detailCover.alt = item.title || "内容封面";
    elements.detailCover.classList.remove("hidden");
  } else {
    elements.detailCover.removeAttribute("src");
    elements.detailCover.classList.add("hidden");
  }

  if (item.url && item.url !== "#") {
    elements.detailExternalLink.href = item.url;
    elements.detailExternalLink.classList.remove("hidden");
  } else {
    elements.detailExternalLink.removeAttribute("href");
    elements.detailExternalLink.classList.add("hidden");
  }
}

function renderVideoMeta(item) {
  const parts = [item.videoPlatform, item.videoDuration].filter(Boolean);
  if (!parts.length) return null;
  const meta = document.createElement("div");
  meta.className = "video-meta";
  meta.textContent = parts.join(" · ");
  return meta;
}

function renderSiblingList(kind, activeId) {
  const list = kind === "videos" ? siteCache?.videos || [] : siteCache?.posts || [];
  elements.detailSidebarTitle.textContent = kind === "videos" ? "更多视频" : "更多文章";
  elements.detailSiblingList.replaceChildren();

  list.forEach((item, index) => {
    const itemId = item.id || `${kind}-${index}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sibling-link";
    button.classList.toggle("active", itemId === activeId);
    button.innerHTML = `<span>${escapeHtml(item.title || "未命名内容")}</span>`;
    button.addEventListener("click", () => openDetail(kind, itemId));
    elements.detailSiblingList.append(button);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setPage(pageName, updateHash = true) {
  const page = pageName || "home";
  document.body.dataset.page = page;
  elements.pages.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === page);
  });
  elements.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  if (updateHash) window.history.replaceState(null, "", page === "home" ? "#" : `#${page}`);
}

function routeFromHash() {
  const hashPage = window.location.hash.replace("#", "");
  const detailMatch = hashPage.match(/^content\/(posts|videos)\/(.+)$/);
  if (detailMatch) {
    openDetail(detailMatch[1], decodeURIComponent(detailMatch[2]));
    return;
  }
  if (["tools", "posts", "videos"].includes(hashPage)) {
    setPage(hashPage);
  } else {
    setPage("home");
  }
}

function bindNavigation() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => setPage(button.dataset.page));
  });
  elements.detailBackButton.addEventListener("click", () => setPage(lastListPage));
  window.addEventListener("hashchange", routeFromHash);
  routeFromHash();
}

Promise.all([loadSite(), loadQuotes()])
  .then(([site]) => {
    siteCache = site;
    renderProfile(site.profile || {});
    renderTools(site.tools || []);
    renderAllContent();
    bindNavigation();
    startClock();
    startQuotes();
  })
  .catch((error) => {
    console.error(error);
    elements.quoteBox.textContent = "站点内容加载失败，请稍后刷新。";
  });
