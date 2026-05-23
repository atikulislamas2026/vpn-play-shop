/* ================= APK STORE DYNAMIC SYSTEM ================= */

let apps = [];
let currentDownloadLink = "";
let currentAppSlug = "";

/* ================= LOAD APPS FROM apps.json ================= */

async function loadApps() {
  try {
    const response = await fetch("apps.json");
    apps = await response.json();

    renderFeaturedApps(apps);
    renderTopApps(apps);
    openAppFromUrl();
  } catch (error) {
    console.error("apps.json load failed:", error);
    alert("apps.json load হয়নি। VS Code Live Server দিয়ে website চালাও অথবা hosting এ upload করো।");
  }
}

/* ================= RENDER FEATURED APPS ================= */

function renderFeaturedApps(appList) {
  const appGrid = document.getElementById("appGrid");

  if (!appGrid) return;

  appGrid.innerHTML = "";

  appList.forEach(function (app) {
    const card = document.createElement("article");

    card.className = "app-card";
    card.setAttribute("data-category", app.category);
    card.setAttribute("data-name", app.name);

    card.innerHTML = `
      <div class="app-top">
        <img src="${app.icon}" alt="${app.name}" />

        <div class="app-basic">
          <h3>${app.name}</h3>
          <p>${app.subtitle}</p>

          <div class="rating-row">
            <span>${app.rating} ★</span>
            <span>${app.size}</span>
          </div>
        </div>
      </div>

      <p class="app-desc">
        ${app.description}
      </p>

      <div class="app-tags">
        <span>${app.category}</span>
        <span>${app.version}</span>
        <span>${app.downloads}</span>
      </div>

      <button class="install-btn" data-slug="${app.slug}">
        Install
      </button>
    `;

    appGrid.appendChild(card);
  });

  addInstallButtonEvents();
}

/* ================= RENDER TOP APPS ================= */

function renderTopApps(appList) {
  const topList = document.getElementById("topList");

  if (!topList) return;

  const topApps = appList.filter(function (app) {
    return app.top === true;
  });

  topList.innerHTML = "";

  topApps.forEach(function (app, index) {
    const item = document.createElement("div");

    item.className = "top-item";

    item.innerHTML = `
      <span class="rank">${index + 1}</span>

      <img src="${app.icon}" alt="${app.name}" />

      <div>
        <h3>${app.name}</h3>
        <p>${app.category} · ${app.rating} ★ · ${app.downloads} downloads</p>
      </div>

      <button data-download="${app.downloadLink}">
        Download
      </button>
    `;

    topList.appendChild(item);
  });

  addTopDownloadEvents();
}

/* ================= BUTTON EVENTS ================= */

function addInstallButtonEvents() {
  const buttons = document.querySelectorAll(".install-btn");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const slug = button.getAttribute("data-slug");

      const app = apps.find(function (item) {
        return item.slug === slug;
      });

      if (app) {
        openAppModal(app);
      }
    });
  });
}

function addTopDownloadEvents() {
  const buttons = document.querySelectorAll("#topList button");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const downloadLink = button.getAttribute("data-download");
      quickDownload(downloadLink);
    });
  });
}

/* ================= OPEN APP MODAL ================= */

function openAppModal(app) {
  currentAppSlug = app.slug;
  currentDownloadLink = app.downloadLink;

  document.getElementById("modalName").innerText = app.name;
  document.getElementById("modalCategory").innerText = app.category;
  document.getElementById("modalVersion").innerText = app.version + " - Latest APK version";
  document.getElementById("modalSize").innerText = app.size;
  document.getElementById("modalRating").innerText = app.rating + " ★";
  document.getElementById("modalDownloads").innerText = app.downloads;
  document.getElementById("modalDescription").innerText = app.description;
  document.getElementById("modalIcon").src = app.icon;

  const modalDownloadBtn = document.getElementById("modalDownloadBtn");
  if (modalDownloadBtn) {
    modalDownloadBtn.innerText = "Download APK";
  }

  renderModalScreenshots(app.screenshots);

  document.getElementById("appModal").classList.add("active");

  const newUrl = window.location.pathname + "?app=" + app.slug;
  window.history.pushState({ app: app.slug }, "", newUrl);
}

/* ================= MODAL SCREENSHOTS ================= */

function renderModalScreenshots(screenshots) {
  const screenshotBox = document.getElementById("modalScreenshots");

  if (!screenshotBox) return;

  screenshotBox.innerHTML = "";

  if (!screenshots || screenshots.length === 0) {
    screenshotBox.innerHTML = `
      <div class="screenshot-card">No Screenshot</div>
    `;
    return;
  }

  screenshots.forEach(function (screenshot, index) {
    const div = document.createElement("div");
    div.className = "screenshot-card image-card";

    div.innerHTML = `
      <img src="${screenshot}" alt="Screenshot ${index + 1}">
    `;

    screenshotBox.appendChild(div);
  });
}

/* ================= CLOSE APP MODAL ================= */

function closeAppModal() {
  document.getElementById("appModal").classList.remove("active");

  const cleanUrl = window.location.pathname;
  window.history.pushState({}, "", cleanUrl);
}

/* ================= DOWNLOAD APK ================= */

function downloadAPK() {
  if (!currentDownloadLink) {
    alert("Download link not found.");
    return;
  }

  const modalDownloadBtn = document.getElementById("modalDownloadBtn");

  if (modalDownloadBtn) {
    modalDownloadBtn.innerText = "Downloading...";
  }

  const link = document.createElement("a");
  link.href = currentDownloadLink;
  link.download = "";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(function () {
    if (modalDownloadBtn) {
      modalDownloadBtn.innerText = "Open Downloaded APK";
    }

    alert(
      "Download started.\n\nDownload complete হলে browser notification বা Downloads folder থেকে APK file open করুন।\nতারপর Android install prompt থেকে Install চাপুন।"
    );
  }, 900);
}

/* ================= QUICK DOWNLOAD ================= */

function quickDownload(downloadLink) {
  if (!downloadLink) {
    alert("Download link not found.");
    return;
  }

  const link = document.createElement("a");
  link.href = downloadLink;
  link.download = "";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(function () {
    alert(
      "Download started.\n\nDownload complete হলে Downloads folder বা browser notification থেকে APK open করুন।"
    );
  }, 700);
}

/* ================= FILTER CATEGORY ================= */

function filterCategory(category, clickedButton) {
  const cards = document.querySelectorAll(".app-card");
  const buttons = document.querySelectorAll(".category-btn");

  buttons.forEach(function (btn) {
    btn.classList.remove("active");
  });

  if (clickedButton) {
    clickedButton.classList.add("active");
  }

  cards.forEach(function (card) {
    const cardCategory = card.getAttribute("data-category");

    if (category === "all" || cardCategory === category) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

/* ================= DESKTOP SEARCH ================= */

function searchApps() {
  const input = document.getElementById("searchInput");
  const searchValue = input.value.toLowerCase().trim();

  runSearch(searchValue);
}

/* ================= MOBILE SEARCH ================= */

function mobileSearchApps() {
  const input = document.getElementById("mobileSearchInput");
  const searchValue = input.value.toLowerCase().trim();

  runSearch(searchValue);
}

/* ================= SEARCH COMMON FUNCTION ================= */

function runSearch(searchValue) {
  const cards = document.querySelectorAll(".app-card");
  const buttons = document.querySelectorAll(".category-btn");

  buttons.forEach(function (btn) {
    btn.classList.remove("active");
  });

  if (buttons[0]) {
    buttons[0].classList.add("active");
  }

  cards.forEach(function (card) {
    const appName = card.getAttribute("data-name").toLowerCase();
    const category = card.getAttribute("data-category").toLowerCase();
    const text = card.innerText.toLowerCase();

    if (
      appName.includes(searchValue) ||
      category.includes(searchValue) ||
      text.includes(searchValue)
    ) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

/* ================= DIRECT APP LINK SYSTEM ================= */

function openAppFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const appSlug = params.get("app");

  if (!appSlug) return;

  const app = apps.find(function (item) {
    return item.slug === appSlug;
  });

  if (app) {
    openAppModal(app);
  }
}

/* ================= MODAL OUTSIDE CLICK CLOSE ================= */

document.getElementById("appModal").addEventListener("click", function (event) {
  if (event.target.id === "appModal") {
    closeAppModal();
  }
});

/* ================= ESC KEY CLOSE MODAL ================= */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeAppModal();
  }
});

/* ================= BROWSER BACK BUTTON SUPPORT ================= */

window.addEventListener("popstate", function () {
  const modal = document.getElementById("appModal");

  if (modal.classList.contains("active")) {
    modal.classList.remove("active");
  }
});

/* ================= PAGE LOAD ================= */

window.addEventListener("load", function () {
  loadApps();
});


/* ================= PREMIUM SEARCH RESULT SYSTEM ================= */

function runSearch(searchValue) {
  searchValue = searchValue.toLowerCase().trim();

  if (!searchValue) {
    showDefaultHome();
    return;
  }

  const matchedApps = apps
    .map(function (app) {
      return {
        app: app,
        score: getSearchScore(app, searchValue)
      };
    })
    .filter(function (item) {
      return item.score > 0;
    })
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .map(function (item) {
      return item.app;
    });

  showSearchResults(searchValue, matchedApps);
}

function getSearchScore(app, searchValue) {
  const name = app.name.toLowerCase();
  const category = app.category.toLowerCase();
  const subtitle = app.subtitle.toLowerCase();
  const description = app.description.toLowerCase();
  const slug = app.slug.toLowerCase();

  let score = 0;

  if (name === searchValue) score += 100;
  if (name.startsWith(searchValue)) score += 80;
  if (name.includes(searchValue)) score += 60;
  if (slug.includes(searchValue)) score += 45;
  if (category.includes(searchValue)) score += 35;
  if (subtitle.includes(searchValue)) score += 25;
  if (description.includes(searchValue)) score += 10;

  const words = searchValue.split(" ");

  words.forEach(function (word) {
    if (word.length < 2) return;

    if (name.includes(word)) score += 15;
    if (category.includes(word)) score += 8;
    if (subtitle.includes(word)) score += 6;
    if (description.includes(word)) score += 3;
  });

  return score;
}

function showSearchResults(searchValue, matchedApps) {
  const heroSection = document.getElementById("heroSection");
  const searchResultsSection = document.getElementById("searchResultsSection");
  const topSearchResult = document.getElementById("topSearchResult");
  const moreSearchResults = document.getElementById("moreSearchResults");
  const searchTitle = document.getElementById("searchTitle");
  const searchSubtitle = document.getElementById("searchSubtitle");
  const moreResultsTitle = document.getElementById("moreResultsTitle");

  if (heroSection) {
    heroSection.style.display = "none";
  }

  if (searchResultsSection) {
    searchResultsSection.classList.add("active");
  }

  searchTitle.innerText = 'Search results for "' + searchValue + '"';
  searchSubtitle.innerText = matchedApps.length + " app found";

  topSearchResult.innerHTML = "";
  moreSearchResults.innerHTML = "";

  if (matchedApps.length === 0) {
    moreResultsTitle.style.display = "none";

    topSearchResult.innerHTML =
      '<div class="no-search-result">' +
      "<h3>No app found</h3>" +
      "<p>Try searching another VPN or app name.</p>" +
      "</div>";

    scrollToSearchSection();
    return;
  }

  const bestApp = matchedApps[0];
  const otherApps = matchedApps.slice(1);

  topSearchResult.innerHTML =
    '<div class="top-search-card">' +
    '<img src="' + bestApp.icon + '" alt="' + bestApp.name + '">' +
    '<div class="top-search-info">' +
    "<h3>" + bestApp.name + "</h3>" +
    "<p>" + bestApp.description + "</p>" +
    '<div class="top-search-meta">' +
    "<span>" + bestApp.category + "</span>" +
    "<span>" + bestApp.rating + " ★</span>" +
    "<span>" + bestApp.size + "</span>" +
    "<span>" + bestApp.downloads + "</span>" +
    "</div>" +
    "</div>" +
    '<div class="top-search-actions">' +
    '<button onclick="openAppBySlug(\'' + bestApp.slug + '\')">View / Download</button>' +
    "</div>" +
    "</div>";

  if (otherApps.length === 0) {
    moreResultsTitle.style.display = "none";
  } else {
    moreResultsTitle.style.display = "block";
  }

  otherApps.forEach(function (app) {
    const item = document.createElement("div");
    item.className = "search-list-item";

    item.innerHTML =
      '<img src="' + app.icon + '" alt="' + app.name + '">' +
      '<div class="search-list-info">' +
      "<h3>" + app.name + "</h3>" +
      "<p>" + app.subtitle + "</p>" +
      '<div class="search-list-meta">' +
      "<span>" + app.category + "</span>" +
      "<span>" + app.rating + " ★</span>" +
      "<span>" + app.size + "</span>" +
      "<span>" + app.downloads + "</span>" +
      "</div>" +
      "</div>" +
      '<button class="search-list-btn" onclick="openAppBySlug(\'' + app.slug + '\')">View</button>';

    moreSearchResults.appendChild(item);
  });

  scrollToSearchSection();
}

function openAppBySlug(slug) {
  const app = apps.find(function (item) {
    return item.slug === slug;
  });

  if (app) {
    openAppModal(app);
  }
}

function showDefaultHome() {
  const heroSection = document.getElementById("heroSection");
  const searchResultsSection = document.getElementById("searchResultsSection");

  if (heroSection) {
    heroSection.style.display = "";
  }

  if (searchResultsSection) {
    searchResultsSection.classList.remove("active");
  }

  const cards = document.querySelectorAll(".app-card");

  cards.forEach(function (card) {
    card.classList.remove("hidden");
  });
}

function clearSearchResults() {
  const desktopInput = document.getElementById("searchInput");
  const mobileInput = document.getElementById("mobileSearchInput");

  if (desktopInput) {
    desktopInput.value = "";
  }

  if (mobileInput) {
    mobileInput.value = "";
  }

  showDefaultHome();
}

function scrollToSearchSection() {
  const searchResultsSection = document.getElementById("searchResultsSection");

  if (searchResultsSection) {
    searchResultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}




/* ================= SHARE CURRENT APP ================= */

function shareCurrentApp() {
  if (!currentAppSlug) {
    alert("App link not found.");
    return;
  }

  const app = apps.find(function (item) {
    return item.slug === currentAppSlug;
  });

  if (!app) {
    alert("App data not found.");
    return;
  }

  const appLink = window.location.origin + window.location.pathname + "?app=" + app.slug;

  const shareTitle = app.name;
  const shareText =
    app.name +
    " - Download Android VPN APK from ATK VPN Shop.\n\n" +
    "Version: " + app.version + "\n" +
    "Size: " + app.size + "\n" +
    "Rating: " + app.rating + "★\n\n" +
    "Download Link:";

  if (navigator.share) {
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: appLink
    }).catch(function () {
      copyAppLink(appLink);
    });
  } else {
    copyAppLink(appLink);
  }
}

function copyAppLink(appLink) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(appLink).then(function () {
      alert("App link copied:\n" + appLink);
    }).catch(function () {
      fallbackCopyText(appLink);
    });
  } else {
    fallbackCopyText(appLink);
  }
}

function fallbackCopyText(text) {
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  alert("App link copied:\n" + text);
}