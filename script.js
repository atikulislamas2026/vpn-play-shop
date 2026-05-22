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