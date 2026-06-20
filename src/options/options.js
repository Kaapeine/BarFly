const capacityInput = document.getElementById("capacity");
const form = document.getElementById("settings-form");
const rebuildButton = document.getElementById("rebuild");
const status = document.getElementById("status");
const seedButton = document.getElementById("seed");
const resetButton = document.getElementById("reset");
const seedStatus = document.getElementById("seed-status");
const clearAllButton = document.getElementById("clear-all");
const pauseToggle = document.getElementById("pause-toggle");

const stateDisplay = document.getElementById("state-display");

async function load() {
  const settings = await browser.runtime.sendMessage({ type: "getSettings" });
  capacityInput.value = settings.capacity;
  await refreshState();
}

async function refreshState() {
  const stored = await browser.storage.local.get("state");
  stateDisplay.textContent = JSON.stringify(stored.state ?? "null", null, 2);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await browser.runtime.sendMessage({ type: "setCapacity", capacity: Number(capacityInput.value) });
  status.textContent = "Saved.";
  await refreshState();
});

rebuildButton.addEventListener("click", async () => {
  await browser.runtime.sendMessage({ type: "rebuild" });
  status.textContent = "Rebuilt.";
  await refreshState();
});

seedButton.addEventListener("click", async () => {
  seedButton.disabled = true;
  seedStatus.textContent = "Creating bookmarks...";
  seedStatus.style.color = "#8e8e93";

  try {
    const TOOLBAR_ID = "toolbar_____";
    const OTHER_ID = "unfiled_____";

    // Clear toolbar (leave separator if it exists)
    const toolbar = await browser.bookmarks.getChildren(TOOLBAR_ID);
    for (const b of toolbar) {
      if (b.type === "separator") continue;
      await browser.bookmarks.remove(b.id);
    }

    // Create pinned bookmarks
    const pinned = [
      { title: "Gmail",    url: "https://mail.google.com" },
      { title: "Calendar", url: "https://calendar.google.com" },
      { title: "Drive",    url: "https://drive.google.com" },
    ];
    for (const bm of pinned) {
      await browser.bookmarks.create({ parentId: TOOLBAR_ID, title: bm.title, url: bm.url });
    }

    // Create a folder of bookmarks elsewhere
    const folder = await browser.bookmarks.create({
      parentId: OTHER_ID,
      title: "Read Later",
      type: "folder",
    });

    const toVisit = [
      { title: "Wikipedia",        url: "https://en.wikipedia.org" },
      { title: "GitHub",           url: "https://github.com" },
      { title: "MDN",              url: "https://developer.mozilla.org" },
      { title: "Hacker News",      url: "https://news.ycombinator.com" },
      { title: "Reddit",           url: "https://reddit.com" },
      { title: "Lobsters",         url: "https://lobste.rs" },
      { title: "Dev.to",           url: "https://dev.to" },
      { title: "Stack Overflow",   url: "https://stackoverflow.com" },
      { title: "CSS Tricks",       url: "https://css-tricks.com" },
      { title: "YouTube",          url: "https://youtube.com" },
    ];

    for (const bm of toVisit) {
      await browser.bookmarks.create({ parentId: folder.id, title: bm.title, url: bm.url });
    }

    // Clear BarFly state so install re-runs on next startup
    await browser.storage.local.clear();
    await refreshState();

    seedStatus.textContent = `✅ Created ${pinned.length} pinned + ${toVisit.length} bookmarks. Reload BarFly (about:debugging → Reload) to see the separator.`;
    seedStatus.style.color = "#34c759";
  } catch (err) {
    seedStatus.textContent = `Error: ${err.message}`;
    seedStatus.style.color = "#ff3b30";
  } finally {
    seedButton.disabled = false;
  }
});

resetButton.addEventListener("click", async () => {
  resetButton.disabled = true;
  try {
    await browser.storage.local.clear();
    await refreshState();
    seedStatus.textContent = "✅ BarFly state cleared. Reload the extension (about:debugging → Reload) for a fresh start.";
    seedStatus.style.color = "#34c759";
  } catch (err) {
    seedStatus.textContent = `Error: ${err.message}`;
    seedStatus.style.color = "#ff3b30";
  } finally {
    resetButton.disabled = false;
  }
});

clearAllButton.addEventListener("click", async () => {
  if (!confirm("Delete ALL bookmarks? This cannot be undone.")) return;
  clearAllButton.disabled = true;
  seedStatus.textContent = "Deleting all bookmarks...";
  seedStatus.style.color = "#8e8e93";

  try {
    const tree = await browser.bookmarks.getTree();
    const roots = tree[0]?.children ?? [];
    for (const root of roots) {
      for (const child of root.children ?? []) {
        await browser.bookmarks.removeTree(child.id);
      }
    }
    await browser.storage.local.clear();
    await refreshState();
    seedStatus.textContent = "✅ All bookmarks deleted. Reload BarFly for a clean start.";
    seedStatus.style.color = "#34c759";
  } catch (err) {
    seedStatus.textContent = `Error: ${err.message}`;
    seedStatus.style.color = "#ff3b30";
  } finally {
    clearAllButton.disabled = false;
  }
});

pauseToggle.addEventListener("change", async () => {
  await browser.runtime.sendMessage({ type: "setPaused", paused: pauseToggle.checked });
  seedStatus.textContent = pauseToggle.checked ? "⏸️ Event handlers paused." : "▶️ Event handlers active.";
  seedStatus.style.color = "#8e8e93";
});

load();