const STORY_URL =
  "https://raw.githubusercontent.com/Smapifan/Random-Stories/stories/storys.json";

let STORIES = [];
let currentLang = navigator.language?.startsWith("de") ? "de" : "en";

const container = document.getElementById("container");
const storyView = document.getElementById("storyView");
const storyContent = document.getElementById("storyContent");
const searchInput = document.getElementById("search");

// ------------------------
// INIT
// ------------------------
(async function init() {
  await loadStories();
  renderStories(STORIES);
  setupSearch();
  checkUrlStory();
})();

// ------------------------
// LOAD JSON (no cache)
// ------------------------
async function loadStories() {
  try {
    const res = await fetch(STORY_URL + "?t=" + Date.now(), {
      cache: "no-store",
    });
    STORIES = await res.json();
  } catch (e) {
    console.error("Failed to load stories", e);
    STORIES = [];
  }
}

// ------------------------
// RENDER CARDS
// ------------------------
function renderStories(list) {
  container.innerHTML = "";

  list.forEach((story) => {
    const langData = getLang(story);

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="title">${truncate(langData.title, 25)}</div>
      <div class="meta">
        ${story.author || "Unknown"} • ${story.date || ""}
      </div>
      <div class="desc">
        ${truncate(strip(langData.content), 50)}...
      </div>
    `;

    div.onclick = () => openStory(story.id);

    container.appendChild(div);
  });
}

// ------------------------
// OPEN STORY VIEW
// ------------------------
function openStory(id) {
  const story = STORIES.find((s) => s.id == id);
  if (!story) return;

  const langData = getLang(story);

  container.style.display = "none";
  storyView.style.display = "block";

  storyContent.innerHTML = `
    <h2>${langData.title}</h2>
    <p><b>${story.author || ""}</b> • ${story.date || ""}</p>
    <hr>

    ${story.banner ? `<img src="${story.banner}">` : ""}

    <p>${formatText(langData.content)}</p>
  `;

  history.pushState({}, "", "?story=" + id);
}

// ------------------------
// BACK BUTTON
// ------------------------
document.getElementById("backBtn").onclick = () => {
  storyView.style.display = "none";
  container.style.display = "grid";
  history.pushState({}, "", window.location.pathname);
};

// ------------------------
// SEARCH
// ------------------------
function setupSearch() {
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = STORIES.filter((s) => {
      const langData = getLang(s);
      return (
        langData.title.toLowerCase().includes(q) ||
        langData.content.toLowerCase().includes(q) ||
        (s.author || "").toLowerCase().includes(q)
      );
    });

    renderStories(filtered);
  });
}

// ------------------------
// LANGUAGE SYSTEM (i18n)
// ------------------------
function getLang(story) {
  if (!story.language) return story;

  const found =
    story.language.find((l) => l.locale === currentLang) ||
    story.language.find((l) => l.locale === "en");

  return found || story.language[0];
}

// ------------------------
// URL STORY
// ------------------------
function checkUrlStory() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("story");
  if (id) openStory(id);
}

// ------------------------
// UTIL
// ------------------------
function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) : str;
}

function strip(html) {
  return html.replace(/<[^>]*>?/gm, "");
}

function formatText(text) {
  return text.replace(/\n/g, "<br>");
}

// ------------------------
// THEME TOGGLE
// ------------------------
function toggleTheme() {
  document.body.classList.toggle("light");
}
